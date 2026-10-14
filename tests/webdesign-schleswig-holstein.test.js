import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const PATH = "/webdesign-schleswig-holstein";
const OUT_FILE = "webdesign-schleswig-holstein.html";
const route = ROUTES.find(({ path: routePath }) => routePath === PATH);

function loadDoc(outFile = OUT_FILE) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

// Visible text only: drops JSON-LD and separates adjacent elements with a space.
function pageText(doc) {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll("script").forEach((script) => script.remove());
  body.querySelectorAll("*").forEach((element) => element.append(" "));
  return body.textContent.replace(/\s+/g, " ").trim();
}

// Text of one element with element boundaries rendered as spaces.
function clean(node) {
  const copy = node.cloneNode(true);
  copy.querySelectorAll("script").forEach((script) => script.remove());
  copy.querySelectorAll("*").forEach((element) => element.append(" "));
  return copy.textContent.replace(/\s+/g, " ").trim();
}

describe("/webdesign-schleswig-holstein route and metadata", () => {
  it("is an approved prerendered route with the confirmed commercial metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        path: PATH,
        outFile: OUT_FILE,
        title: "Webdesign Schleswig-Holstein: Website ab 829 € | TigerFlow",
        description:
          "Webdesign für Unternehmen in Schleswig-Holstein: responsive Website, Texte, technische SEO-Basis und klarer Anfrageweg – ab 829 € netto.",
        ogTitle: "Webdesign für Unternehmen in Schleswig-Holstein | TigerFlow",
        ogDescription:
          "Moderne Unternehmenswebsites mit klarem Leistungsumfang, digitaler Zusammenarbeit und ausbaufähiger technischer Grundlage.",
        changefreq: "monthly",
      })
    );
    expect(["0.8", "0.9"]).toContain(route.priority);
    expect(existsSync(path.join(DIST_DIR, OUT_FILE))).toBe(true);
  });

  it("keeps the title at 58 and the description at 136 characters", () => {
    expect(route.title).toHaveLength(58);
    expect(route.description).toHaveLength(136);
  });

  it("ships title, description, self-canonical, robots and Open Graph in the initial HTML", () => {
    const doc = loadDoc();
    const meta = (selector) => doc.querySelector(selector)?.getAttribute("content");
    expect(doc.title).toBe(route.title);
    expect(meta('meta[name="description"]')).toBe(route.description);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE_URL}${PATH}`
    );
    expect(meta('meta[name="robots"]')).toBe("index, follow");
    expect(meta('meta[property="og:title"]')).toBe(route.ogTitle);
    expect(meta('meta[property="og:description"]')).toBe(route.ogDescription);
    expect(meta('meta[property="og:url"]')).toBe(`${SITE_URL}${PATH}`);
  });

  it("has metadata distinct from every other money page", () => {
    for (const other of ["/webdesign-heide", "/webdesign-dithmarschen", "/seo-heide"]) {
      const otherRoute = ROUTES.find(({ path: routePath }) => routePath === other);
      expect(route.title).not.toBe(otherRoute.title);
      expect(route.description).not.toBe(otherRoute.description);
      expect(route.ogTitle).not.toBe(otherRoute.ogTitle ?? otherRoute.title);
    }
  });

  it("appears in the sitemap exactly once as an absolute https URL", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap.split(`<loc>${SITE_URL}${PATH}</loc>`)).toHaveLength(2);
  });

  it("renders exactly one H1 with the confirmed wording in the initial HTML", () => {
    const doc = loadDoc();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(clean(doc.querySelector("h1"))).toBe(
      "Webdesign in Schleswig-Holstein, das Marke, Inhalte und Anfrageweg zusammenführt."
    );
  });
});

describe("/webdesign-schleswig-holstein hero", () => {
  const getDoc = () => loadDoc();

  it("renders eyebrow, lead, price line, scope note and both CTAs", () => {
    const doc = getDoc();
    const hero = doc.querySelector(".wsh-hero");
    expect(hero).not.toBeNull();
    const text = clean(hero);
    expect(text).toContain("WEBDESIGN FÜR SCHLESWIG-HOLSTEIN");
    expect(text).toContain(
      "TigerFlow aus Heide entwickelt moderne Unternehmenswebsites für Betriebe in ganz Schleswig-Holstein – responsive, verständlich aufgebaut und mit einer technischen Grundlage, die sich weiterentwickeln lässt."
    );
    expect(text).toContain("Websites ab 829 € netto");
    expect(text).toMatch(/zuzüglich gesetzlicher Umsatzsteuer/);
    expect(text).toContain(
      "Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz im bestätigten Einstiegsscope. Nach der Bedarfsklärung erhalten Sie ein individuelles Festpreisangebot."
    );
    expect(hero.querySelector("button[data-project-check-cta]").textContent.trim()).toBe(
      "Website-Projekt unverbindlich prüfen"
    );
    const secondary = hero.querySelector('a[href="#leistungen"]');
    expect(secondary?.textContent.trim()).toBe("Leistungsumfang ansehen");
  });

  it("does not expose a keyword list in the hero", () => {
    const hero = getDoc().querySelector(".wsh-hero");
    expect(hero.querySelector("ul, ol")).toBeNull();
    expect(clean(hero)).not.toMatch(/Webagentur|Webdesigner|Webdesign Agentur|Website erstellen lassen/);
  });

  it("ships the website-system visual as decorative, non-interactive markup", () => {
    const visual = getDoc().querySelector(".wsh-system-visual");
    expect(visual).not.toBeNull();
    expect(visual.getAttribute("aria-hidden")).toBe("true");
    expect(visual.querySelector("a, button, input, [tabindex]")).toBeNull();
    for (const layer of ["structure", "content", "mobile", "inquiry"]) {
      expect(visual.querySelector(`[data-wsh-layer="${layer}"]`), layer).not.toBeNull();
    }
    expect(visual.querySelector(".wsh-canvas")).not.toBeNull();
    expect(clean(visual)).toContain("aus Heide · für Schleswig-Holstein");
  });

  it("is server-rendered without hidden reveal states", () => {
    const html = readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8");
    expect(html).not.toContain("wsh-reveal-pending");
  });
});

describe("/webdesign-schleswig-holstein briefed sections", () => {
  const getDoc = () => loadDoc();
  const getText = () => pageText(getDoc());

  it("renders every briefed eyebrow and H2 in order", () => {
    const doc = getDoc();
    const h2s = [...doc.querySelectorAll("main h2")].map(clean);
    expect(h2s).toEqual([
      "Gestaltung, Inhalte, Technik und Anfrageweg müssen zusammenarbeiten.",
      "Unterschiedliche Unternehmen brauchen keine Schablone, sondern eine passende Webstruktur.",
      "Was Ihre neue TigerFlow-Website im Einstieg mitbringt.",
      "Regional erreichbar. Digital ohne unnötige Wege organisiert.",
      "Ab 829 € netto für eine klar definierte Unternehmenswebsite.",
      "Vier klare Schritte von der Ausgangslage bis zum Launch.",
      "Die Website kann mit dem tatsächlichen Bedarf weiterwachsen.",
      "Häufige Fragen zu Webdesign in Schleswig-Holstein",
      "Klären wir, welche Website zu Ihrem Unternehmen und Ihrem nächsten Schritt passt.",
    ]);
    const text = getText();
    for (const eyebrow of [
      "WEBSITE ALS SYSTEM",
      "AUSGANGSLAGEN",
      "EINSTIEGSSCOPE",
      "AUS HEIDE · FÜR SCHLESWIG-HOLSTEIN",
      "TRANSPARENTER EINSTIEG",
      "PROJEKTABLAUF",
      "AUSBAU STATT NEUSTART",
      "PROJEKTANFRAGE",
    ]) {
      expect(text).toContain(eyebrow);
    }
  });

  it("uses the briefed section ids", () => {
    const doc = getDoc();
    for (const id of ["leistungen", "preis", "ablauf", "faq", "projektanfrage"]) {
      expect(doc.querySelector(`main section#${id}`), id).not.toBeNull();
    }
  });

  it("explains the four connected website layers without claiming one structure fits all", () => {
    const doc = getDoc();
    const layers = [...doc.querySelectorAll("#system ol > li")].map(clean);
    expect(layers).toHaveLength(4);
    [
      "Positionierung und Struktur Besucher verstehen schnell, was das Unternehmen anbietet und für wen.",
      "Inhalte und Vertrauen Leistungen, Rahmenbedingungen und Kontaktmöglichkeiten sind verständlich formuliert.",
      "Mobile Nutzung und Technik Die Website funktioniert auf Mobilgeräten, lädt ihre Kerninhalte zuverlässig und ist technisch indexierbar.",
      "Anfrage und Weiterentwicklung Der Weg zur Kontaktaufnahme ist klar; spätere Erweiterungen bleiben möglich.",
    ].forEach((expected, index) => expect(layers[index]).toContain(expected));
    expect(getText()).toContain("Nicht jeder Betrieb braucht dieselbe Struktur.");
    expect(getText()).not.toMatch(/(?<!Nicht )jeder Betrieb (braucht|benötigt) dieselbe/);
  });

  it("shows four typical project situations labelled as no case studies", () => {
    const doc = getDoc();
    const items = [...doc.querySelectorAll("#ausgangslagen ol > li")].map(clean);
    expect(items).toHaveLength(4);
    [
      "Erster professioneller Webauftritt Für Unternehmen, deren Leistungen bisher online kaum oder nur über Verzeichnisse sichtbar sind.",
      "Bestehende Website modernisieren Für veraltete Technik, unklare Inhalte oder eine mobile Darstellung, die nicht mehr zum Betrieb passt.",
      "Mehrere Leistungen oder Einzugsgebiete ordnen Für Unternehmen, die verschiedene Zielgruppen, Leistungen oder regionale Einsatzgebiete verständlich abbilden müssen.",
      "Grundlage für weiteres Wachstum schaffen Für Unternehmen, die später SEO, Buchung, Follow-up oder Automatisierungen ergänzen möchten.",
    ].forEach((expected, index) => expect(items[index]).toContain(expected));
    expect(getText()).toContain(
      "Typische Projektsituationen – keine Fallstudien oder Referenzbehauptungen."
    );
  });

  it("lists the complete entry scope", () => {
    const scope = clean(getDoc().querySelector("#leistungen"));
    for (const item of [
      "Bis zu fünf Inhaltsseiten",
      "Impressum und Datenschutz als Entwürfe",
      "Responsive Umsetzung für Mobil, Tablet und Desktop",
      "Erstellung oder Überarbeitung vereinbarter Texte",
      "Einbindung und Optimierung vorhandener beziehungsweise vereinbarter lizenzierter Bilder",
      "Verlinkung vorhandener Social-Media-Profile",
      "Technische SEO-Basis",
      "Technisch sinnvolle Barrierefreiheits-Basis",
      "Einfacher Anfragefunnel",
      "Veröffentlichung über Vercel",
      "Domain- und DNS-Anbindung",
      "50 % bei Beauftragung",
      "50 % vor beziehungsweise zum Launch",
      "individuelles Festpreisangebot nach der Bedarfsklärung",
    ]) {
      expect(scope, item).toContain(item);
    }
  });

  it("separates every optional extension from the entry price", () => {
    const scope = clean(getDoc().querySelector("#leistungen"));
    expect(scope).toMatch(/Nicht automatisch im Einstiegspreis enthalten/);
    for (const item of [
      "Zusätzliche Seiten und umfangreiche Zusatzinhalte",
      "Fotoshooting oder externe Medienproduktion",
      "Formale Barrierefreiheitsprüfung oder pauschale Compliance-Zusage",
      "SEO-Setup und laufende SEO-Betreuung",
      "Local SEO und Arbeit am Google-Unternehmensprofil",
      "Terminbuchung",
      "E-Mail-Follow-up",
      "Website-KI",
      "CRM- und Automatisierungsprozesse",
      "Individuelle Schnittstellen oder Webanwendungen",
      "Laufende Betreuung und Wartung",
    ]) {
      expect(scope, item).toContain(item);
    }
  });

  it("states the legal, accessibility and third-party cost boundaries visibly", () => {
    const scope = clean(getDoc().querySelector("#leistungen"));
    expect(scope).toContain("keine Rechtsberatung");
    expect(scope).toContain("keine Rechtssicherheitsgarantie");
    expect(scope).toMatch(/Barrierefreiheitsprüfung ist nicht automatisch enthalten/);
    expect(scope).toContain("Fremd-, Domain- und Lizenzkosten trägt grundsätzlich der Kunde");
    expect(scope).toMatch(/Zusatzleistungen werden separat vereinbart/);
  });

  it("explains the nationwide working mode without claiming offices", () => {
    const section = clean(getDoc().querySelector("#zusammenarbeit"));
    expect(section).toContain("TigerFlow sitzt in Heide");
    expect(section).toContain("Unternehmen in ganz Schleswig-Holstein können betreut werden");
    expect(section).not.toMatch(/arbeitet[^.]*mit Unternehmen|betreut Unternehmen im gesamten/);
    expect(section).toMatch(/Briefing, Strukturabstimmung, Designfreigabe und Korrekturen/);
    expect(section).toMatch(/Persönliche Termine sind kein pauschal zugesagter Standard/);
    expect(section).toMatch(/kein Ersatz für klare Kommunikation/);
    expect(getText()).not.toMatch(/Niederlassung|Büro in|Standort(e)? in|Kiel|Lübeck|Flensburg|Neumünster/);
  });

  it("keeps the floating navigation in document order without adding a second banner landmark", () => {
    const doc = getDoc();
    const primaryHeader = doc.querySelector(".wsh-nav");
    const floatingBar = doc.querySelector(".wsh-bar");
    const main = doc.querySelector("main");
    expect(primaryHeader.tagName).toBe("HEADER");
    expect(floatingBar.tagName).toBe("DIV");
    expect(doc.querySelectorAll("header")).toHaveLength(1);
    expect(primaryHeader.compareDocumentPosition(floatingBar) & 4).toBeTruthy();
    expect(floatingBar.compareDocumentPosition(main) & 4).toBeTruthy();
    expect(floatingBar.hasAttribute("inert")).toBe(true);
    expect(floatingBar.getAttribute("aria-hidden")).toBe("true");
  });

  it("states price, VAT, scope, payment model and fixed-price offer in the price section", () => {
    const price = clean(getDoc().querySelector("#preis"));
    expect(price).toContain("ab 829 € netto");
    expect(price).toMatch(/zuzüglich gesetzlicher Umsatzsteuer/);
    expect(price).toMatch(/bis zu fünf Inhaltsseiten/i);
    expect(price).toMatch(/Impressum und Datenschutz zusätzlich/);
    expect(price).toContain("50 % bei Beauftragung");
    expect(price).toContain("50 % vor beziehungsweise zum Launch");
    expect(price).toMatch(/individuelle[rn]? Festpreis/);
    expect(price).toMatch(/Zusatzumfang wird separat kalkuliert/);
    expect(price).not.toMatch(/Streichpreis|statt \d|Rabatt|nur noch|Countdown|begrenzt verfügbar/i);
  });

  it("lists the four process steps and names no flat project duration", () => {
    const doc = getDoc();
    const steps = [...doc.querySelectorAll("#ablauf ol > li")].map((li) =>
      clean(li).toLowerCase()
    );
    expect(steps).toHaveLength(4);
    [
      "bedarf, zielgruppen und umfang klären",
      "seitenstruktur, inhalte und design entwickeln",
      "responsive website umsetzen und gemeinsam prüfen",
      "freigeben, domain anbinden und veröffentlichen",
    ].forEach((expected, index) => expect(steps[index]).toContain(expected));

    const text = getText();
    expect(text).toMatch(/Umfang, (vorhandenem )?Material, Rückmeldungen und Zusatzfunktionen/);
    expect(text).not.toMatch(/\d+\s*(Tage|Tagen|Wochen|Monate|Monaten)\b(?! Mindestlaufzeit)/);
  });

  it("presents the growth options and states they are not included", () => {
    const section = clean(getDoc().querySelector("#ausbau"));
    for (const item of [
      "laufende Website-Betreuung",
      "SEO-Setup und laufende SEO-Betreuung",
      "Terminbuchung",
      "E-Mail-Follow-up",
      "Website-KI",
      "CRM- und Automatisierungsprozesse",
    ]) {
      expect(section.toLowerCase(), item).toContain(item.toLowerCase());
    }
    expect(section).toContain(
      "Diese Leistungen sind nicht automatisch im Website-Einstieg enthalten und werden separat vereinbart."
    );
  });

  it("closes with the briefed copy and a project check CTA", () => {
    const final = getDoc().querySelector("#projektanfrage");
    expect(clean(final)).toContain(
      "Im unverbindlichen Projekt-Check ordnen wir Ausgangslage, benötigte Inhalte und sinnvolle Erweiterungen ein. Eine Anfrage löst noch keine Beauftragung aus."
    );
    expect(final.querySelector("button[data-project-check-cta]").textContent.trim()).toBe(
      "Website-Projekt prüfen"
    );
  });
});

describe("/webdesign-schleswig-holstein FAQ", () => {
  const QUESTIONS = [
    "Was kostet eine Website bei TigerFlow?",
    "Was ist im Einstiegspreis enthalten?",
    "Arbeitet TigerFlow mit Unternehmen in ganz Schleswig-Holstein?",
    "Wie läuft die Zusammenarbeit über größere Entfernungen ab?",
    "Kann eine bestehende Website überarbeitet werden?",
    "Wie lange dauert ein Website-Projekt?",
    "Ist Suchmaschinenoptimierung enthalten?",
    "Kann ich die Website später erweitern lassen?",
    "Welche laufenden Kosten entstehen nach dem Launch?",
    "Sind Impressum und Datenschutz rechtssicher enthalten?",
  ];
  const entries = () => [...loadDoc().querySelectorAll("#faq details")];
  const answer = (details) => clean(details.querySelector(".wsh-faq-answer"));

  it("uses native details/summary for all ten briefed questions, closed by default", () => {
    const all = entries();
    expect(all).toHaveLength(QUESTIONS.length);
    all.forEach((details, index) => {
      expect(details.hasAttribute("open")).toBe(false);
      expect(clean(details.querySelector("summary"))).toBe(QUESTIONS[index]);
      expect(answer(details).length).toBeGreaterThan(60);
    });
  });

  it("answers within the confirmed limits", () => {
    const all = entries();
    expect(answer(all[0])).toMatch(/829 € netto zuzüglich gesetzlicher Umsatzsteuer/);
    expect(answer(all[0])).toMatch(/50 % bei Beauftragung/);
    expect(answer(all[5])).toMatch(/Eine pauschale Dauer nennen wir nicht/);
    expect(answer(all[6])).toMatch(/technische SEO-Basis ist enthalten/);
    expect(answer(all[6])).toMatch(/separat/);
    expect(answer(all[9])).toMatch(/Entwürfe/);
    expect(answer(all[9])).toMatch(/keine Rechtsberatung/);
    expect(answer(all[9])).toMatch(/keine Rechtssicherheitsgarantie/);
  });

  it("states the optional care packages completely and correctly", () => {
    const text = answer(entries()[8]);
    for (const part of [
      "Fremdkosten",
      "49 € netto pro Monat",
      "bis zu 30 Minuten",
      "99 € netto pro Monat",
      "bis zu eine Stunde plus Analytics",
      "199 € netto pro Monat",
      "bis zu zwei Stunden plus Monatsauswertung",
      "Mindestlaufzeit von drei Monaten",
      "99 € netto pro Stunde",
    ]) {
      expect(text, part).toContain(part);
    }
  });
});

describe("/webdesign-schleswig-holstein linking, claims and keywords", () => {
  const getDoc = () => loadDoc();

  it("links crawlably to the related pages with descriptive anchors", () => {
    const doc = getDoc();
    const hrefs = [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    for (const href of [
      "/",
      "/webdesign-heide",
      "/webdesign-dithmarschen",
      "/seo-heide",
      "/impressum",
      "/datenschutz",
    ]) {
      expect(hrefs, href).toContain(href);
    }
    for (const href of ["/webdesign-heide", "/webdesign-dithmarschen", "/seo-heide"]) {
      const link = doc.querySelector(`main a[href="${href}"]`);
      expect(link, href).not.toBeNull();
      expect(link.textContent.trim().length).toBeGreaterThan(14);
    }
    expect(doc.querySelector('.wsh-logo, header a[href="/"]')).not.toBeNull();
  });

  it("loads no external hosts and no assets beyond the existing brand mark", () => {
    const root = getDoc().getElementById("root");
    for (const a of root.querySelectorAll("a[href]")) {
      expect(a.getAttribute("href")).not.toMatch(/^https?:\/\//);
    }
    for (const img of root.querySelectorAll("img")) {
      expect(img.getAttribute("src")).toBe("/tigerflow-mark.png");
    }
  });

  it("links the approved route crawlably from the shared service menu on every page", () => {
    for (const file of [
      "index.html",
      "webdesign-heide.html",
      "webdesign-dithmarschen.html",
      "seo-heide.html",
      OUT_FILE,
    ]) {
      const link = loadDoc(file).querySelector(`.tf-service-menu a[href="${PATH}"]`);
      expect(link, file).not.toBeNull();
      expect(clean(link)).toBe("Webdesign Schleswig-Holstein");
    }
    const current = getDoc().querySelector(`.tf-service-menu a[href="${PATH}"]`);
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("does not change the homepage hero", () => {
    const home = loadDoc("index.html");
    expect(clean(home.querySelector("h1"))).toBe("Wir bauen");
  });

  it("makes no unapproved claims, guarantees or invented proof", () => {
    // The briefed disclaimer names what the page does not offer; everything else is checked.
    const text = pageText(getDoc()).replace(
      "Typische Projektsituationen – keine Fallstudien oder Referenzbehauptungen.",
      ""
    );
    expect(text).not.toMatch(
      /\b(beste|beste[nrms]|führend\w*|größte[nrms]?|Marktführer|Nummer 1)\b[^.]*(Webagentur|Agentur|Webdesigner)/i
    );
    expect(text).not.toMatch(/garantiert (mehr|bessere|Platz)|Platz 1 bei Google|mehr Umsatz|mehr Kunden/i);
    expect(text).not.toMatch(/DSGVO-konform|BFSG|WCAG|barrierefrei\b/i);
    expect(text).not.toMatch(/Fallstudie|Kundenstimme|Bewertungen|Referenzkunden|Referenzprojekte|★|Lighthouse|PageSpeed/i);
    // The only percentage on the page is the confirmed 50/50 payment model.
    for (const percent of text.match(/\d+\s*%/g) ?? []) expect(percent).toBe("50 %");
    expect(text).not.toMatch(/\d+\s*(Kunden|Projekte|Rankings|Besucher|Jahre Erfahrung)\b/);
    expect(text).not.toMatch(/schnelle Ergebnisse|sofort mehr|in \d+ (Tagen|Wochen)/i);

    const sentences = text.split(/(?<=[.?!])\s+/);
    for (const sentence of sentences) {
      if (/garantier|Platz 1|rechtssicher|Rechtssicherheit/i.test(sentence)) {
        const isQuestion = sentence.trim().endsWith("?");
        const isNegated = /\b(kein|keine|keinen|keiner|nicht|weder|nie|niemand|ohne)\b/i.test(
          sentence
        );
        expect(isQuestion || isNegated, sentence).toBe(true);
      }
    }
  });

  it("distributes the keyword cluster naturally without stuffing", () => {
    const text = pageText(getDoc());
    for (const pattern of [
      /Webdesign (in|für)[^.]{0,40}Schleswig-Holstein/,
      /Webagentur/,
      /Webdesign-Agentur|Webdesign Agentur/,
      /Website erstellen lassen/,
      /professionelles Webdesign/i,
      /Unternehmenswebsite/,
      /Webdesigner/,
    ]) {
      expect(text).toMatch(pattern);
    }
    const mentions = (text.match(/Schleswig-Holstein/g) ?? []).length;
    expect(mentions).toBeGreaterThanOrEqual(6);
    expect(mentions).toBeLessThanOrEqual(16);
    expect((text.match(/Webdesign (in|für)[^.]{0,40}Schleswig-Holstein/g) ?? []).length).toBeLessThanOrEqual(6);
  });

  it("keeps the heading hierarchy without skipped levels", () => {
    const levels = [...getDoc().querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

describe("/webdesign-schleswig-holstein structured data", () => {
  it("ships consistent JSON-LD for WebPage, Service, BreadcrumbList and the fully visible FAQ", () => {
    const doc = loadDoc();
    const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    expect(scripts.length).toBeGreaterThan(0);
    const nodes = scripts.flatMap((script) => {
      const data = JSON.parse(script.textContent);
      return data["@graph"] ?? [data];
    });
    const byType = (type) => nodes.filter((node) => node["@type"] === type);
    for (const type of ["WebPage", "Service", "BreadcrumbList", "FAQPage"]) {
      expect(byType(type), type).toHaveLength(1);
    }

    const url = `${SITE_URL}${PATH}`;
    expect(byType("WebPage")[0].url).toBe(url);
    expect(byType("WebPage")[0].name).toBe(route.title);

    const service = byType("Service")[0];
    expect(service.areaServed.name).toBe("Schleswig-Holstein");
    expect(service.provider.address.addressLocality).toBe("Heide");
    expect(service.offers.priceSpecification.minPrice).toBe(829);
    expect(service.offers.priceSpecification.priceCurrency).toBe("EUR");
    expect(service.offers.priceSpecification.valueAddedTaxIncluded).toBe(false);
    expect(service.offers.priceSpecification.description).toMatch(/netto/);

    const crumbs = byType("BreadcrumbList")[0].itemListElement;
    expect(crumbs.map((item) => item.item)).toEqual([`${SITE_URL}/`, url]);
    expect(crumbs.map((item) => item.name)).toEqual([
      "Startseite",
      "Webdesign Schleswig-Holstein",
    ]);

    const faq = byType("FAQPage")[0];
    const visible = [...doc.querySelectorAll("#faq details")].map((details) => ({
      q: clean(details.querySelector("summary")),
      a: clean(details.querySelector(".wsh-faq-answer")),
    }));
    expect(faq.mainEntity).toHaveLength(visible.length);
    faq.mainEntity.forEach((entry, index) => {
      expect(entry.name).toBe(visible[index].q);
      expect(entry.acceptedAnswer.text).toBe(visible[index].a);
    });

    const serialized = JSON.stringify(nodes);
    for (const key of ["aggregateRating", "review", "reviewRating"]) {
      expect(serialized).not.toContain(key);
    }
    for (const city of ["Kiel", "Lübeck", "Flensburg"]) {
      expect(serialized).not.toContain(city);
    }
  });
});

describe("/webdesign-schleswig-holstein stylesheet invariants", () => {
  const css = readFileSync(
    path.join(process.cwd(), "src/components/WebdesignSchleswigHolsteinPage.css"),
    "utf8"
  );

  // Inner text of every block whose prelude matches `prelude` (brace matched).
  function blocks(source, prelude) {
    const result = [];
    const regex = new RegExp(prelude.source, "g");
    while (regex.exec(source)) {
      const start = regex.lastIndex;
      let depth = 1;
      let i = start;
      while (i < source.length && depth > 0) {
        if (source[i] === "{") depth += 1;
        if (source[i] === "}") depth -= 1;
        i += 1;
      }
      result.push(source.slice(start, i - 1));
    }
    return result;
  }

  function stripBlocks(source, prelude) {
    let out = source;
    for (const inner of blocks(source, prelude)) out = out.replace(inner, "");
    return out;
  }

  const hoverMedia =
    /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)\s*\{/;
  const luminance = (hex) => {
    const full = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join("") : hex.slice(1);
    const [r, g, b] = [0, 2, 4]
      .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it("styles the page in its own isolated wsh- namespace", () => {
    expect(css).toMatch(/\.wsh-page\b/);
    expect(css).not.toMatch(/(?<![-\w])\.(sh|wdh|wdd|tf)-/);
  });

  it("shows a visible focus indicator for links, buttons and summaries", () => {
    expect(css).toMatch(/\.wsh-page a:focus-visible/);
    expect(css).toMatch(/\.wsh-page button:focus-visible/);
    expect(css).toMatch(/\.wsh-page summary:focus-visible/);
    expect(css).toMatch(/:focus-visible[^}]*outline:\s*2px solid #FF7A00/);
  });

  it("gates every hover rule behind (hover: hover) and (pointer: fine)", () => {
    expect(css).toMatch(hoverMedia);
    expect(stripBlocks(css, hoverMedia)).not.toMatch(/:hover/);
  });

  it("honours prefers-reduced-motion by removing animation, transition and reveal offsets", () => {
    const reduced = blocks(css, /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/);
    expect(reduced.length).toBeGreaterThan(0);
    const body = reduced.join("\n");
    expect(body).toMatch(/animation:\s*none\s*!important/);
    expect(body).toMatch(/transition:\s*none\s*!important/);
    expect(body).toMatch(/\.wsh-reveal-pending/);
    expect(body).toMatch(/transform:\s*none\s*!important/);
  });

  it("handles reduced transparency, forced colors and a missing backdrop-filter", () => {
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-transparency\s*:\s*reduce\s*\)/);
    const forced = blocks(css, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/);
    expect(forced.length).toBeGreaterThan(0);
    expect(forced.join("\n")).toMatch(/border/);
    expect(forced.join("\n")).toMatch(/CanvasText|ButtonText|Highlight|LinkText/);
    expect(css).toMatch(/@media\s*\(\s*prefers-contrast\s*:\s*more\s*\)/);
  });

  it("never uses transition: all, scale(0) or bare ease-in", () => {
    expect(css).not.toMatch(/transition(-property)?\s*:\s*all\b/);
    expect(css).not.toMatch(/scale[XYZ3d]*\(\s*0\s*[,)]/);
    expect(css).not.toMatch(/\bease-in\b(?!-out)/);
  });

  it("moves things with transform and opacity only", () => {
    for (const frames of blocks(css, /@keyframes\s+[\w-]+\s*\{/)) {
      const properties = [...frames.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      for (const property of properties) {
        expect(["transform", "opacity"], property).toContain(property);
      }
    }
    for (const [, value] of css.matchAll(/transition\s*:\s*([^;}]+)/g)) {
      const props = value.split(/,(?![^(]*\))/).map((part) => part.trim().split(/\s+/)[0]);
      for (const property of props) {
        expect(
          ["transform", "opacity", "color", "background-color", "border-color", "none"],
          property
        ).toContain(property);
      }
    }
  });

  it("keeps UI transitions under 300 ms and entrance animations under 700 ms", () => {
    expect(css).toMatch(/--wsh-ease-out:\s*cubic-bezier\(\.23,\s*1,\s*\.32,\s*1\)/);
    for (const [, value] of css.matchAll(/transition\s*:\s*([^;}]+)/g)) {
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
        expect(ms, value).toBeLessThanOrEqual(300);
      }
    }
    for (const [, value] of css.matchAll(/(?<![-\w])animation\s*:\s*([^;}]+)/g)) {
      // The single slow ambient signal may loop; everything else is a one-shot entrance.
      if (/\binfinite\b/.test(value)) continue;
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
        expect(ms, value).toBeLessThanOrEqual(700);
      }
    }
  });

  it("limits looping motion to a single quiet ambient signal", () => {
    const loops = [...css.matchAll(/(?<![-\w])animation\s*:\s*([^;}]+)/g)].filter(([, value]) =>
      /\binfinite\b/.test(value)
    );
    expect(loops.length).toBeLessThanOrEqual(1);
  });

  it("gives pressable elements instant press feedback", () => {
    expect(css).toMatch(/\.wsh-btn:active\s*\{[^}]*scale\(\.9[5-8]\)/);
  });

  it("uses backdrop-filter only inside @supports on top of a solid readable background", () => {
    const outsideSupports = stripBlocks(css, /@supports[^{]*\{/).replace(
      /@supports[^{]*\{\s*\}/g,
      ""
    );
    expect(outsideSupports).not.toMatch(/backdrop-filter/);
    expect(css).toMatch(/@supports\s*\(\(?\s*(-webkit-)?backdrop-filter/);
    expect(css).toMatch(/\.wsh-glass\s*\{[^}]*background:\s*#[0-9A-Fa-f]{6}\b/);
  });

  it("keeps text readable: every hex text colour reaches 4.5:1 on the darkest panel", () => {
    const colours = [...css.matchAll(/(?<![-\w])color\s*:\s*(#[0-9A-Fa-f]{3,6})\b/g)].map((m) =>
      m[1].toUpperCase()
    );
    expect(colours.length).toBeGreaterThan(5);
    for (const colour of new Set(colours)) {
      if (colour === "#111" || colour === "#111111") continue;
      expect(contrast(colour, "#0A0A0A"), colour).toBeGreaterThanOrEqual(4.5);
    }
    expect(css).toMatch(/\.wsh-btn\s*\{[^}]*background:\s*#FF7A00;[^}]*color:\s*#111111/);
    expect(contrast("#111111", "#FF7A00")).toBeGreaterThanOrEqual(4.5);
  });

  it("is built for 320 px without hiding page-level overflow and offers 44 px touch targets", () => {
    expect(css).not.toMatch(/\.wsh-page\s*\{[^}]*overflow-x:\s*(?:clip|hidden)/);
    expect(css).not.toMatch(/(?<![-\w])(html|body)\s*\{[^}]*overflow-x/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*760px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*420px\s*\)/);
    expect(css).toMatch(/\.wsh-btn\s*\{[^}]*min-height:\s*(4[4-9]|[5-9]\d)px/);
    expect(css).not.toMatch(/(?<![-\w])min-width\s*:\s*(3[2-9]\d|[4-9]\d\d|\d{4,})px/);
  });
});
