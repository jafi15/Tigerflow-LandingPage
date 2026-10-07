import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;
const css = readFileSync(path.join(process.cwd(), "src/index.css"), "utf8");

describe("TigerFlow hero system corridor preview", () => {
  it("places a decorative branded process flow beside the left-aligned writing", () => {
    const corridor = homepage.querySelector(".hero-system-corridor");
    const text = corridor?.textContent.replace(/\s+/g, " ").trim();
    const watermarkShell = corridor?.querySelector(".hero-corridor-watermark-shell");
    const watermark = corridor?.querySelector('.hero-corridor-watermark[src="/tigerflow-mark.png"]');

    expect(Boolean(corridor)).toBe(true);
    expect(corridor?.classList.contains("hero-corridor-right-layout")).toBe(true);
    expect(corridor?.getAttribute("aria-hidden")).toBe("true");
    expect(Boolean(watermark)).toBe(true);
    expect(Boolean(watermarkShell)).toBe(true);
    expect(watermark?.getAttribute("width")).toBe("320");
    expect(watermark?.getAttribute("height")).toBe("245");
    expect(Boolean(corridor?.querySelector(".hero-corridor-line"))).toBe(true);
    expect(Boolean(corridor?.querySelector(".hero-corridor-pulse"))).toBe(true);
    expect(text).toContain("Website");
    expect(text).toContain("Neue Anfrage eingegangen");
    expect(text).toContain("Formular erfasst");
    expect(text).toContain("Automation");
    expect(text).toContain("Anfrage qualifiziert");
    expect(text).toContain("Nächster Schritt vorbereitet");
  });

  it("avoids fake live metrics and hides side panels on narrower screens", () => {
    const corridorText = homepage.querySelector(".hero-system-corridor")?.textContent ?? "";

    expect(corridorText).not.toMatch(/[+%]/);
    expect(corridorText).not.toContain("Anrufe laufen");
    expect(css).toMatch(
      /@media\(max-width:1100px\)[\s\S]*\.hero-corridor-panel[\s\S]*display:\s*none/
    );
    expect(css).toMatch(
      /@media\(max-width:1100px\)[\s\S]*\.hero-corridor-watermark[\s\S]*opacity:\s*\.05\s*!important/
    );
  });

  it("uses a restrained process animation with an explicit reduced-motion fallback", () => {
    expect(css).toContain("@keyframes heroCorridorLineReveal");
    expect(css).toContain("@keyframes heroCorridorPulse");
    expect(css).toContain("@keyframes heroMarkBreath");
    expect(css).toContain("@keyframes heroPanelArrival");
    expect(css).toMatch(/\.hero-corridor-pulse\s*\{[\s\S]*animation:\s*heroCorridorPulse/);
    expect(css).toMatch(/\.hero-corridor-watermark\s*\{[\s\S]*animation:\s*heroMarkBreath/);
    expect(css).toMatch(
      /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.hero-corridor-watermark[\s\S]*animation:\s*none\s*!important/
    );
    expect(homepage.querySelector("canvas")).toBeNull();
  });
});
