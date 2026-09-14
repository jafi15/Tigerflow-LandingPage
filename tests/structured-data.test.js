import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

function loadDoc(outFile) {
  const html = readFileSync(path.join(DIST_DIR, outFile), "utf8");
  return new JSDOM(html).window.document;
}

const FORBIDDEN_KEYS = [
  "aggregateRating",
  "review",
  "reviewRating",
  "foundingDate",
  "numberOfEmployees",
  "founder",
];

describe("structured data (JSON-LD)", () => {
  it("homepage ships exactly one JSON-LD script that is valid JSON", () => {
    const doc = loadDoc("index.html");
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(() => JSON.parse(scripts[0].textContent)).not.toThrow();
  });

  it("homepage JSON-LD contains a valid Organization entry with only confirmed data", () => {
    const doc = loadDoc("index.html");
    const script = doc.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    const graph = data["@graph"];
    expect(Array.isArray(graph)).toBe(true);

    const org = graph.find((n) => n["@type"] === "Organization");
    expect(org).toBeTruthy();
    expect(org.name).toBe("TigerFlow");
    expect(org.url).toBe(`${SITE_URL}/`);
    expect(org.logo).toBe(`${SITE_URL}/tigerflow-mark.png`);
    expect(org.email).toBe("service@tigerflow.de");
    expect(org.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: "Rendsburger Straße 22",
      postalCode: "25746",
      addressLocality: "Heide",
      addressCountry: "DE",
    });

    const serialized = JSON.stringify(org);
    for (const key of FORBIDDEN_KEYS) {
      expect(serialized.includes(key)).toBe(false);
    }
  });

  it("homepage JSON-LD contains a WebSite entry", () => {
    const doc = loadDoc("index.html");
    const script = doc.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script.textContent);
    const site = data["@graph"].find((n) => n["@type"] === "WebSite");
    expect(site).toBeTruthy();
    expect(site.name).toBe("TigerFlow");
    expect(site.url).toBe(`${SITE_URL}/`);
  });

  it("Organization address matches the confirmed Impressum content (no invented data)", () => {
    const impressumHtml = readFileSync(path.join(DIST_DIR, "impressum.html"), "utf8");
    expect(impressumHtml).toContain("Rendsburger Stra");
    expect(impressumHtml).toContain("25746");
    expect(impressumHtml).toContain("Heide");
    expect(impressumHtml).toContain("service@tigerflow.de");
  });

  it("legal pages and 404 do not ship Organization/WebSite JSON-LD", () => {
    for (const file of ["impressum.html", "datenschutz.html", "agb.html", "404.html"]) {
      const doc = loadDoc(file);
      expect(doc.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
    }
  });
});
