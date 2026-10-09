// Deno- and Node-compatible pure validation logic for the submit-lead Edge
// Function. No Deno-specific APIs here on purpose, so this module is also
// exercised directly by the project's existing Vitest suite.

export const IMPROVEMENT_FOCUS_VALUES = ["webdesign", "seo", "inquiries", "automation"] as const;
export const CURRENT_SETUP_VALUES = ["none", "existing", "tools", "unclear"] as const;
export const PRIMARY_GOAL_VALUES = ["clarity", "visibility", "response", "efficiency"] as const;
export const START_TIMEFRAME_VALUES = ["soon", "one-to-three", "three-plus", "exploring"] as const;
export const LOCALE_VALUES = ["de"] as const;

export const MAX_REQUEST_BYTES = 4096;
export const MIN_SUBMIT_MS = 1500;
export const MAX_SUBMIT_AGE_MS = 60 * 60 * 1000;
export const EMAIL_MAX_LENGTH = 254;
export const CONTACT_NAME_MAX_LENGTH = 120;
export const COMPANY_MAX_LENGTH = 200;
export const MESSAGE_MAX_LENGTH = 1000;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ValidationErrorCode = "invalid_json" | "payload_too_large" | "invalid_value";

export class LeadValidationError extends Error {
  code: ValidationErrorCode;

  constructor(code: ValidationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// Mirrors RECOMMENDATIONS in src/components/ProjectCheck.jsx exactly. Fixed,
// server-owned mapping — never derived from a score and never overridden by
// a client-supplied value.
const RECOMMENDATION_BY_FOCUS: Record<string, string> = {
  webdesign: "webdesign",
  seo: "seo",
  inquiries: "inquiries",
  automation: "automation",
};
const DEFAULT_RECOMMENDATION_KEY = "webdesign";

export function resolveRecommendationKey(improvementFocus: string): string {
  return RECOMMENDATION_BY_FOCUS[improvementFocus] ?? DEFAULT_RECOMMENDATION_KEY;
}

function assertOneOf(value: unknown, allowed: readonly string[], field: string): string {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new LeadValidationError("invalid_value", `invalid ${field}`);
  }
  return value;
}

export function isValidRequestId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

// Required. Trims and lowercases before validating length/format — the
// stored value must already be in this normalized form (mirrors the
// leads_email_normalized DB constraint).
export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    throw new LeadValidationError("invalid_value", "email is required");
  }
  const normalized = value.trim().toLowerCase();
  if (
    normalized.length === 0 ||
    normalized.length > EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(normalized)
  ) {
    throw new LeadValidationError("invalid_value", "invalid email");
  }
  return normalized;
}

// Optional, trimmed, length-limited string (contact_name, company,
// message). Empty after trimming — or missing entirely — normalizes to
// null rather than an empty string.
export function normalizeOptionalText(value: unknown, maxLength: number, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new LeadValidationError("invalid_value", `invalid ${field}`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) {
    throw new LeadValidationError("invalid_value", `${field} too long`);
  }
  return trimmed;
}

export interface ValidatedProjectCheckSubmission {
  request_id: string;
  improvement_focus: string;
  current_setup: string;
  primary_goal: string;
  start_timeframe: string;
  recommendation_key: string;
  path: string;
  locale: string;
  email: string;
  contact_name: string | null;
  company: string | null;
  message: string | null;
}

export function validateProjectCheckPayload(body: unknown): ValidatedProjectCheckSubmission {
  if (typeof body !== "object" || body === null) {
    throw new LeadValidationError("invalid_value", "body must be an object");
  }
  const input = body as Record<string, unknown>;

  if (!isValidRequestId(input.request_id)) {
    throw new LeadValidationError("invalid_value", "invalid request_id");
  }

  const improvement_focus = assertOneOf(input.improvement_focus, IMPROVEMENT_FOCUS_VALUES, "improvement_focus");
  const current_setup = assertOneOf(input.current_setup, CURRENT_SETUP_VALUES, "current_setup");
  const primary_goal = assertOneOf(input.primary_goal, PRIMARY_GOAL_VALUES, "primary_goal");
  const start_timeframe = assertOneOf(input.start_timeframe, START_TIMEFRAME_VALUES, "start_timeframe");
  const locale = assertOneOf(input.locale, LOCALE_VALUES, "locale");

  if (typeof input.path !== "string" || !input.path.startsWith("/") || input.path.length > 200) {
    throw new LeadValidationError("invalid_value", "invalid path");
  }

  const email = normalizeEmail(input.email);
  const contact_name = normalizeOptionalText(input.contact_name, CONTACT_NAME_MAX_LENGTH, "contact_name");
  const company = normalizeOptionalText(input.company, COMPANY_MAX_LENGTH, "company");
  const message = normalizeOptionalText(input.message, MESSAGE_MAX_LENGTH, "message");

  return {
    request_id: input.request_id,
    improvement_focus,
    current_setup,
    primary_goal,
    start_timeframe,
    recommendation_key: resolveRecommendationKey(improvement_focus),
    path: input.path,
    locale,
    email,
    contact_name,
    company,
    message,
  };
}

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const value = body?.honeypot;
  return typeof value === "string" && value.length > 0;
}

export type TimingResult = "ok" | "too_fast" | "expired";

// "too_fast" is an unambiguous bot/tamper signal (no human completes a
// 4-step quiz in well under a second, and a negative elapsed time means the
// client's started_at is in the future) — safe to treat like the honeypot
// and silently drop. "expired" covers a missing/invalid timestamp or one
// that is implausibly old: that can happen to an honest visitor (a stale
// tab, a long-idle session) and must NOT be answered with a fake success,
// since nothing gets stored for it.
export function evaluateSubmissionTiming(startedAt: unknown, now: number): TimingResult {
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return "expired";
  const elapsed = now - startedAt;
  if (elapsed < 0) return "too_fast";
  if (elapsed < MIN_SUBMIT_MS) return "too_fast";
  if (elapsed > MAX_SUBMIT_AGE_MS) return "expired";
  return "ok";
}

interface MinimalRequest {
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
}

// Reads the body up to maxBytes without ever trusting Content-Length alone —
// a forged or missing header must not bypass the limit.
export async function readJsonWithLimit(req: MinimalRequest, maxBytes: number): Promise<unknown> {
  const declaredLength = req.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > maxBytes) {
    throw new LeadValidationError("payload_too_large", "declared content-length exceeds limit");
  }
  if (!req.body) {
    throw new LeadValidationError("invalid_json", "missing body");
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        throw new LeadValidationError("payload_too_large", "body exceeds limit");
      }
      chunks.push(value);
    }
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder().decode(bytes);
  try {
    return JSON.parse(text);
  } catch {
    throw new LeadValidationError("invalid_json", "invalid json");
  }
}
