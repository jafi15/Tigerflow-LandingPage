// Deno Edge Function entry point. Requires the Deno runtime (not available
// in this Node-based sandbox, so this file itself cannot be executed or unit
// tested here) — the actual request/validation/rate-limit logic it calls
// into lives in handler.ts, validation.ts, rateLimit.ts, env.ts,
// publishableKey.ts and leadRpc.ts, which ARE covered by the Vitest suite.
//
// Auth model: verify_jwt is OFF in config.toml because the current
// Publishable/Secret keys are not JWTs (see config.toml for the full
// rationale). handler.ts enforces its own caller check instead — a valid
// Publishable Key on the apikey header (see publishableKey.ts for why this
// is NOT a spam/abuse control). Supabase also offers an official wrapper
// for this exact check, `withSupabase({ auth: "publishable" }, ...)` from
// `npm:@supabase/server`, which is the officially documented mechanism for
// gating a function on the current key system. This project implements the
// check itself in handler.ts instead, deliberately: this sandbox has no
// Deno runtime to run and verify that wrapper's actual behavior, and
// claiming it was "tested" without being able to execute it would not be
// honest. The manual check is drop-in-replaceable by the official wrapper
// once it can be smoke-tested against a real/local Supabase Edge Runtime —
// see the project report for this trade-off.
//
// Either way, this is a client-channel check, not a security boundary on
// its own: the real security boundary stays entirely server-side (RLS +
// REVOKE on the lead tables and RPC functions, explicit service_role
// grants, input validation, rate limiting).
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleSubmitLead } from "./handler.ts";
import { resolvePublishableKeys, resolveSecretKey } from "./env.ts";
import { createInsertLead } from "./leadRpc.ts";
import {
  RATE_LIMIT_MAX_PER_WINDOW,
  RATE_LIMIT_RETENTION_MS,
  RATE_LIMIT_WINDOW_MS,
  createCheckRateLimit,
} from "./rateLimit.ts";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://tigerflow.de";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// Server-side only — bypasses RLS, must never reach the browser. Resolved
// via the current SUPABASE_SECRET_KEYS (JSON, keyed by name) convention,
// with a SUPABASE_SECRET_KEY fallback for local development.
const SUPABASE_SECRET_KEY = resolveSecretKey((name) => Deno.env.get(name));
// Every currently-valid Publishable Key (supports rotation).
const VALID_PUBLISHABLE_KEYS = resolvePublishableKeys((name) => Deno.env.get(name));
// A dedicated secret for hashing client IPs for rate limiting — intentionally
// separate from the database Secret Key so either can be rotated
// independently.
const RATE_LIMIT_HASH_SECRET = Deno.env.get("RATE_LIMIT_HASH_SECRET");

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL must be set");
}
if (!RATE_LIMIT_HASH_SECRET) {
  throw new Error("RATE_LIMIT_HASH_SECRET must be set as a function secret");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const insertLead = createInsertLead(supabase);
const checkRateLimit = createCheckRateLimit(supabase, {
  hashSecret: RATE_LIMIT_HASH_SECRET,
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
  retentionMs: RATE_LIMIT_RETENTION_MS,
});

Deno.serve((req) =>
  handleSubmitLead(req, {
    insertLead,
    checkRateLimit,
    validPublishableKeys: VALID_PUBLISHABLE_KEYS,
    allowedOrigin: ALLOWED_ORIGIN,
  })
);
