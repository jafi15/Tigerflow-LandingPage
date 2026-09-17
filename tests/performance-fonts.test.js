import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const indexCss = readFileSync(path.join(rootDir, "src", "index.css"), "utf8");
const indexHtml = readFileSync(path.join(rootDir, "index.html"), "utf8");
const packageJson = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const distIndexHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const distAssetsDir = path.join(DIST_DIR, "assets");

describe("Fonts are self-hosted and non-render-blocking", () => {
  it("does not @import Google Fonts from src/index.css", () => {
    expect(indexCss).not.toMatch(/@import[^;]*fonts\.googleapis\.com/);
  });

  it("declares only the locally used font faces with font-display: swap", () => {
    const interFaces = indexCss.match(/@font-face\s*{[^}]*font-family:\s*['"]Inter['"][^}]*}/g) || [];
    const sgFaces = indexCss.match(/@font-face\s*{[^}]*font-family:\s*['"]Space Grotesk['"][^}]*}/g) || [];
    expect(interFaces.length).toBe(1);
    expect(sgFaces.length).toBe(1);
    expect(interFaces[0]).toMatch(/font-weight:\s*300 600/);
    expect(sgFaces[0]).toMatch(/font-weight:\s*600 700/);
    for (const face of [...interFaces, ...sgFaces]) {
      expect(face).toMatch(/font-display:\s*swap/);
      expect(face).toMatch(/url\(\/fonts\//);
    }
  });

  it("ships the exact local woff2 font files referenced by the CSS", () => {
    const files = [
      "inter-latin-wght-normal.woff2",
      "space-grotesk-latin-wght-normal.woff2",
    ];
    for (const f of files) {
      const p = path.join(rootDir, "public", "fonts", f);
      expect(existsSync(p)).toBe(true);
    }
    expect(
      readdirSync(path.join(rootDir, "public", "fonts"))
        .filter((file) => file.endsWith(".woff2"))
        .sort(),
    ).toEqual([...files].sort());
  });

  it("keeps OFL license files alongside the self-hosted fonts", () => {
    const dir = path.join(rootDir, "public", "fonts");
    expect(existsSync(path.join(dir, "LICENSE-Inter-OFL.txt"))).toBe(true);
    expect(existsSync(path.join(dir, "LICENSE-SpaceGrotesk-OFL.txt"))).toBe(true);
  });

  it("does not retain font-copy packages as unused production dependencies", () => {
    expect(packageJson.dependencies?.["@fontsource/inter"]).toBeUndefined();
    expect(packageJson.dependencies?.["@fontsource/space-grotesk"]).toBeUndefined();
  });

  it("preloads only the single critical font used by the mobile LCP element (hero H1, Space Grotesk 600)", () => {
    const preloads = [...indexHtml.matchAll(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/g)].map((m) => m[0]);
    expect(preloads.length).toBe(1);
    expect(preloads[0]).toMatch(/space-grotesk-latin-wght-normal\.woff2/);
    expect(preloads[0]).toMatch(/type=["']font\/woff2["']/);
    expect(preloads[0]).toMatch(/crossorigin/);
  });

  it("keeps the critical font preload on the built homepage only", () => {
    expect(distIndexHtml).toMatch(/<link[^>]*rel=["']preload["'][^>]*space-grotesk-latin-wght-normal\.woff2[^>]*>/);
    for (const file of ["impressum.html", "datenschutz.html", "agb.html", "404.html"]) {
      const html = readFileSync(path.join(DIST_DIR, file), "utf8");
      expect(html).not.toMatch(/rel=["']preload["'][^>]*space-grotesk-latin-wght-normal\.woff2/);
    }
  });

  it("never requests fonts from a third-party Google Fonts origin in the production build", () => {
    expect(distIndexHtml).not.toMatch(/fonts\.googleapis\.com/);
    expect(distIndexHtml).not.toMatch(/fonts\.gstatic\.com/);
    const cssFiles = existsSync(distAssetsDir)
      ? require("node:fs").readdirSync(distAssetsDir).filter((f) => f.endsWith(".css"))
      : [];
    for (const f of cssFiles) {
      const css = readFileSync(path.join(distAssetsDir, f), "utf8");
      expect(css).not.toMatch(/fonts\.googleapis\.com/);
      expect(css).not.toMatch(/fonts\.gstatic\.com/);
    }
  });
});
