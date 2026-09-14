import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;

describe("Phase 1 preserves the approved visible homepage scope", () => {
  it("keeps the original badge, hero paragraph, and service wording", () => {
    const bodyText = homepage.body.textContent.replace(/\s+/g, " ").trim();

    expect(bodyText).toContain("TigerFlow · AI Systems & Automation");
    expect(bodyText).toContain("TigerFlow automatisiert Leads, Anfragen und Prozesse");
    expect(bodyText).toContain("Premium-Websites");
    expect(bodyText).not.toContain("Webdesign · SEO · KI-Automatisierung aus Schleswig-Holstein");
  });

  it("keeps the original TigerBot image asset", () => {
    const tigerBotImage = homepage.querySelector('img[src="/tigerbot-bg.png"]');
    expect(tigerBotImage).not.toBeNull();
    expect(homepage.querySelector('img[src="/tigerbot-bg.jpg"]')).toBeNull();
  });

  it("preserves the original hero H1 and empty typing-animation start state", () => {
    expect(homepage.querySelector("h1").textContent.replace(/\s+/g, " ").trim()).toBe(
      "Wir bauen"
    );
    expect(homepage.body.textContent).not.toContain("Systeme, die jagen.");
  });
});
