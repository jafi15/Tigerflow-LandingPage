import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";
import { setupScrollReveal } from "../src/components/scrollReveal.js";
import { createFaqCloseController } from "../src/components/faqMotion.js";

const route = ROUTES.find(({ path: routePath }) => routePath === "/webdesign-dithmarschen");
const heideRoute = ROUTES.find(({ path: routePath }) => routePath === "/webdesign-heide");

function loadDoc(outFile) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

describe("/webdesign-dithmarschen money page", () => {
  it("is an approved prerendered route with unique commercial metadata", () => {
    expect(route).toBeTruthy();
    expect(route).toEqual(
      expect.objectContaining({
        outFile: "webdesign-dithmarschen.html",
        title: "Webdesign Dithmarschen: Website ab 829 € | TigerFlow",
        description:
          "Professionelles Webdesign für Unternehmen in Dithmarschen: responsive Website, Texte, technische SEO-Basis und Anfrageweg – ab 829 € netto.",
      })
    );
    expect(existsSync(path.join(DIST_DIR, route.outFile))).toBe(true);
  });

  it("has metadata distinct from /webdesign-heide (no cannibalizing duplicate)", () => {
    expect(route.title).not.toBe(heideRoute.title);
    expect(route.description).not.toBe(heideRoute.description);
    expect(route.outFile).not.toBe(heideRoute.outFile);
  });

  it("renders exactly one H1 with full indexable initial HTML content", () => {
    const doc = loadDoc(route.outFile);
    const root = doc.getElementById("root");
    expect(root).not.toBeNull();
    expect(root.textContent.trim().length).toBeGreaterThan(400);

    const h1s = doc.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toContain("Dithmarschen");
  });

  it("covers the whole Kreis Dithmarschen, not just Heide, and names approved places only", () => {
    const text = loadDoc(route.outFile).body.textContent.replace(/\s+/g, " ").trim();
    expect(text).toContain("Kreis Dithmarschen");
    for (const place of ["Heide", "Meldorf", "Brunsbüttel", "Büsum", "Marne"]) {
      expect(text).toContain(place);
    }
  });

  it("renders the transparent entry price and 50/50 payment model in initial HTML", () => {
    const text = loadDoc(route.outFile).body.textContent.replace(/\s+/g, " ").trim();
    expect(text).toContain("829 €");
    expect(text).toContain("netto");
    expect(text).toContain("zuzüglich gesetzlicher Umsatzsteuer");
    expect(text).not.toMatch(/zzg?l?\.\s*USt\./i);
    expect(text).toContain("bis zu fünf Inhaltsseiten");
    expect(text).toMatch(/50\s*%.*Beauftragung/i);
    expect(text).toMatch(/50\s*%.*Launch/i);
  });

  it("adds progressive motion choreography with a complete reduced-motion fallback", () => {
    const doc = loadDoc(route.outFile);
    const revealSource = readFileSync(
      path.join(process.cwd(), "src/components/scrollReveal.js"),
      "utf8"
    );
    const pageCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );

    expect(doc.querySelectorAll("[data-wdd-reveal]").length).toBeGreaterThanOrEqual(12);
    expect(doc.querySelectorAll(".wdd-reveal-pending")).toHaveLength(0);
    expect(revealSource).toContain("IntersectionObserver");
    expect(pageCss).toMatch(/@keyframes\s+wdd-hero-reveal/);
    expect(pageCss).toMatch(/@keyframes\s+wdd-node-pop/);
    expect(pageCss).toMatch(/\.wdd-reveal-pending/);
    expect(pageCss).toMatch(/\.wdd-reveal-visible/);
    expect(pageCss).toMatch(/\.wdd-price-number small\s*\{[^}]*letter-spacing:normal/);
    expect(pageCss).toMatch(
      /@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none!important;[\s\S]*transition:none!important;/
    );
  });

  it("draws a branded rule after each section introduction", () => {
    const doc = loadDoc(route.outFile);
    const pageCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );

    const intros = [...doc.querySelectorAll(".wdd-section-intro")];
    expect(intros.length).toBeGreaterThanOrEqual(6);
    expect(intros.every((intro) => intro.querySelector(".wdd-section-rule"))).toBe(true);
    expect(pageCss).toMatch(/\.wdd-section-rule\s*\{[^}]*transform-origin:left/);
    expect(pageCss).toMatch(/\.wdd-reveal-pending\s+\.wdd-section-rule\s*\{[^}]*scaleX\(0\)/);
  });

  it("builds the project timeline progressively instead of showing a static border", () => {
    const doc = loadDoc(route.outFile);
    const pageCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );

    expect(doc.querySelector(".wdd-timeline-progress")).not.toBeNull();
    expect(doc.querySelectorAll(".wdd-timeline-step[data-wdd-reveal]")).toHaveLength(4);
    expect(pageCss).toMatch(/@keyframes\s+wdd-process-line/);
    expect(pageCss).toMatch(/\.wdd-timeline\.wdd-reveal-visible\s+\.wdd-timeline-progress/);
  });

  it("animates FAQ answers in both directions while preserving native details", () => {
    const doc = loadDoc(route.outFile);
    const pageCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );

    const details = [...doc.querySelectorAll(".wdd-faq-list details")];
    expect(details.length).toBeGreaterThan(0);
    expect(details.every((item) => item.querySelector(":scope > .wdd-faq-answer > div > p"))).toBe(true);
    expect(pageCss).toMatch(/\.wdd-faq-answer\s*\{[^}]*grid-template-rows:minmax\(0,0fr\)/);
    expect(pageCss).toMatch(/details\[open\]\s*>\s*\.wdd-faq-answer\s*\{[^}]*grid-template-rows:minmax\(0,1fr\)/);
    expect(pageCss).toMatch(/details\.is-closing\s*>\s*\.wdd-faq-answer\s*\{[^}]*grid-template-rows:minmax\(0,0fr\)/);
    expect(pageCss).toMatch(/\.wdd-faq-list details\s*\{[^}]*transition:[^;}]*opacity[^;}]*transform/);
    expect(pageCss).toMatch(/details\.wdd-reveal-complete\s*\{[^}]*transition-delay:0s/);
  });

  it("closes an FAQ once after its animation and permits a later close", () => {
    const dom = new JSDOM(`<details open><summary>Question</summary><p>Answer</p></details>`);
    const details = dom.window.document.querySelector("details");
    const callbacks = [];
    const motionWindow = {
      matchMedia: () => ({ matches: false }),
      setTimeout: vi.fn((callback) => {
        callbacks.push(callback);
        return callbacks.length;
      }),
      clearTimeout: vi.fn(),
    };
    const onClosingChange = vi.fn();
    const controller = createFaqCloseController({
      getDetails: () => details,
      motionWindow,
      onClosingChange,
    });
    const firstEvent = { preventDefault: vi.fn() };

    controller.handleSummaryClick(firstEvent);
    controller.handleSummaryClick({ preventDefault: vi.fn() });

    expect(firstEvent.preventDefault).toHaveBeenCalledOnce();
    expect(motionWindow.setTimeout).toHaveBeenCalledOnce();
    expect(onClosingChange).toHaveBeenCalledTimes(1);
    expect(details.open).toBe(true);

    callbacks[0]();
    expect(details.open).toBe(false);
    expect(onClosingChange).toHaveBeenLastCalledWith(false);

    details.open = true;
    controller.handleSummaryClick({ preventDefault: vi.fn() });
    expect(motionWindow.setTimeout).toHaveBeenCalledTimes(2);
  });

  it("closes FAQ immediately for reduced motion without scheduling animation", () => {
    const dom = new JSDOM(`<details open><summary>Question</summary><p>Answer</p></details>`);
    const details = dom.window.document.querySelector("details");
    const motionWindow = {
      matchMedia: () => ({ matches: true }),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
    };
    const onClosingChange = vi.fn();
    const controller = createFaqCloseController({
      getDetails: () => details,
      motionWindow,
      onClosingChange,
    });
    const event = { preventDefault: vi.fn() };

    controller.handleSummaryClick(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(details.open).toBe(false);
    expect(motionWindow.setTimeout).not.toHaveBeenCalled();
    expect(onClosingChange).toHaveBeenCalledWith(false);
  });

  it("cancels a pending FAQ close timer during teardown", () => {
    const dom = new JSDOM(`<details open><summary>Question</summary><p>Answer</p></details>`);
    const details = dom.window.document.querySelector("details");
    const motionWindow = {
      matchMedia: () => ({ matches: false }),
      setTimeout: vi.fn(() => 27),
      clearTimeout: vi.fn(),
    };
    const controller = createFaqCloseController({
      getDetails: () => details,
      motionWindow,
      onClosingChange: vi.fn(),
    });

    controller.handleSummaryClick({ preventDefault: vi.fn() });
    controller.cleanup();

    expect(motionWindow.clearTimeout).toHaveBeenCalledWith(27);
  });

  it("observes reveals once and cleans pending timers and listeners on teardown", () => {
    const dom = new JSDOM(`
      <main>
        <section data-wdd-reveal></section>
        <section data-wdd-reveal></section>
      </main>
    `);
    const page = dom.window.document.querySelector("main");
    const targets = [...page.querySelectorAll("[data-wdd-reveal]")];
    targets.forEach((target) => {
      target.getBoundingClientRect = () => ({ top: 900 });
    });

    let observerInstance;
    class FakeIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
        observerInstance = this;
      }
    }

    const motionWindow = {
      matchMedia: () => ({ matches: false }),
      IntersectionObserver: FakeIntersectionObserver,
      innerHeight: 800,
      setTimeout: vi.fn(() => 17),
      clearTimeout: vi.fn(),
    };
    const removeListener = vi.spyOn(targets[0], "removeEventListener");

    const cleanup = setupScrollReveal(page, motionWindow);
    expect(observerInstance.observe).toHaveBeenCalledTimes(2);
    expect(targets[0].classList.contains("wdd-reveal-pending")).toBe(true);

    observerInstance.callback([{ target: targets[0], isIntersecting: true }]);
    expect(targets[0].classList.contains("wdd-reveal-visible")).toBe(true);
    expect(observerInstance.unobserve).toHaveBeenCalledWith(targets[0]);
    expect(motionWindow.setTimeout).toHaveBeenCalledTimes(1);

    cleanup();
    expect(observerInstance.disconnect).toHaveBeenCalledTimes(1);
    expect(motionWindow.clearTimeout).toHaveBeenCalledWith(17);
    expect(removeListener).toHaveBeenCalledWith("transitionend", expect.any(Function));
  });

  it("states the complete confirmed entry scope and its legal boundaries", () => {
    const text = loadDoc(route.outFile).body.textContent.replace(/\s+/g, " ").trim();
    for (const expected of [
      "Erstellung oder Überarbeitung vereinbarter Texte",
      "Einbindung und Optimierung vorhandener und vereinbarter lizenzierter Bilder",
      "Verlinkung vorhandener Social-Media-Profile",
      "Technisch sinnvolle Barrierefreiheits-Basis",
      "Launchbereite, öffentlich erreichbare Website",
      "Keine Rechtsberatung oder Rechtssicherheitsgarantie",
    ]) {
      expect(text).toContain(expected);
    }
  });

  it("keeps visible supporting text readable and does not conceal page overflow", () => {
    const pageCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );
    expect(pageCss).not.toMatch(/\.wdd-page\s*\{[^}]*overflow:\s*hidden/i);
    expect(pageCss).toMatch(/\.wdd-hero\s*\{[^}]*overflow:\s*clip/i);
    expect(pageCss).not.toMatch(/\.wdd-situation-head span\s*\{[^}]*color:\s*#5B5B5B/i);
  });

  it("describes a real mailto CTA and visibly discloses that no form is submitted", () => {
    const doc = loadDoc(route.outFile);
    const mailtoLinks = [...doc.querySelectorAll('a[href^="mailto:service@tigerflow.de"]')];
    expect(mailtoLinks.length).toBeGreaterThan(0);
    expect(mailtoLinks[0].getAttribute("href")).toContain("subject=");
    expect(mailtoLinks[0].getAttribute("href")).toContain("body=");
    const decodedHref = decodeURIComponent(mailtoLinks[0].getAttribute("href"));
    expect(decodedHref).toContain("Unternehmen:");
    expect(decodedHref).toContain("Aktueller Stand:");
    expect(decodedHref).toContain("Ziel der Website:");

    const text = doc.body.textContent.replace(/\s+/g, " ").trim();
    expect(text).toMatch(/E-Mail-Entwurf/i);
    expect(text).toMatch(/kein Formular/i);
    expect(text).not.toMatch(/Anfrage wurde gesendet|erfolgreich (gesendet|übermittelt|versendet)/i);
  });

  it("contains no unapproved ranking, reference, or success-guarantee claims", () => {
    const text = loadDoc(route.outFile).body.textContent;
    expect(text).not.toMatch(
      /führende Webagentur|beste Webagentur|garantiert|Platz\s*1|Marktführer|mehr Kunden|mehr Umsatz|Testimonial|Kundenstimme|★/i
    );
    expect(text).not.toMatch(/für die meisten Unternehmen im Kreis|jederzeit nachvollziehbar/i);
  });

  it("has a self-referencing canonical and index,follow robots", () => {
    const doc = loadDoc(route.outFile);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE_URL}/webdesign-dithmarschen`
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index, follow");
    expect(doc.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
      "Webdesign für Unternehmen in Dithmarschen | TigerFlow"
    );
    expect(doc.querySelector('meta[property="og:description"]')?.getAttribute("content")).toBe(
      "Moderne Unternehmenswebsites für Dithmarschen – klarer Leistungsumfang, regionale Erreichbarkeit und ausbaufähige technische Grundlage."
    );
    expect(doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
      "Webdesign für Unternehmen in Dithmarschen | TigerFlow"
    );
  });

  it("appears in the generated sitemap as an absolute https URL", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap).toContain(`<loc>${SITE_URL}/webdesign-dithmarschen</loc>`);
  });

  it("uses crawlable internal <a href> links, not JS-only navigation", () => {
    const doc = loadDoc(route.outFile);
    const internalLinks = [...doc.querySelectorAll("a[href]")].filter((a) =>
      a.getAttribute("href").startsWith("/")
    );
    expect(internalLinks.some((a) => a.getAttribute("href") === "/")).toBe(true);
    expect(internalLinks.some((a) => a.getAttribute("href") === "/webdesign-heide")).toBe(true);
  });

  it("does not change the homepage hero or add a link to the new route yet", () => {
    const homepage = loadDoc("index.html");
    expect(homepage.querySelector("h1").textContent.replace(/\s+/g, " ").trim()).toBe("Wir bauen");
    expect(homepage.body.textContent).toContain("TigerFlow automatisiert Leads, Anfragen und Prozesse");
    expect(
      [...homepage.querySelectorAll("a[href]")].some(
        (a) => a.getAttribute("href") === "/webdesign-dithmarschen"
      )
    ).toBe(false);
  });

  it("does not change /webdesign-heide content or add a link to the new route yet", () => {
    const heide = loadDoc("webdesign-heide.html");
    expect(heide.querySelector("h1").textContent).toContain("Webdesign in Heide");
    expect(heide.body.textContent).toContain("Websites ab 829 € netto");
    expect(
      [...heide.querySelectorAll("a[href]")].some(
        (a) => a.getAttribute("href") === "/webdesign-dithmarschen"
      )
    ).toBe(false);
  });

  it("is structurally distinct from /webdesign-heide (own CSS class namespace, not a copy)", () => {
    const heideCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignHeidePage.css"),
      "utf8"
    );
    const dithCss = readFileSync(
      path.join(process.cwd(), "src/components/WebdesignDithmarschenPage.css"),
      "utf8"
    );
    expect(dithCss).not.toBe(heideCss);
    expect(dithCss).toMatch(/\.wdd-/);
    expect(heideCss).not.toMatch(/\.wdd-/);
  });
});
