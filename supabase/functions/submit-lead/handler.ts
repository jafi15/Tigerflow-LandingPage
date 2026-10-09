// Deno- and Node-compatible request handler for submit-lead. Contains no
// Deno-specific APIs (no `Deno.*`, no `npm:` imports) so it is testable
// under the project's existing Vitest/Node setup. index.ts wires this up to
// the real Deno.serve + Supabase client using the Secret Key.

import {
  LeadValidationError,
  MAX_REQUEST_BYTES,
  evaluateSubmissionTiming,
  isHoneypotTriggered,
  readJsonWithLimit,
  validateProjectCheckPayload,
} from "./validation.ts";
import { isValidPublishableKey } from "./publishableKey.ts";

// supabase-js's browser client sends these on every request; a real browser
// preflight must be told it may send them, or the actual POST never leaves
// the browser at all.
const ALLOWED_REQUEST_HEADERS = "authorization, x-client-info, apikey, content-type";

export interface InsertLeadInput {
  request_id: string;
  email: string;
  contact_name: string | null;
  company: string | null;
  path: string;
  locale: string;
  submission: {
    improvement_focus: string;
    current_setup: string;
    primary_goal: string;
    start_timeframe: string;
    recommendation_key: string;
    message: string | null;
  };
}

export type InsertLead = (input: InsertLeadInput) => Promise<void>;

// Resolves to true when the caller may proceed, false when the window's
// quota is exhausted. Receives a pseudonymizable client IP (or null if none
// was available) and the current time — never a raw identifier to persist.
export type CheckRateLimit = (clientIp: string | null, now: number) => Promise<boolean>;

export interface HandleSubmitLeadOptions {
  insertLead: InsertLead;
  checkRateLimit: CheckRateLimit;
  // Every currently-valid Publishable Key for this project (plural to
  // support key rotation). Required on the apikey header for every real
  // request — see publishableKey.ts for why this is NOT a spam/abuse
  // control, only a Supabase client-channel check.
  validPublishableKeys: readonly string[];
  allowedOrigin: string;
  now?: () => number;
}

function extractClientIp(req: Request): string | null {
  // Prefer a header set close to the real edge (harder to spoof from the
  // client) and fall back to the conventional, documented Supabase header.
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? null;

  return null;
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  origin: string | null,
  allowedOrigin: string
): Response {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin === allowedOrigin) {
    headers.set("access-control-allow-origin", allowedOrigin);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export async function handleSubmitLead(req: Request, options: HandleSubmitLeadOptions): Promise<Response> {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    // CORS preflight is a browser-side convenience only, never a security
    // boundary — the actual POST handler below applies no Origin check.
    const headers = new Headers();
    if (origin === options.allowedOrigin) {
      headers.set("access-control-allow-origin", options.allowedOrigin);
      headers.set("access-control-allow-methods", "POST, OPTIONS");
      headers.set("access-control-allow-headers", ALLOWED_REQUEST_HEADERS);
    }
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" }, origin, options.allowedOrigin);
  }

  // Publishable Key gate — cheapest check, runs first. This is NOT a
  // spam/abuse control (see publishableKey.ts): it only confirms the caller
  // is using Supabase's intended client channel.
  if (!isValidPublishableKey(req.headers.get("apikey"), options.validPublishableKeys)) {
    return jsonResponse(401, { ok: false, error: "unauthorized" }, origin, options.allowedOrigin);
  }

  const now = (options.now ?? Date.now)();

  // Rate limiting counts every POST attempt, independent of payload
  // validity, to bound total load/abuse volume as early as possible.
  const clientIp = extractClientIp(req);
  let withinRateLimit: boolean;
  try {
    withinRateLimit = await options.checkRateLimit(clientIp, now);
  } catch {
    // createCheckRateLimit (rateLimit.ts) already fails open internally;
    // this is a second, independent guard in case a differently-implemented
    // CheckRateLimit throws — no exception may ever escape this handler.
    withinRateLimit = true;
  }
  if (!withinRateLimit) {
    return jsonResponse(429, { ok: false, error: "rate_limited" }, origin, options.allowedOrigin);
  }

  let body: unknown;
  try {
    body = await readJsonWithLimit(req, MAX_REQUEST_BYTES);
  } catch (err) {
    const status = err instanceof LeadValidationError && err.code === "payload_too_large" ? 413 : 400;
    return jsonResponse(status, { ok: false, error: "invalid_request" }, origin, options.allowedOrigin);
  }

  const record = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  // The honeypot field is invisible and unreachable by Tab — a real visitor
  // filling the form normally cannot trigger it, so a bot gets no feedback
  // about why it failed: nothing is stored, and the response is
  // indistinguishable from a real success.
  if (isHoneypotTriggered(record)) {
    return jsonResponse(200, { ok: true }, origin, options.allowedOrigin);
  }

  // "too_fast" and "expired" both mean nothing was stored, and both are
  // reachable by a genuine visitor — e.g. browser autofill populating the
  // email field followed by an immediate click can land well under
  // MIN_SUBMIT_MS, and a stale tab/long-idle session can exceed
  // MAX_SUBMIT_AGE_MS. A fake success would be dishonest either way: report
  // a real, generic, retryable error so the visitor can just try again
  // (the same request_id is safe to resubmit — see create_project_check_lead).
  const timing = evaluateSubmissionTiming(record.started_at, now);
  if (timing !== "ok") {
    return jsonResponse(400, { ok: false, error: "submission_expired" }, origin, options.allowedOrigin);
  }

  let validated;
  try {
    validated = validateProjectCheckPayload(record);
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_request" }, origin, options.allowedOrigin);
  }

  try {
    await options.insertLead({
      request_id: validated.request_id,
      email: validated.email,
      contact_name: validated.contact_name,
      company: validated.company,
      path: validated.path,
      locale: validated.locale,
      submission: {
        improvement_focus: validated.improvement_focus,
        current_setup: validated.current_setup,
        primary_goal: validated.primary_goal,
        start_timeframe: validated.start_timeframe,
        recommendation_key: validated.recommendation_key,
        message: validated.message,
      },
    });
  } catch {
    // Never leak DB/internal error details to the client.
    return jsonResponse(500, { ok: false, error: "server_error" }, origin, options.allowedOrigin);
  }

  return jsonResponse(200, { ok: true }, origin, options.allowedOrigin);
}
