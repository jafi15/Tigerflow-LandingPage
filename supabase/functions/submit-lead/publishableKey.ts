// Enforces "no request without a valid Publishable Key" on the apikey
// header. This is an identity/billing-plane gate, NOT a spam/abuse control:
// a Publishable Key is, by Supabase's own design, meant to be shipped to and
// readable from every browser that loads the site — anyone can read it out
// of the page's own network requests or JS bundle. Rejecting requests
// without one only confirms the caller is using Supabase's intended client
// channel; it proves nothing about intent and must never be treated as a
// defense against spam, bots, or abuse. That job belongs entirely to the
// honeypot and timing checks (validation.ts) and rate limiting
// (rateLimit.ts) — this check runs independently of, and in addition to,
// those.
export function isValidPublishableKey(providedKey: string | null, validKeys: readonly string[]): boolean {
  if (!providedKey) return false;
  return validKeys.includes(providedKey);
}
