import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const EXPECTED_FILES = [
  "index.html",
  "impressum.html",
  "datenschutz.html",
  "agb.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
];

describe("production build artifacts", () => {
  it("dist/ exists", () => {
    expect(existsSync(DIST_DIR)).toBe(true);
  });

  for (const file of EXPECTED_FILES) {
    it(`dist/${file} exists and is non-empty`, () => {
      const filePath = path.join(DIST_DIR, file);
      expect(existsSync(filePath)).toBe(true);
      expect(statSync(filePath).size).toBeGreaterThan(0);
    });
  }

  it("dist/assets contains a hashed JS bundle and a CSS bundle", () => {
    const assetsDir = path.join(DIST_DIR, "assets");
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir);
    expect(files.some((f) => f.endsWith(".js"))).toBe(true);
    expect(files.some((f) => f.endsWith(".css"))).toBe(true);
  });
});
