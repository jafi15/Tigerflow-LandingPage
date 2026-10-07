import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const homepageHtml = readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
const homepage = new JSDOM(homepageHtml).window.document;

describe("approved left-aligned hero system layout", () => {
  it("keeps the complete writing and conversion block left aligned", () => {
    const hero = homepage.querySelector(".hero-system-layout");
    const content = hero?.querySelector(".hero-content");
    const typingLine = hero?.querySelector(".hero-typing-line");
    const typingCursor = hero?.querySelector(".hero-typing-cursor");
    const projectCheck = hero?.querySelector(".project-check-trigger");

    expect(Boolean(hero)).toBe(true);
    expect(content?.style.textAlign).toBe("left");
    expect(content?.style.margin).toBe("0px");
    expect(content?.style.maxWidth).toBe("560px");
    expect(typingLine?.style.justifyContent).toBe("flex-start");
    expect(Boolean(typingCursor)).toBe(true);
    expect(Boolean(projectCheck)).toBe(true);
    expect(hero?.querySelector("h1")?.textContent.trim()).toBe("Wir bauen");
    expect(hero?.textContent).toContain("TigerFlow automatisiert Leads, Anfragen und Prozesse");
  });

  it("removes the old dashboard so the right-side system flow stays unobstructed", () => {
    const hero = homepage.querySelector(".hero-system-layout");
    expect(Boolean(hero?.querySelector(".mockup-wrap"))).toBe(false);
  });
});
