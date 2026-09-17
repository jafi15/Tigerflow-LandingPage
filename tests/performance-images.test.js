import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;

function sizeOf(rel) {
  const p = path.join(publicDir, rel);
  return existsSync(p) ? statSync(p).size : -1;
}

describe("tigerbot-bg.png is delivered as modern, responsive, sized image", () => {
  it("keeps the original PNG as the compatibility fallback (unchanged path)", () => {
    const img = homepage.querySelector('img[src="/tigerbot-bg.png"]');
    expect(img).not.toBeNull();
    expect(homepage.querySelector('img[src="/tigerbot-bg.jpg"]')).toBeNull();
  });

  it("keeps the original PNG bytes intact as the rarely-used compatibility fallback", () => {
    // Lossless recompression of this PNG yields no meaningful savings (verified: it grows
    // slightly under max effort zlib). The real win is the AVIF source below, which modern
    // browsers use instead. Per the task's "original only as fallback when technically
    // necessary", the PNG is kept as-is rather than degraded for a path few users hit.
    const size = sizeOf("tigerbot-bg.png");
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(1_198_920);
  });

  it("ships an AVIF source dramatically smaller than the PNG baseline", () => {
    const size = sizeOf("tigerbot-bg.avif");
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(150_000);
  });

  it("serves responsive AVIF variants via <picture> ahead of the PNG fallback", () => {
    const source = homepage.querySelector('picture source[type="image/avif"]');
    expect(source).not.toBeNull();
    expect(source.getAttribute("srcset")).toContain("/tigerbot-bg-480.avif 480w");
    expect(source.getAttribute("srcset")).toContain("/tigerbot-bg-768.avif 768w");
    expect(source.getAttribute("srcset")).toContain("/tigerbot-bg.avif 1024w");
    expect(source.getAttribute("sizes")).toBe("(max-width: 430px) calc(100vw - 50px), 380px");
    const img = source.closest("picture").querySelector("img");
    expect(img.getAttribute("src")).toBe("/tigerbot-bg.png");
  });

  it("ships every responsive AVIF candidate", () => {
    for (const file of ["tigerbot-bg-480.avif", "tigerbot-bg-768.avif", "tigerbot-bg.avif"]) {
      expect(sizeOf(file)).toBeGreaterThan(0);
    }
  });

  it("treats the background art as decorative because the card already contains accessible text", () => {
    const img = homepage.querySelector('img[src="/tigerbot-bg.png"]');
    expect(img.getAttribute("alt")).toBe("");
    expect(img.hasAttribute("aria-hidden")).toBe(false);
  });

  it("declares explicit width/height on the fallback img to prevent layout shift", () => {
    const img = homepage.querySelector('img[src="/tigerbot-bg.png"]');
    expect(img.getAttribute("width")).toBeTruthy();
    expect(img.getAttribute("height")).toBeTruthy();
  });

  it("is lazy-loaded since it is below the fold and not the LCP element", () => {
    const img = homepage.querySelector('img[src="/tigerbot-bg.png"]');
    expect(img.getAttribute("loading")).toBe("lazy");
  });
});

describe("tigerflow-mark.png is optimized without visible quality change", () => {
  it("uses the verified lossless 320x245 optimization and is smaller than the 43,849 byte baseline", () => {
    const bytes = readFileSync(path.join(publicDir, "tigerflow-mark.png"));
    expect(bytes.length).toBeLessThan(43_849);
    expect(bytes.readUInt32BE(16)).toBe(320);
    expect(bytes.readUInt32BE(20)).toBe(245);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "4871ed10aff6a965d37ec84f3cfa08eaaff891d299fa3d90a196cab7ab93e4ff",
    );
  });

  it("all rendered logo marks declare intrinsic dimensions", () => {
    const marks = [...homepage.querySelectorAll('img[src="/tigerflow-mark.png"]')];
    expect(marks.length).toBeGreaterThan(0);
    for (const mark of marks) {
      expect(mark.getAttribute("width")).toBe("320");
      expect(mark.getAttribute("height")).toBe("245");
    }
  });

  it("the JSON-LD organization logo still points at the unchanged /tigerflow-mark.png path", () => {
    const ld = homepage.querySelector('script[type="application/ld+json"]');
    expect(ld.textContent).toContain('"logo":"https://tigerflow.de/tigerflow-mark.png"');
  });
});
