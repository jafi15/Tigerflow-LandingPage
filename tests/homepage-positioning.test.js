import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;

describe("homepage positioning introduction", () => {
  it("explains TigerFlow's offer and regional reach in crawlable homepage content", () => {
    const section = homepage.querySelector("#positionierung");
    const text = section?.textContent.replace(/\s+/g, " ").trim();

    expect(Boolean(section)).toBe(true);
    expect(text).toContain("TigerFlow aus Heide");
    expect(text).toContain("Webdesign, SEO und KI-Automatisierung – sinnvoll verbunden.");
    expect(text).toContain(
      "TigerFlow bringt Websites, digitale Sichtbarkeit und Geschäftsprozesse auf den modernsten Stand."
    );
    expect(text).toContain("Heide, Dithmarschen und Schleswig-Holstein");
    expect(text).toContain("deutschlandweit");
  });

  it("links descriptively to the Heide money pages from crawlable body copy", () => {
    const section = homepage.querySelector("#positionierung");
    const linkText = (href) =>
      section
        ?.querySelector(`p a[href="${href}"]`)
        ?.textContent.replace(/\s+/g, " ")
        .trim();

    expect(linkText("/webdesign-heide")).toBe("Webdesign in Heide");
    expect(linkText("/seo-heide")).toBe("SEO in Heide");
    expect(section?.querySelectorAll("a")).toHaveLength(2);
    expect(section?.querySelector('a[rel~="nofollow"]')).toBeNull();
  });

  it("places the introduction between the restored hero and problem sections", () => {
    const positioning = homepage.querySelector("#positionierung");
    const problem = homepage.querySelector("#problem");
    const hero = homepage.querySelector("h1")?.closest("section");
    const heroText = hero?.textContent.replace(/\s+/g, " ").trim();

    expect(homepage.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim()).toBe("Wir bauen");
    expect(heroText).toContain("TigerFlow automatisiert Leads, Anfragen und Prozesse");
    expect(positioning?.previousElementSibling).toBe(hero);
    expect(positioning?.nextElementSibling).toBe(problem);
  });

  it("removes the generic individually-bookable service badges from the hero", () => {
    expect(Boolean(homepage.querySelector(".hero-service-badges"))).toBe(false);
    expect(Boolean(homepage.querySelector(".hero-service-badge"))).toBe(false);
  });
});
