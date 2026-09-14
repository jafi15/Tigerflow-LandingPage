import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

describe("robots.txt", () => {
  const content = readFileSync(path.join(DIST_DIR, "robots.txt"), "utf8");

  it("is a real UTF-8 text file, not the HTML app shell", () => {
    expect(content.toLowerCase()).not.toContain("<!doctype html");
    expect(content.toLowerCase()).not.toContain("<html");
    expect(content.toLowerCase()).not.toContain("<div id=\"root\"");
  });

  it("allows crawling and references the sitemap", () => {
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});

describe("sitemap.xml", () => {
  const content = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");

  it("is not the HTML app shell", () => {
    expect(content.toLowerCase()).not.toContain("<!doctype html");
    expect(content.toLowerCase()).not.toContain("<div id=\"root\"");
  });

  it("is valid XML", () => {
    const result = XMLValidator.validate(content);
    expect(result).toBe(true);
  });

  it("contains exactly the approved canonical routes, each as an absolute https URL", () => {
    const parsed = new XMLParser().parse(content);
    const urls = parsed.urlset.url;
    const locs = (Array.isArray(urls) ? urls : [urls]).map((u) => u.loc);

    const expectedLocs = ROUTES.map(
      (route) => `${SITE_URL}${route.path === "/" ? "/" : route.path}`
    );

    expect(new Set(locs)).toEqual(new Set(expectedLocs));
    expect(locs).toHaveLength(expectedLocs.length);

    for (const loc of locs) {
      expect(loc.startsWith("https://tigerflow.de")).toBe(true);
    }
  });

  it("contains no 404, preview, parameter, or unapproved money-page URLs", () => {
    const parsed = new XMLParser().parse(content);
    const urls = parsed.urlset.url;
    const locs = (Array.isArray(urls) ? urls : [urls]).map((u) => u.loc);

    for (const loc of locs) {
      expect(loc).not.toContain("?");
      expect(loc).not.toContain("404");
      expect(loc.toLowerCase()).not.toContain("preview");
    }
    for (const forbidden of [
      "/webdesign-heide",
      "/webdesign-dithmarschen",
      "/preise",
      "/ueber-uns",
      "/kontakt",
    ]) {
      expect(content).not.toContain(`<loc>${SITE_URL}${forbidden}</loc>`);
    }
  });
});
