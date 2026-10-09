import { describe, expect, it, vi } from "vitest";
import {
  RATE_LIMIT_MAX_PER_WINDOW,
  RATE_LIMIT_RETENTION_MS,
  RATE_LIMIT_WINDOW_MS,
  createCheckRateLimit,
  currentWindowStart,
  hashClientIdentifier,
} from "./rateLimit.ts";

describe("hashClientIdentifier", () => {
  it("never returns the raw IP and is deterministic for the same ip+secret", async () => {
    const a = await hashClientIdentifier("203.0.113.42", "secret-1");
    const b = await hashClientIdentifier("203.0.113.42", "secret-1");
    expect(a).toBe(b);
    expect(a).not.toContain("203.0.113.42");
    expect(a).toMatch(/^[0-9a-f]{64}$/); // hex-encoded SHA-256 HMAC
  });

  it("produces a different hash for a different secret (keyed, not a plain hash)", async () => {
    const a = await hashClientIdentifier("203.0.113.42", "secret-1");
    const b = await hashClientIdentifier("203.0.113.42", "secret-2");
    expect(a).not.toBe(b);
  });

  it("produces a different hash for a different ip", async () => {
    const a = await hashClientIdentifier("203.0.113.42", "secret-1");
    const b = await hashClientIdentifier("198.51.100.7", "secret-1");
    expect(a).not.toBe(b);
  });

  it("normalizes case and surrounding whitespace before hashing", async () => {
    const a = await hashClientIdentifier("  2001:DB8::1  ", "secret-1");
    const b = await hashClientIdentifier("2001:db8::1", "secret-1");
    expect(a).toBe(b);
  });
});

describe("currentWindowStart", () => {
  it("rounds down to the nearest window boundary", () => {
    const now = Date.UTC(2026, 0, 1, 10, 24, 59);
    const windowStart = currentWindowStart(now, RATE_LIMIT_WINDOW_MS);
    expect(windowStart.toISOString()).toBe(new Date(Date.UTC(2026, 0, 1, 10, 20, 0)).toISOString());
  });
});

function fakeClient(rpcImpl) {
  return { rpc: vi.fn(rpcImpl) };
}

describe("createCheckRateLimit", () => {
  const now = Date.UTC(2026, 0, 1, 10, 24, 59);

  it("allows the request and passes a hashed (not raw) identifier plus bucketed window to the RPC", async () => {
    const client = fakeClient(async () => ({ data: true, error: null }));
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    const allowed = await checkRateLimit("203.0.113.42", now);

    expect(allowed).toBe(true);
    expect(client.rpc).toHaveBeenCalledTimes(1);
    const [fn, args] = client.rpc.mock.calls[0];
    expect(fn).toBe("check_rate_limit");
    expect(args.p_client_hash).not.toContain("203.0.113.42");
    expect(args.p_client_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(args.p_window_start).toBe(new Date(Date.UTC(2026, 0, 1, 10, 20, 0)).toISOString());
    expect(args.p_max_per_window).toBe(RATE_LIMIT_MAX_PER_WINDOW);
  });

  it("blocks when the RPC reports the window is over the limit", async () => {
    const client = fakeClient(async () => ({ data: false, error: null }));
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    await expect(checkRateLimit("203.0.113.42", now)).resolves.toBe(false);
  });

  it("fails open (allows) when no client IP is available at all", async () => {
    const client = fakeClient(async () => ({ data: false, error: null }));
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    await expect(checkRateLimit(null, now)).resolves.toBe(true);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("fails open (allows) when the rate-limit infrastructure itself errors", async () => {
    const client = fakeClient(async () => ({ data: null, error: { message: "db unavailable" } }));
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    await expect(checkRateLimit("203.0.113.42", now)).resolves.toBe(true);
  });

  it("fails open and never throws when the RPC call itself rejects (not just returns an {error})", async () => {
    const client = fakeClient(async () => {
      throw new Error("network exploded");
    });
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    await expect(checkRateLimit("203.0.113.42", now)).resolves.toBe(true);
  });

  it("fails open and never throws when hashing itself throws", async () => {
    const importKeySpy = vi.spyOn(crypto.subtle, "importKey").mockRejectedValueOnce(new Error("crypto broke"));
    const client = fakeClient(async () => ({ data: true, error: null }));
    const checkRateLimit = createCheckRateLimit(client, {
      hashSecret: "secret",
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxPerWindow: RATE_LIMIT_MAX_PER_WINDOW,
      retentionMs: RATE_LIMIT_RETENTION_MS,
    });

    await expect(checkRateLimit("203.0.113.42", now)).resolves.toBe(true);
    expect(client.rpc).not.toHaveBeenCalled();

    importKeySpy.mockRestore();
  });
});
