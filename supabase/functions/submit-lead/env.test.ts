import { describe, expect, it } from "vitest";
import { resolvePublishableKeys, resolveSecretKey } from "./env.ts";

function envFrom(map) {
  return (name) => map[name];
}

describe("resolveSecretKey", () => {
  it("reads the 'default' entry from the current SUPABASE_SECRET_KEYS JSON dictionary", () => {
    const getEnv = envFrom({ SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_abc123" }) });
    expect(resolveSecretKey(getEnv)).toBe("sb_secret_abc123");
  });

  it("falls back to the only entry when SUPABASE_SECRET_KEYS has no 'default' key", () => {
    const getEnv = envFrom({ SUPABASE_SECRET_KEYS: JSON.stringify({ "2026-01": "sb_secret_xyz789" }) });
    expect(resolveSecretKey(getEnv)).toBe("sb_secret_xyz789");
  });

  it("falls back to the legacy singular SUPABASE_SECRET_KEY when the plural var is absent (local dev)", () => {
    const getEnv = envFrom({ SUPABASE_SECRET_KEY: "sb_secret_local" });
    expect(resolveSecretKey(getEnv)).toBe("sb_secret_local");
  });

  it("prefers SUPABASE_SECRET_KEYS over the singular fallback when both are present", () => {
    const getEnv = envFrom({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_plural" }),
      SUPABASE_SECRET_KEY: "sb_secret_singular",
    });
    expect(resolveSecretKey(getEnv)).toBe("sb_secret_plural");
  });

  it("throws when SUPABASE_SECRET_KEYS is not valid JSON rather than silently falling through", () => {
    const getEnv = envFrom({ SUPABASE_SECRET_KEYS: "not-json" });
    expect(() => resolveSecretKey(getEnv)).toThrow();
  });

  it("throws when no secret key is configured at all", () => {
    const getEnv = envFrom({});
    expect(() => resolveSecretKey(getEnv)).toThrow();
  });
});

describe("resolvePublishableKeys", () => {
  it("returns every entry from the SUPABASE_PUBLISHABLE_KEYS JSON dictionary (supports key rotation)", () => {
    const getEnv = envFrom({
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: "sb_publishable_a", "2026-01": "sb_publishable_b" }),
    });
    expect(resolvePublishableKeys(getEnv).sort()).toEqual(["sb_publishable_a", "sb_publishable_b"]);
  });

  it("falls back to the legacy singular SUPABASE_PUBLISHABLE_KEY when the plural var is absent (local dev)", () => {
    const getEnv = envFrom({ SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local" });
    expect(resolvePublishableKeys(getEnv)).toEqual(["sb_publishable_local"]);
  });

  it("prefers SUPABASE_PUBLISHABLE_KEYS over the singular fallback when both are present", () => {
    const getEnv = envFrom({
      SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: "sb_publishable_plural" }),
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_singular",
    });
    expect(resolvePublishableKeys(getEnv)).toEqual(["sb_publishable_plural"]);
  });

  it("throws when SUPABASE_PUBLISHABLE_KEYS is not valid JSON rather than silently falling through", () => {
    const getEnv = envFrom({ SUPABASE_PUBLISHABLE_KEYS: "not-json" });
    expect(() => resolvePublishableKeys(getEnv)).toThrow();
  });

  it("throws when no publishable key is configured at all", () => {
    const getEnv = envFrom({});
    expect(() => resolvePublishableKeys(getEnv)).toThrow();
  });
});
