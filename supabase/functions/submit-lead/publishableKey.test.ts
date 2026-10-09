import { describe, expect, it } from "vitest";
import { isValidPublishableKey } from "./publishableKey.ts";

describe("isValidPublishableKey", () => {
  it("accepts a key that matches one of the configured publishable keys", () => {
    expect(isValidPublishableKey("sb_publishable_abc", ["sb_publishable_abc", "sb_publishable_old"])).toBe(true);
  });

  it("rejects a key that matches none of the configured publishable keys", () => {
    expect(isValidPublishableKey("sb_publishable_wrong", ["sb_publishable_abc"])).toBe(false);
  });

  it("rejects a missing key", () => {
    expect(isValidPublishableKey(null, ["sb_publishable_abc"])).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidPublishableKey("", ["sb_publishable_abc"])).toBe(false);
  });

  it("rejects when no valid keys are configured at all (fails closed, never open)", () => {
    expect(isValidPublishableKey("sb_publishable_abc", [])).toBe(false);
  });
});
