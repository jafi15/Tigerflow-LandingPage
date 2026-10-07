import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;
const css = readFileSync(path.join(process.cwd(), "src/index.css"), "utf8");

describe("hero background scope", () => {
  it("restores the original decorative background after the motion experiment", () => {
    const background = homepage.querySelector('.hero-system-layout > [aria-hidden="true"]');

    expect(Boolean(background)).toBe(true);
    expect(background?.getAttribute("aria-hidden")).toBe("true");
    expect(Boolean(background?.querySelector(".hero-grid-drift"))).toBe(false);
    expect(background?.querySelectorAll(".hero-ambient-glow")).toHaveLength(0);
    expect(background?.querySelectorAll(".hero-data-line")).toHaveLength(0);
    expect(background?.querySelector("canvas")).toBeNull();
  });

  it("removes the rejected autonomous ambient animations", () => {
    expect(css).not.toContain("@keyframes heroGridDrift");
    expect(css).not.toContain("@keyframes heroAmbientA");
    expect(css).not.toContain("@keyframes heroAmbientB");
  });
});
