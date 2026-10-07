import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const route = ROUTES.find(({ path: routePath }) => routePath === "/webdesign-heide");
const pageCss = readFileSync(
  path.join(process.cwd(), "src/components/WebdesignHeidePage.css"),
  "utf8"
);

describe("/webdesign-heide money page", () => {
  it("is an approved prerendered route with unique commercial metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        outFile: "webdesign-heide.html",
        title: "Webdesign Heide: Moderne Website ab 829 € | TigerFlow",
        description:
          "Professionelles Webdesign aus Heide: responsive Unternehmenswebsite, Texte, technische SEO-Basis und Anfragefunnel – ab 829 € netto.",
      })
    );
    expect(existsSync(path.join(DIST_DIR, route.outFile))).toBe(true);
  });

  it("renders the confirmed offer and a qualified project CTA in initial HTML", () => {
    const html = readFileSync(path.join(DIST_DIR, route.outFile), "utf8");
    const document = new JSDOM(html).window.document;
    const text = document.body.textContent.replace(/\s+/g, " ").trim();

    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("h1").textContent).toContain("Webdesign in Heide");
    expect(text).toContain("Websites ab 829 € netto");
    expect(text).toContain("bis zu fünf Inhaltsseiten");
    expect(text).toContain("technische SEO-Basis");
    expect(text).toContain("Unverbindliche Projektanfrage starten");
    expect(text).toContain("Keine pauschale Dauer");
    expect(text).not.toMatch(/garantiert|Platz 1|mehr Umsatz|mehr Kunden/i);
  });

  it("has a self-referencing canonical and appears in the sitemap", () => {
    const html = readFileSync(path.join(DIST_DIR, route.outFile), "utf8");
    const document = new JSDOM(html).window.document;
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE_URL}/webdesign-heide`
    );

    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap).toContain(`<loc>${SITE_URL}/webdesign-heide</loc>`);
  });

  it("keeps the current homepage hero unchanged", () => {
    const homepage = new JSDOM(
      readFileSync(path.join(DIST_DIR, "index.html"), "utf8")
    ).window.document;
    expect(homepage.querySelector("h1").textContent.replace(/\s+/g, " ").trim()).toBe(
      "Wir bauen"
    );
    expect(homepage.body.textContent).toContain(
      "TigerFlow automatisiert Leads, Anfragen und Prozesse"
    );
    const webdesignCard = homepage.querySelector("#service-webdesign");
    const moneyPageLink = webdesignCard?.querySelector('a[href="/webdesign-heide"]');
    expect(moneyPageLink?.textContent.replace(/\s+/g, " ").trim()).toBe(
      "Webdesign in Heide ansehen"
    );
  });

  it("uses readable contrast for visible supporting copy", () => {
    expect(pageCss).not.toMatch(
      /color:\s*#(?:747474|737373|696969|686868|626262|5F5F5F|555|505050|494949|595959|797979|7B7B7B)\b/i
    );
    expect(pageCss).toMatch(
      /\.wdh-primary-btn\s*\{[\s\S]*background:#FF7A00;[\s\S]*color:#111111;/
    );
    expect(pageCss).toMatch(/\.wdh-system-flow article>span\s*\{[^}]*color:#909090;/);
    expect(pageCss).toMatch(/\.wdh-wire-hero button\s*\{[^}]*color:#111111;/);
  });
});
