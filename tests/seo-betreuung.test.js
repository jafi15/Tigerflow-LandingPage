import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { ROUTE_PAGES } from "../src/routePages.js";

const PATH = "/seo-betreuung";
const OUT_FILE = "seo-betreuung.html";
const CTA = "SEO-Betreuung unverbindlich anfragen";

const docs = new Map();
function loadDoc(file = OUT_FILE) {
  if (!docs.has(file)) {
    docs.set(file, new JSDOM(readFileSync(path.join(DIST_DIR, file), "utf8")).window.document);
  }
  return docs.get(file);
}
const clean = (node) => node.textContent.replace(/\s+/g, " ").trim();
const all = (selector, file) => [...loadDoc(file).querySelectorAll(selector)];
const texts = (selector, file) => all(selector, file).map(clean);
const section = (id) => loadDoc().getElementById(id);
const mainText = () => clean(loadDoc().querySelector("main"));
const source = (file) => readFileSync(path.join(process.cwd(), "src/components", file), "utf8");
const css = () => source("SeoBetreuungPage.css");

describe("/seo-betreuung route and rendering", () => {
  const route = ROUTES.find((r) => r.path === PATH);

  it("is registered with the briefed metadata in all three layers", () => {
    expect(route).toMatchObject({
      outFile: OUT_FILE,
      title: "Laufende SEO-Betreuung für Unternehmen | TigerFlow",
      description:
        "Laufende SEO-Betreuung mit Monitoring, Onpage-Optimierung, interner Verlinkung und Monatsbericht. Umfang und Preis werden individuell vereinbart.",
      changefreq: "monthly",
      priority: "0.9",
    });
    expect(ROUTE_PAGES[PATH].source).toBe("src/components/SeoBetreuungPage.jsx");
    const server = readFileSync(path.join(process.cwd(), "src/entry-server.jsx"), "utf8");
    expect(server).toContain('"/seo-betreuung": SeoBetreuungPage');
    expect(source("SeoBetreuungPage.jsx")).not.toMatch(/React\.lazy|Suspense/);
  });

  it("ships complete, indexable initial HTML with one H1 and one banner", () => {
    const doc = loadDoc();
    expect(doc.querySelector("#root .sb-page")).not.toBeNull();
    expect(texts("h1")).toEqual(["Laufende SEO-Betreuung: Monat für Monat klar priorisiert."]);
    expect(all("header")).toHaveLength(1);
    expect(all("main")).toHaveLength(1);
    expect(doc.querySelector(".sb-skip").getAttribute("href")).toBe("#inhalt");
    expect(doc.querySelector('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE_URL}${PATH}`);
    expect(doc.querySelector('meta[name="robots"]').getAttribute("content")).toBe("index, follow");
    expect(readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8")).not.toContain("sb-reveal-pending");
  });

  it("uses the briefed section order and headings", () => {
    expect(all("main > section[id]").map((s) => s.id)).toEqual([
      "ausgangslage", "arbeitskreislauf", "leistungskern", "leistungsrahmen", "voraussetzung",
      "grenzen", "zusammenarbeit", "preis", "erfolgsmessung", "faq", "projektanfrage",
    ]);
    expect(texts("main h2")).toEqual([
      "Wenn SEO nach dem Maßnahmenplan nicht liegen bleiben soll",
      "Ein monatlicher Arbeitskreislauf statt einzelner SEO-Aktionen",
      "Was in jeder SEO-Betreuung enthalten ist",
      "Welcher Leistungsrahmen zur Website passt",
      "Voraussetzung: eine belastbare SEO-Grundlage",
      "Was nicht automatisch zur laufenden Betreuung gehört",
      "Zusammenarbeit mit klaren Freigaben",
      "Individuell kalkuliert und klar abgegrenzt",
      "Erfolg wird entlang der gesamten Kette eingeordnet",
      "Häufige Fragen zur laufenden SEO-Betreuung",
      "Klären wir, welcher laufende SEO-Rahmen zu Ihrer Website passt.",
    ]);
  });
});

describe("/seo-betreuung hero", () => {
  const hero = () => loadDoc().querySelector(".sb-hero");

  it("carries the briefed copy, anchors and limit", () => {
    const text = clean(hero());
    expect(clean(hero().querySelector(".sb-eyebrow"))).toBe("LAUFENDE SEO-BETREUUNG");
    for (const phrase of [
      "TigerFlow überwacht relevante Suchdaten, prüft technische und inhaltliche Entwicklungen und setzt die vereinbarten SEO-Maßnahmen in einer nachvollziehbaren Reihenfolge um.",
      "Monitoring · Onpage · interne Verlinkung · Monatsbericht",
      "Individuell kalkuliert",
      "sechs Monate Mindestlaufzeit",
      "Voraussetzung ist ein SEO-Setup oder eine nach Prüfung gleichwertige Analyse. Umfang, Zugänge und Fremdkosten werden individuell vereinbart.",
    ]) {
      expect(text).toContain(phrase);
    }
    expect(text).not.toMatch(/€/);
  });

  it("offers the project-check button and a jump link to the service core", () => {
    const button = hero().querySelector(".sb-hero-actions button");
    expect(button.getAttribute("type")).toBe("button");
    expect(clean(button)).toBe(CTA);
    const jump = hero().querySelector('.sb-hero-actions a[href^="#"]');
    expect(clean(jump)).toBe("Leistungsrahmen ansehen");
    expect(section(jump.getAttribute("href").slice(1))).not.toBeNull();
  });

  it("shows the work cycle as a decorative schematic without numbers, curves or maps", () => {
    const visual = hero().querySelector(".sb-cycle");
    expect(visual.getAttribute("aria-hidden")).toBe("true");
    expect(all(".sb-cycle [data-sb-phase] b").map(clean)).toEqual([
      "Prüfen", "Priorisieren", "Umsetzen", "Einordnen",
    ]);
    expect(clean(visual)).not.toMatch(/\d|%|Ranking|Platz|Karte|Kurve/);
    expect(visual.querySelectorAll("polyline, image, img")).toHaveLength(0);
  });
});

describe("/seo-betreuung offer", () => {
  it("lists the complete shared core", () => {
    expect(texts("#leistungskern .sb-core h3")).toEqual([
      "Monitoring über Google Search Console und Analytics",
      "Technische SEO-Kontrollen",
      "Onpage-Optimierung bestehender Seiten",
      "Interne Verlinkung",
      "Monatlicher Bericht",
      "Keine Ergebnis- oder Rankinggarantie",
    ]);
    expect(clean(section("leistungskern"))).toMatch(/Fremdkosten sind nicht automatisch enthalten/);
  });

  it("separates Basis, Wachstum and Premium exactly as confirmed", () => {
    const frames = all("#leistungsrahmen [data-sb-frame]");
    expect(frames.map((f) => f.getAttribute("data-sb-frame"))).toEqual(["basis", "wachstum", "premium"]);
    expect(frames.map((f) => clean(f.querySelector("h3")))).toEqual([
      "SEO Basis – vorhandene Seiten gezielt optimieren",
      "SEO Wachstum – laufende Optimierung plus eine Zielseite",
      "SEO Premium – bis zu zwei Zielseiten",
    ]);
    expect(frames.map((f) => clean(f.querySelector(".sb-slot-caption")))).toEqual([
      "Keine neue Zielseite pro Monat",
      "Eine neue oder umfangreich überarbeitete Zielseite pro Monat",
      "Bis zu zwei neue oder umfangreich überarbeitete Zielseiten pro Monat statt einer",
    ]);
    const [basis, wachstum, premium] = frames.map(clean);
    expect(basis).toContain("Optimierung vorhandener Seiten im vereinbarten Umfang");
    expect(basis).toContain("Monatsbericht");
    expect(wachstum).toContain("Alle Leistungen aus SEO Basis");
    expect(wachstum).toContain("Local SEO bei Eignung und vorhandenen Zugängen");
    expect(wachstum).toContain("Bericht mit Handlungsempfehlungen");
    expect(wachstum).toContain("Besprechung nach Bedarf");
    expect(wachstum).toMatch(/sofern vereinbart/);
    expect(premium).toContain("Alle Leistungen aus SEO Wachstum");
    expect(premium).toMatch(/Obergrenze/);
    for (const frame of frames) {
      expect(clean(frame.querySelector(".sb-frame-price"))).toMatch(/individuell kalkuliert/);
      expect(frame.querySelector(".sb-slots").getAttribute("aria-hidden")).toBe("true");
    }
    // Capacity is stepped: no slot, one slot, one slot plus an optional one.
    expect(frames.map((f) => [...f.querySelectorAll(".sb-slot")].map((s) => s.className.replace("sb-slot ", "")))).toEqual([
      ["is-empty", "is-empty"], ["is-filled", "is-empty"], ["is-filled", "is-optional"],
    ]);
    expect(clean(section("leistungsrahmen"))).not.toMatch(/beliebt|beste Wahl|Bestseller|empfohlen|Rabatt|popular/i);
  });

  it("states prerequisite, price logic and contract term", () => {
    const pre = clean(section("voraussetzung"));
    expect(pre).toMatch(/nach Prüfung/);
    expect(pre).toMatch(/gleichwertig/);
    expect(pre).toMatch(/ab 499 € netto/);
    const price = clean(section("preis"));
    for (const phrase of [
      "Sechs Monate", "Monatlich kündbar", "individuellen Angebot",
      "SEO-Setup ab 499 € netto als separates Projekt",
      "separat geprüft, vereinbart und ausgewiesen",
    ]) {
      expect(price).toContain(phrase);
    }
    expect(mainText()).toMatch(/vor (der )?Veröffentlichung/);
  });

  it("compares setup, implementation, SEO care and website care as briefed", () => {
    const table = loadDoc().querySelector("#voraussetzung table.sb-matrix");
    expect([...table.querySelectorAll("thead th")].map(clean).slice(1).map((t) => t.replace(/ Diese Seite$/, ""))).toEqual([
      "SEO-Setup", "Separate Umsetzung", "Laufende SEO-Betreuung", "Website-Betreuung",
    ]);
    expect([...table.querySelectorAll("tbody th")].map(clean)).toEqual([
      "Hauptaufgabe", "Ergebnis", "Preislogik", "Laufzeit", "Neue Zielseiten", "SEO-Monitoring",
    ]);
    const row = (i) => [...table.querySelectorAll("tbody tr")[i].querySelectorAll("td")].map(clean);
    expect(row(2)).toEqual([
      "ab 499 € netto, individueller Festpreis",
      "separat nach Umfang kalkuliert",
      "individuell kalkulierter Monatspreis",
      "öffentliche Pakete ab 49 € netto monatlich",
    ]);
    expect(row(3)[2]).toBe("sechs Monate Mindestlaufzeit, danach monatlich kündbar");
    expect(row(4)[2]).toBe("tarifabhängig: keine, eine oder bis zu zwei pro Monat");
    for (const cell of table.querySelectorAll("tbody td")) expect(cell.getAttribute("data-label")).toBeTruthy();
  });

  it("names all exclusions in four groups", () => {
    expect(texts("#grenzen h3")).toEqual([
      "Umfang außerhalb der Tarife", "Offpage und Werbung",
      "Fremdkosten und formale Prüfungen", "Ergebnisse und Erreichbarkeit",
    ]);
    expect(all("#grenzen .sb-scope li")).toHaveLength(17);
    const text = clean(section("grenzen"));
    for (const phrase of ["Relaunch", "Backlinks", "Media-Budget", "Rechtsprüfung", "WCAG", "Rund-um-die-Uhr-Support", "Übersetzungen", "Digital-PR"]) {
      expect(text).toContain(phrase);
    }
  });

  it("explains cycle, situations, collaboration and measurement", () => {
    expect(texts("#arbeitskreislauf h3")).toEqual([
      "Daten und Indexierung prüfen", "Chancen und Probleme priorisieren",
      "Vereinbarte Maßnahmen umsetzen", "Wirkung einordnen und nächste Schritte festlegen",
    ]);
    expect(all("#ausgangslage .sb-ledger > li")).toHaveLength(4);
    expect(all("#zusammenarbeit .sb-steps > li")).toHaveLength(6);
    expect(all("#erfolgsmessung .sb-measure > li")).toHaveLength(5);
  });
});

describe("/seo-betreuung claims", () => {
  it("shows no monthly price, no notice period and no forbidden promise", () => {
    const main = loadDoc().querySelector("main").cloneNode(true);
    main.querySelector("table.sb-matrix").remove();
    const text = main.textContent.replace(/\s+/g, " ");
    expect([...text.matchAll(/(\d[\d.]*)\s*€/g)].every((m) => m[1] === "499")).toBe(true);
    expect([...mainText().matchAll(/(\d[\d.]*)\s*€/g)].every((m) => ["499", "49"].includes(m[1]))).toBe(true);
    expect(text).not.toMatch(/Kündigungsfrist|zum Monatsende|Monat Frist|Wochen Frist/);
    for (const banned of [
      "Termin buchen", "kostenlose SEO-Analyse", "sofort starten", "Monatspreis sofort", "Platz 1",
      "garantiert mehr", "schnelle Ergebnisse", "jeden Monat bessere", "Testimonial", "Fallstudie",
      "Referenzkunde", "führende", "%",
    ]) {
      expect(mainText(), banned).not.toContain(banned);
    }
  });

  it("stays independent from the two existing SEO pages", () => {
    const own = texts("main h2");
    for (const file of ["seo-heide.html", "seo-schleswig-holstein.html"]) {
      const other = texts("main h2", file);
      expect(own.filter((h) => other.includes(h)), file).toEqual([]);
      const questions = texts("#faq summary", file);
      expect(texts("#faq summary").filter((q) => questions.includes(q)).length, file).toBeLessThanOrEqual(3);
    }
    expect(loadDoc().querySelector(".sb-page .ssh-system-visual, .sb-page .sh-map")).toBeNull();
  });
});

describe("/seo-betreuung FAQ and structured data", () => {
  const QUESTIONS = [
    "Was kostet die SEO-Betreuung bei TigerFlow?",
    "Muss vorher das TigerFlow-SEO-Setup gebucht werden?",
    "Was ist in allen Tarifen enthalten?",
    "Was unterscheidet Basis, Wachstum und Premium?",
    "Werden jeden Monat automatisch neue Seiten veröffentlicht?",
    "Ist Local SEO in der Betreuung enthalten?",
    "Ist Linkaufbau enthalten?",
    "Wie lange läuft die SEO-Betreuung?",
    "Garantiert TigerFlow bessere Rankings oder mehr Anfragen?",
    "Kann TigerFlow eine bestehende Website betreuen?",
    "Wie werden Inhalte freigegeben?",
  ];
  const graph = () => {
    const script = loadDoc().querySelector('#root script[type="application/ld+json"]');
    expect(script.textContent).not.toContain("<");
    return JSON.parse(script.textContent)["@graph"];
  };
  const byType = (type) => graph().find((node) => node["@type"] === type);

  it("renders the eleven briefed questions as closed native details", () => {
    expect(texts("#faq summary")).toEqual(QUESTIONS);
    expect(all("#faq details[open]")).toHaveLength(0);
  });

  it("mirrors the visible FAQ in FAQPage", () => {
    const visible = all("#faq details").map((d) => [clean(d.querySelector("summary")), clean(d.querySelector(".sb-faq-answer"))]);
    expect(byType("FAQPage").mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(visible);
  });

  it("describes page, breadcrumb and service without price, rating or extra location", () => {
    expect(byType("WebPage").url).toBe(`${SITE_URL}${PATH}`);
    expect(byType("BreadcrumbList").itemListElement.map((i) => [i.name, i.item])).toEqual([
      ["Startseite", `${SITE_URL}/`], ["SEO-Betreuung", `${SITE_URL}${PATH}`],
    ]);
    const service = byType("Service");
    expect(service.name).toBe("Laufende SEO-Betreuung");
    expect(service.provider.address).toMatchObject({ addressLocality: "Heide", postalCode: "25746" });
    const raw = JSON.stringify(graph());
    for (const key of ["offers", "Offer", "price", "Review", "AggregateRating", "areaServed"]) {
      expect(raw, key).not.toContain(key);
    }
    expect(raw.match(/PostalAddress/g)).toHaveLength(1);
  });
});

describe("/seo-betreuung internal linking", () => {
  const anchors = (href, file) => texts(`main a[href="${href}"]`, file);

  it("links out with unique descriptive anchors", () => {
    expect(anchors("/seo-heide")).toEqual(["SEO-Setup und Local SEO für Unternehmen in Heide"]);
    expect(anchors("/seo-schleswig-holstein")).toEqual(["SEO-Architektur für mehrere Regionen in Schleswig-Holstein"]);
    expect(anchors("/website-betreuung")).toEqual(["Technische Website-Betreuung und Wartung im Vergleich"]);
    expect(anchors("/preise")).toEqual([
      "Preisübersicht mit SEO-Setup ab 499 € netto", "Alle Preise und Leistungen im Überblick",
    ]);
    expect(all('#projektanfrage a[href="mailto:service@tigerflow.de"]')).toHaveLength(1);
    const own = texts("main a[href^='/']");
    expect(new Set(own).size).toBe(own.length);
    for (const file of ["seo-heide.html", "seo-schleswig-holstein.html"]) {
      const other = texts("main a[href^='/']", file);
      for (const text of own) expect(other, file).not.toContain(text);
    }
  });

  it("links only to published routes, existing anchors or the confirmed e-mail address", () => {
    const published = new Set(ROUTES.map((r) => r.path));
    for (const a of all("#root a[href]")) {
      const href = a.getAttribute("href");
      expect(href).not.toMatch(/^https?:\/\//);
      if (href.startsWith("#")) expect(loadDoc().getElementById(href.slice(1)), href).not.toBeNull();
      else if (href.startsWith("/")) expect(published.has(href.split("#")[0]), href).toBe(true);
      else expect(href).toBe("mailto:service@tigerflow.de");
    }
    for (const img of all("#root img")) expect(img.getAttribute("src")).toBe("/tigerflow-mark.png");
  });

  it("receives one contextual link each from /seo-heide, /seo-schleswig-holstein and /preise", () => {
    expect(anchors(PATH, "seo-heide.html")).toEqual(["SEO nach dem Setup kontinuierlich weiterentwickeln"]);
    expect(anchors(PATH, "seo-schleswig-holstein.html")).toEqual(["Monitoring, Onpage-Optimierung und Monatsbericht im Detail"]);
    expect(texts(`#seo a[href="${PATH}"]`, "preise.html")).toEqual(["Laufende SEO-Betreuung und Tarifrahmen ansehen"]);
    const contextual = ROUTES.filter((r) => r.path !== PATH && anchors(PATH, r.outFile).length).map((r) => r.path);
    expect(contextual.sort()).toEqual(["/preise", "/seo-heide", "/seo-schleswig-holstein"]);
  });

  it("is a real link in the shared service menu instead of the 'Seite folgt' preview", () => {
    for (const route of ROUTES) {
      const doc = loadDoc(route.outFile);
      for (const menu of doc.querySelectorAll(".tf-service-menu")) {
        const links = [...menu.querySelectorAll(`a[href="${PATH}"]`)];
        expect(links, route.path).toHaveLength(1);
        expect(clean(links[0])).toBe("SEO-Betreuung");
        expect(links[0].getAttribute("aria-current"), route.path).toBe(route.path === PATH ? "page" : null);
        const previews = [...menu.querySelectorAll(".tf-service-preview")].map(clean);
        expect(previews.some((text) => text.startsWith("SEO-Betreuung"))).toBe(false);
        expect(previews).toHaveLength(2);
      }
    }
    expect(all(".tf-service-menu", "index.html").length).toBeGreaterThan(0);
  });

  it("changes the homepage and /webdesign-heide by nothing but that menu entry", () => {
    for (const file of ["index.html", "webdesign-heide.html"]) {
      const links = all(`a[href="${PATH}"]`, file);
      expect(links.every((a) => a.closest(".tf-service-menu")), file).toBe(true);
    }
    const home = loadDoc("index.html");
    expect(clean(home.querySelector("h1"))).toBe("Wir bauen");
    expect(home.title).toBe("Webdesign, SEO und KI-Automatisierung | TigerFlow");
    expect(loadDoc("webdesign-heide.html").title).toBe("Webdesign Heide: Website ab 829 € | TigerFlow");
    for (const file of ["Hero.jsx", "PositioningIntro.jsx", "Services.jsx", "WebdesignHeidePage.jsx"]) {
      expect(source(file), file).not.toContain("/seo-betreuung");
    }
  });
});

describe("/seo-betreuung stylesheet invariants", () => {
  const withoutBlocks = (text, opener) => {
    let out = "";
    let rest = text;
    for (;;) {
      const start = rest.indexOf(opener);
      if (start === -1) return out + rest;
      out += rest.slice(0, start);
      let depth = 0;
      let i = rest.indexOf("{", start);
      do {
        if (rest[i] === "{") depth += 1;
        if (rest[i] === "}") depth -= 1;
        i += 1;
      } while (depth > 0);
      rest = rest.slice(i);
    }
  };

  it("is namespaced and loads nothing external", () => {
    const classes = [...css().matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    const foreign = classes.filter((name) => !name.startsWith("sb-") && !/^(is-|\d)/.test(name));
    expect([...new Set(foreign)]).toEqual([]);
    expect(css()).not.toMatch(/url\(|@import|https?:/);
  });

  it("keeps focus, hover, motion and transparency rules", () => {
    const text = css();
    expect(text).toMatch(/\.sb-page a:focus-visible, \.sb-page button:focus-visible, \.sb-page summary:focus-visible/);
    expect(withoutBlocks(text, "@media (hover: hover) and (pointer: fine)")).not.toMatch(/:hover/);
    for (const query of ["prefers-reduced-motion: reduce", "prefers-reduced-transparency: reduce", "prefers-contrast: more", "forced-colors: active"]) {
      expect(text, query).toContain(query);
    }
    expect(withoutBlocks(text, "@supports")).not.toMatch(/backdrop-filter/);
    expect(text).not.toMatch(/transition:\s*all|scale\(0\)/);
    expect(text.match(/\binfinite\b/g)).toHaveLength(1);
    for (const m of text.matchAll(/transition:([^;}]+)/g)) {
      for (const part of m[1].split(",")) {
        expect(part.trim().split(/\s+/)[0]).toMatch(/^(opacity|transform|color|background-color|border-color|none)$/);
      }
    }
    for (const frames of text.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)) {
      for (const decl of frames[1].matchAll(/([a-z-]+):/g)) expect(decl[1]).toMatch(/^(opacity|transform)$/);
    }
  });
});
