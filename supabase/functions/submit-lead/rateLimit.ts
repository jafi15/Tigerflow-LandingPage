// Deno- and Node-compatible rate-limit logic. Uses Web Crypto (available in
// both Deno and modern Node) to turn a client IP into a one-way, keyed
// pseudonym — the raw IP is never written to the database, only this hash
// plus a coarse time bucket and a small counter.

export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_MAX_PER_WINDOW = 5; // generous for a small B2B marketing site
// 3x window. Rows older than this are deleted lazily on every call here —
// but that alone does not guarantee this bound when traffic stops entirely.
// A scheduled pg_cron job (see the matching migration) provides the actual
// guarantee, running independently of traffic: worst case under zero
// traffic is this retention plus one cron interval (~45 minutes total), not
// a flat 30.
export const RATE_LIMIT_RETENTION_MS = 30 * 60 * 1000;

export async function hashClientIdentifier(ip: string, secret: string): Promise<string> {
  const normalized = ip.trim().toLowerCase();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function currentWindowStart(now: number, windowMs: number): Date {
  return new Date(Math.floor(now / windowMs) * windowMs);
}

interface RpcResult {
  data: unknown;
  error: { message: string } | null;
}

export interface RateLimitRpcClient {
  rpc(fn: string, args: Record<string, unknown>): Promise<RpcResult>;
}

export type CheckRateLimit = (clientIp: string | null, now: number) => Promise<boolean>;

export interface CreateCheckRateLimitOptions {
  hashSecret: string;
  windowMs: number;
  maxPerWindow: number;
  retentionMs: number;
}

export function createCheckRateLimit(
  client: RateLimitRpcClient,
  options: CreateCheckRateLimitOptions
): CheckRateLimit {
  return async (clientIp, now) => {
    // No identifying signal at all — fail open rather than block genuine
    // traffic on a missing proxy header.
    if (!clientIp) return true;

    try {
      const clientHash = await hashClientIdentifier(clientIp, options.hashSecret);
      const windowStart = currentWindowStart(now, options.windowMs);
      const retentionBefore = new Date(now - options.retentionMs);

      const { data, error } = await client.rpc("check_rate_limit", {
        p_client_hash: clientHash,
        p_window_start: windowStart.toISOString(),
        p_max_per_window: options.maxPerWindow,
        p_retention_before: retentionBefore.toISOString(),
      });

      // A rate-limit infrastructure failure must not block a genuine lead —
      // fail open rather than silently dropping real submissions.
      if (error) return true;

      return data === true;
    } catch {
      // Any unexpected failure — hashing (crypto.subtle), the RPC call
      // rejecting outright rather than returning {error}, or anything else
      // — must never escape as an uncontrolled exception. Fail open, same
      // as the {error} case above.
      return true;
    }
  };
}
