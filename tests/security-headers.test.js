import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

const requiredHeaders = {
  "Strict-Transport-Security": "max-age=63072000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

describe("Vercel security headers", () => {
  it("applies the required security headers to every route", () => {
    const globalRule = vercelConfig.headers?.find((rule) => rule.source === "/(.*)");
    expect(globalRule).toBeDefined();

    const actual = Object.fromEntries(globalRule.headers.map(({ key, value }) => [key, value]));
    expect(actual).toMatchObject(requiredHeaders);
  });

  it("does not add an unvalidated content security policy", () => {
    const allHeaderKeys = (vercelConfig.headers ?? [])
      .flatMap((rule) => rule.headers)
      .map(({ key }) => key.toLowerCase());

    expect(allHeaderKeys).not.toContain("content-security-policy");
  });
});
