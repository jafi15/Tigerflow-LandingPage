import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Static check of supabase/config.toml. The current Supabase Publishable/
// Secret API keys (sb_publishable_…/sb_secret_…) are opaque strings, not
// JWTs — the platform's verify_jwt gate only understands legacy JWT-shaped
// keys, so it must stay disabled here or every legitimate call using the new
// keys would be rejected with "Invalid JWT".
const configPath = fileURLToPath(new URL("../supabase/config.toml", import.meta.url));
const config = readFileSync(configPath, "utf8");

function section(name) {
  const match = config.match(new RegExp(`\\[functions\\.${name}\\]([\\s\\S]*?)(?:\\n\\[|$)`));
  return match ? match[1] : null;
}

describe("Supabase function auth configuration (static check)", () => {
  it("defines a submit-lead function section", () => {
    expect(section("submit-lead")).not.toBeNull();
  });

  it("disables verify_jwt for submit-lead instead of treating Publishable/Secret keys as a bearer JWT", () => {
    expect(section("submit-lead")).toMatch(/verify_jwt\s*=\s*false/);
  });
});
