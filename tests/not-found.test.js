import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

describe("dist/404.html", () => {
  const html = readFileSync(path.join(DIST_DIR, "404.html"), "utf8");
  const doc = new JSDOM(html).window.document;
  const homeDoc = new JSDOM(readFileSync(path.join(DIST_DIR, "index.html"), "utf8")).window.document;

  it("is marked noindex", () => {
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content");
    expect(robots).toContain("noindex");
  });

  it("does not carry a homepage (or any) canonical link", () => {
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("does not output homepage content or title", () => {
    expect(doc.title).not.toBe(homeDoc.title);
    expect(doc.querySelector("h1").textContent.trim()).not.toBe(
      homeDoc.querySelector("h1").textContent.trim()
    );
    expect(doc.body.textContent).not.toContain(homeDoc.querySelector("h1").textContent.trim());
  });

  it("does not ship the homepage Organization/WebSite JSON-LD", () => {
    expect(doc.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
  });

  it("still has a real H1 and usable navigation back into the site", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    const homeLink = [...doc.querySelectorAll("a[href]")].find((a) => a.getAttribute("href") === "/");
    expect(homeLink).toBeTruthy();
  });
});
