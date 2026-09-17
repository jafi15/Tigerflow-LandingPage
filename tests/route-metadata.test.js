import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

function loadDoc(outFile) {
  const html = readFileSync(path.join(DIST_DIR, outFile), "utf8");
  return new JSDOM(html).window.document;
}

describe("route-specific metadata in prerendered HTML", () => {
  const titles = new Map();
  const descriptions = new Map();

  for (const route of ROUTES) {
    const canonicalUrl = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;

    describe(`route ${route.path} (dist/${route.outFile})`, () => {
      const doc = loadDoc(route.outFile);

      it("has non-empty initial content inside #root", () => {
        const root = doc.getElementById("root");
        expect(root).not.toBeNull();
        expect(root.textContent.trim().length).toBeGreaterThan(0);
      });

      it("has exactly one H1", () => {
        expect(doc.querySelectorAll("h1")).toHaveLength(1);
        expect(doc.querySelector("h1").textContent.trim().length).toBeGreaterThan(0);
      });

      it("has the expected unique <title>", () => {
        expect(doc.title).toBe(route.title);
        titles.set(route.path, doc.title);
      });

      it("has the expected unique meta description", () => {
        const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
        expect(desc).toBe(route.description);
        descriptions.set(route.path, desc);
      });

      it("has an absolute self-referencing canonical under https://tigerflow.de", () => {
        const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
        expect(canonical).toBe(canonicalUrl);
        expect(canonical.startsWith("https://tigerflow.de")).toBe(true);
      });

      it("has matching Open Graph data", () => {
        const og = (prop) => doc.querySelector(`meta[property="${prop}"]`)?.getAttribute("content");
        expect(og("og:title")).toBe(route.title);
        expect(og("og:description")).toBe(route.description);
        expect(og("og:url")).toBe(canonicalUrl);
        expect(og("og:type")).toBe("website");
        expect(og("og:image")).toMatch(/^https:\/\/tigerflow\.de\//);
      });

      it("has a Twitter card", () => {
        expect(doc.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBeTruthy();
        expect(doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(route.title);
      });

      it("is indexable (robots: index, follow)", () => {
        expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index, follow");
      });

      it("uses crawlable <a href> links for internal navigation, not JS-only handlers", () => {
        const internalLinks = [...doc.querySelectorAll("a[href]")].filter((a) =>
          a.getAttribute("href").startsWith("/")
        );
        expect(internalLinks.length).toBeGreaterThan(0);
      });
    });
  }

  it("all route titles are unique across the site", () => {
    const values = [...titles.values()];
    expect(new Set(values).size).toBe(values.length);
  });

  it("all route meta descriptions are unique across the site", () => {
    const values = [...descriptions.values()];
    expect(new Set(values).size).toBe(values.length);
  });
});
