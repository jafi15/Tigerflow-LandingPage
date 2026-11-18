import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { ROUTE_PAGES } from "../src/routePages.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const PATH = "/seo-schleswig-holstein";
const OUT_FILE = "seo-schleswig-holstein.html";
const route = ROUTES.find(({ path: routePath }) => routePath === PATH);

function loadDoc(outFile = OUT_FILE) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

// Text of one element with element boundaries rendered as spaces, without JSON-LD.
function clean(node) {
  const copy = node.cloneNode(true);
  copy.querySelectorAll("script").forEach((script) => script.remove());
  copy.querySelectorAll("*").forEach((element) => element.append(" "));
  return copy.textContent.replace(/\s+/g, " ").trim();
}

const pageText = (doc = loadDoc()) => clean(doc.body);

describe("/seo-schleswig-holstein route, registry and rendering", () => {
  it("is an approved prerendered route with the confirmed metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        path: PATH,
        outFile: OUT_FILE,
        title: "SEO Agentur Schleswig-Holstein | TigerFlow",
        description:
          "SEO für Unternehmen in Schleswig-Holstein: klare Keyword-, Seiten- und Regionalstrategie mit priorisiertem Maßnahmenplan. Setup ab 499 € netto.",
        changefreq: "monthly",
        priority: "0.9",
      })
    );
    expect(existsSync(path.join(DIST_DIR, OUT_FILE))).toBe(true);
  });

  it("uses the existing default social card instead of a new OG asset", () => {
    expect(route.ogImage).toBeUndefined();
    const og = loadDoc().querySelector('meta[property="og:image"]')?.getAttribute("content");
    expect(og).toBe(`${SITE_URL}/og/home.png`);
  });

  it("has its own Open Graph copy without new performance or result claims", () => {
    expect(route.ogTitle).toBeTruthy();
    expect(route.ogTitle).not.toBe(route.title);
    expect(route.ogDescription).toBeTruthy();
    expect(route.ogDescription).not.toBe(route.description);
    expect(`${route.ogTitle} ${route.ogDescription}`).not.toMatch(
      /garantier|Platz 1|mehr Kunden|mehr Umsatz|Top-|beste|führend|\d+\s?%/i
    );
  });

  it("is registered as its own code-split browser chunk with a source", () => {
    const entry = ROUTE_PAGES[PATH];
    expect(entry).toBeTruthy();
    expect(entry.source).toBe("src/components/SeoSchleswigHolsteinPage.jsx");
    expect(typeof entry.load).toBe("function");
    expect(existsSync(path.join(process.cwd(), entry.source))).toBe(true);
  });

  it("is registered statically for SSR, without React.lazy or Suspense", () => {
    const server = readFileSync(path.join(process.cwd(), "src/entry-server.jsx"), "utf8");
    expect(server).toMatch(
      /import \{ SeoSchleswigHolsteinPage \} from "\.\/components\/SeoSchleswigHolsteinPage"/
    );
    expect(server).toMatch(/"\/seo-schleswig-holstein": SeoSchleswigHolsteinPage/);
    for (const file of [
      "src/entry-server.jsx",
      "src/routePages.js",
      "src/components/SeoSchleswigHolsteinPage.jsx",
    ]) {
      const source = readFileSync(path.join(process.cwd(), file), "utf8");
      expect(source, file).not.toMatch(/\blazy\s*\(|<Suspense\b|React\.lazy/);
    }
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

  it("has metadata distinct from every other route", () => {
    for (const other of ROUTES.filter((r) => r.path !== PATH)) {
      expect(route.title).not.toBe(other.title);
      expect(route.description).not.toBe(other.description);
      expect(route.ogTitle).not.toBe(other.ogTitle ?? other.title);
    }
  });

  it("appears in the sitemap exactly once with monthly frequency and priority 0.9", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap.split(`<loc>${SITE_URL}${PATH}</loc>`)).toHaveLength(2);
    expect(sitemap).toMatch(
      new RegExp(
        `<loc>${SITE_URL}${PATH}</loc>\\s*<changefreq>monthly</changefreq>\\s*<priority>0\\.9</priority>`
      )
    );
  });

  it("renders exactly one H1 with the confirmed wording inside the ssh- page shell", () => {
    const doc = loadDoc();
    expect(doc.querySelector("#root .ssh-page")).not.toBeNull();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(clean(doc.querySelector("h1"))).toBe(
      "SEO für Schleswig-Holstein: Sichtbarkeit mit klarer Seitenstrategie."
    );
  });

  it("is server-rendered without hidden reveal states", () => {
    const html = readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8");
    expect(html).not.toContain("ssh-reveal-pending");
    expect(pageText().length).toBeGreaterThan(200);
  });
});

describe("/seo-schleswig-holstein hero", () => {
  const hero = () => loadDoc().querySelector(".ssh-hero");

  it("renders eyebrow, confirmed subline, price anchor, scope limit and the primary CTA label", () => {
    const text = clean(hero());
    expect(text).toContain("SEO FÜR SCHLESWIG-HOLSTEIN");
    expect(text).toContain(
      "TigerFlow analysiert Suchmärkte, Seitenstruktur und technische Grundlagen und entwickelt daraus eine priorisierte SEO-Roadmap für Unternehmen mit regionalem oder landesweitem Einzugsgebiet."
    );
    expect(text).toContain("SEO-Setup ab 499 € netto");
    expect(text).toMatch(/zzgl\. USt\.|zuzüglich Umsatzsteuer/);
    expect(text).toContain(
      "Analyse, Keyword-Map und priorisierter Maßnahmenplan. Umsetzung und laufende Betreuung werden separat vereinbart."
    );
    const cta = hero().querySelector(".ssh-hero-actions button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("SEO-Ausgangslage prüfen");
    expect(cta.getAttribute("type")).toBe("button");
  });

  it("links to the first content section", () => {
    const doc = loadDoc();
    const jump = doc.querySelector('.ssh-hero-actions a[href^="#"]');
    expect(jump).not.toBeNull();
    expect(clean(jump).length).toBeGreaterThan(10);
    const target = doc.getElementById(jump.getAttribute("href").slice(1));
    expect(target).not.toBeNull();
    expect(doc.querySelector("main > section[id]")).toBe(target);
  });

  it("exposes no keyword list, city list or result figure in the hero", () => {
    expect(hero().querySelector("ul, ol")).toBeNull();
    const text = clean(hero());
    expect(text).not.toMatch(/SEO[- ]Agentur|SEO[- ]Beratung|Suchmaschinenoptimierung/);
    expect(text).not.toMatch(/\d+\s?%|Platz 1|Top[- ]\d/);
  });
});

describe("/seo-schleswig-holstein confirmed offer and limits", () => {
  const price = () => loadDoc().querySelector("#preis");
  const list = (tone) =>
    [...price().querySelectorAll(`[data-ssh-scope="${tone}"] li`)].map(clean);

  it("states the entry price as 'ab 499 € netto' plus VAT with a fixed price after scoping", () => {
    const text = clean(price());
    expect(clean(price().querySelector("h2"))).toBe("Transparenter Einstieg ab 499 € netto");
    expect(text).toMatch(/499 € netto zuzüglich Umsatzsteuer/);
    expect(text).toMatch(/konkrete Festpreis entsteht nach der Bedarfsklärung/);
    expect(text).not.toMatch(/Streichpreis|statt \d|Rabatt|nur noch|kostenlos|gratis/i);
  });

  it("lists all seven confirmed setup deliverables completely", () => {
    expect(list("in")).toEqual([
      "Analyse der Ausgangslage",
      "Prüfung relevanter Suchbegriffe und Suchintentionen",
      "Betrachtung von Wettbewerb und Suchergebnisseiten",
      "Keyword- und Seitenzuordnung",
      "Schriftliche Keyword-Map",
      "Priorisierter Maßnahmenplan",
      "Verständliche Besprechung der Ergebnisse",
    ]);
  });

  it("separates everything that is not automatically included", () => {
    expect(clean(price())).toMatch(/Nicht automatisch enthalten/);
    expect(list("out")).toEqual([
      "Technische oder redaktionelle Umsetzung aller Empfehlungen",
      "Erstellung unbegrenzt vieler Seiten oder Texte",
      "Laufende SEO-Betreuung",
      "Local SEO oder Pflege von Unternehmensprofilen für jeden Standort",
      "Linkaufbau und sonstige Offpage-Maßnahmen",
      "Bezahlte Anzeigen",
      "Rechtsprüfung",
      "Fremdsoftware, Medien-, Tool- oder Werbekosten",
      "Arbeiten in nicht zugänglichen Fremdsystemen",
      "Ranking-, Traffic-, Lead- oder Umsatzgarantien",
    ]);
  });

  it("lists the optional extensions as separately agreed", () => {
    expect(list("opt")).toEqual([
      "Technische und inhaltliche Umsetzung priorisierter Maßnahmen",
      "Überarbeitung bestehender Leistungs-, Standort- und Themenseiten",
      "Neue SEO-Zielseiten, wenn Suchauftrag und eigenständiger Inhalt dies rechtfertigen",
      "Local SEO für reale Standorte, wenn passend und vereinbart",
      "Monitoring und laufende Onpage-Betreuung",
      "Verbindung mit einem Webdesign- oder Relaunchprojekt",
      "Offpage-Leistungen nur nach separater Prüfung und Vereinbarung",
    ]);
  });

  it("states ongoing care as individual with a six-month minimum term only if agreed", () => {
    const text = clean(price());
    expect(text).toContain("Laufende SEO-Betreuung wird individuell kalkuliert.");
    expect(text).toMatch(/Soweit sie vereinbart wird, gilt eine Mindestlaufzeit von sechs Monaten/);
    expect(text).toMatch(/Offpage-Leistungen und Fremdkosten werden separat/);
    expect(text).not.toMatch(/Betreuung[^.]*\d+\s?€/);
  });

  it("labels the price CTA as a non-binding project inquiry", () => {
    const cta = price().querySelector("button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("SEO-Projekt unverbindlich anfragen");
    expect(cta.getAttribute("type")).toBe("button");
  });
});

describe("/seo-schleswig-holstein forbidden claims and invented proof", () => {
  it("makes no ranking, click, lead, revenue, demand or duration promise", () => {
    const text = pageText();
    for (const sentence of text.split(/(?<=[.?!])\s+/)) {
      if (/garantier|Platz 1|zugesag|zusag/i.test(sentence)) {
        const isQuestion = sentence.trim().endsWith("?");
        const isNegated = /\b(kein|keine|keinen|keiner|nicht|weder|nie|niemand|ohne)\b/i.test(
          sentence
        );
        expect(isQuestion || isNegated, sentence).toBe(true);
      }
    }
    expect(text).not.toMatch(
      /schnelle Ergebnisse|schnell zu Ergebnissen|sofort mehr|garantiert mehr|mehr Kunden|mehr Umsatz|Ergebnis sofort/i
    );
    expect(text).not.toMatch(/Suchvolumen|hohe Nachfrage|stark nachgefragt|Suchanfragen pro Monat/i);
    expect(text).not.toMatch(/\d+\s*(Tage|Tagen|Wochen|Monate|Monaten|Werktage)\b/);
    expect(text).not.toMatch(/Termin buchen|kostenlose SEO-Analyse|garantierte Rückmeldung/i);
  });

  it("invents no locations, customers, references, case studies or sector expertise", () => {
    const text = pageText();
    expect(text).not.toMatch(
      /Kiel|Lübeck|Flensburg|Neumünster|Norderstedt|Elmshorn|Pinneberg|Itzehoe|Husum|Rendsburg|Schleswig\b(?!-Holstein)/
    );
    expect(text).not.toMatch(/Fallstudie|Kundenstimme|Bewertungen|Referenzkunden|Referenzprojekt|Testimonial|★/i);
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/\d+\s*(Kunden|Projekte|Rankings|Besucher|Anfragen|Standorte|Jahre Erfahrung)\b/);
    expect(text).not.toMatch(
      /\b(beste|beste[nrms]|führend\w*|größte[nrms]?|Marktführer|Nummer 1|Experten?)\b[^.]*(Agentur|SEO)/i
    );
    expect(text).not.toMatch(/Branchenkenntnis|Branchenexpert|spezialisiert auf/i);
  });
});

describe("/seo-schleswig-holstein system visual", () => {
  const visual = () => loadDoc().querySelector(".ssh-system-visual");

  it("ships 'Regionale Sichtbarkeit als System' as decorative, non-interactive markup", () => {
    expect(visual()).not.toBeNull();
    expect(visual().getAttribute("aria-hidden")).toBe("true");
    expect(visual().querySelector("a, button, input, [tabindex]")).toBeNull();
    expect(clean(visual())).toMatch(/Regionale Sichtbarkeit als System/i);
  });

  it("shows exactly the three layers Standorte, Regionen and Leistungen & Themen", () => {
    const layers = [...visual().querySelectorAll("[data-ssh-layer]")];
    expect(layers.map((layer) => layer.getAttribute("data-ssh-layer"))).toEqual([
      "standorte",
      "regionen",
      "themen",
    ]);
    expect(layers.map((layer) => clean(layer.querySelector(".ssh-layer-name")))).toEqual([
      "Standorte",
      "Regionen",
      "Leistungen & Themen",
    ]);
  });

  it("is a schematic without a map, place names, customer points, shares or rankings", () => {
    const text = clean(visual());
    expect(text).toMatch(/Schematische Darstellung/);
    expect(text).not.toMatch(/\d+\s?%|Platz \d|Ranking|Marktanteil|Kunde/i);
    expect(visual().querySelector("img, [class*='map'], path[d*='M']")).toBeNull();
    // Nodes are abstract: none of them carries a label of its own.
    for (const node of visual().querySelectorAll(".ssh-node")) {
      expect(node.textContent.trim()).toBe("");
    }
  });

  it("repeats the statement of the visual as normal HTML text in the architecture section", () => {
    const section = loadDoc().querySelector("#architektur");
    expect(section.closest("[aria-hidden]")).toBeNull();
    expect(clean(section)).toMatch(/Regionale Sichtbarkeit als System/i);
  });
});

describe("/seo-schleswig-holstein briefed sections", () => {
  const section = (id) => {
    const node = loadDoc().querySelector(`main > section#${id}`);
    expect(node, `#${id}`).not.toBeNull();
    return node;
  };
  const items = (id, selector) => [...section(id).querySelectorAll(selector)].map(clean);
  const h3s = (id) => items(id, "h3");

  it("renders the briefed content H2s in the briefed order", () => {
    const expected = [
      "Wenn ein Suchmarkt größer ist als ein einzelner Ort",
      "Was das SEO-Setup liefert",
      "Eine Architektur für Standorte, Leistungen und Themen",
      "Local SEO, regionale SEO und Fachthemen sauber trennen",
      "Für welche Situationen die landesweite Strategie sinnvoll sein kann",
      "Zusammenarbeit in Schleswig-Holstein – digital und nachvollziehbar",
      "Transparenter Einstieg ab 499 € netto",
      "Wenn SEO und Website zusammen gedacht werden müssen",
      "Erfolg wird nicht nur an Rankings gemessen",
    ];
    const h2s = [...loadDoc().querySelectorAll("main h2")].map(clean);
    expect(h2s.filter((heading) => expected.includes(heading))).toEqual(expected);
  });

  it("explains four starting situations of a larger search market without case-study optics", () => {
    const list = items("suchmarkt", "ol > li");
    expect(list).toHaveLength(4);
    [
      "Mehrere Leistungen auf einer allgemeinen Seite",
      "Mehrere Regionen ohne Seitenstruktur",
      "Nahezu identische Ortsseiten",
      "Interne Konkurrenz zwischen Seiten",
    ].forEach((title, index) => expect(list[index]).toContain(title));
    const text = clean(section("suchmarkt"));
    expect(text).toMatch(/unterschiedliche Suchintentionen/);
    expect(text).toMatch(/eindeutige Seitenrollen/);
    expect(text).toMatch(/konkurrieren intern um dieselben Begriffe/);
    expect(text).toContain("Nicht jeder Ort benötigt eine eigene Zielseite.");
  });

  it("separates the three setup phases from the written result", () => {
    expect(h3s("setup")).toEqual([
      "Ausgangslage und Suchmarkt prüfen",
      "Keywords und Seiten zuordnen",
      "Maßnahmen priorisieren",
    ]);
    const text = clean(section("setup"));
    for (const part of [
      "Website, vorhandene Seiten und verfügbare Daten betrachten",
      "Keyword-Map erstellen",
      "Primär- und Sekundärrollen für bestehende oder mögliche Seiten definieren",
      "Überschneidungen und Kannibalisierungsrisiken kennzeichnen",
      "Technische, strukturelle und inhaltliche Schritte ordnen",
      "Abhängigkeiten und sinnvolle Reihenfolge dokumentieren",
    ]) {
      expect(text, part).toContain(part);
    }
    expect(items("setup", ".ssh-result li")).toEqual([
      "Schriftliche Keyword-Map",
      "Priorisierter Maßnahmenplan",
      "Entscheidungsgrundlage für eine separate Umsetzung",
    ]);
  });

  it("keeps locations, regions and services apart in three architecture tiers", () => {
    const tiers = [...section("architektur").querySelectorAll("ol > li[data-ssh-tier]")];
    expect(tiers.map((tier) => tier.getAttribute("data-ssh-tier"))).toEqual([
      "standorte",
      "regionen",
      "themen",
    ]);
    expect(tiers.map((tier) => clean(tier.querySelector(".ssh-tier-name")))).toEqual([
      "Standorte",
      "Regionen",
      "Leistungen & Themen",
    ]);
    expect(tiers.map((tier) => clean(tier.querySelector("h3")))).toEqual([
      "Reale Standorte",
      "Einzugsgebiete und Regionen",
      "Leistungen und Fachthemen",
    ]);
    for (const tier of tiers) expect(tier.querySelectorAll("ul > li")).toHaveLength(3);
    const text = clean(section("architektur"));
    for (const part of [
      "Nur echte Niederlassungen und tatsächlich bediente Standorte verwenden",
      "Keine virtuellen Standorte suggerieren",
      "Regionale Zielseiten nur bei eigenständiger Suchintention, Leistung und Substanz",
      "Liefergebiet nicht mit dem Unternehmensstandort verwechseln",
      "Starke Leistungsseiten als fachliche Basis",
      "nur ergänzen, wenn sie einen eigenen Informationsauftrag erfüllen",
    ]) {
      expect(text, part).toContain(part);
    }
    expect(text).toMatch(/statt dieselbe Ortsseite für jede Region/);
    expect(text).toMatch(/keine Standorte, Marktanteile oder Rankings/);
  });

  it("distinguishes Local SEO, regional SEO and nationwide topics", () => {
    expect(h3s("abgrenzung")).toEqual([
      "Local SEO",
      "Regionale oder landesweite SEO",
      "Deutschlandweite Fachthemen",
    ]);
    const text = clean(section("abgrenzung"));
    expect(text).toMatch(/reale Standorte und lokale Suchintentionen/);
    expect(text).toMatch(/Unternehmensprofils? ist ein optionaler Baustein/);
    expect(text).toMatch(/Seitenarchitektur, Leistungszuordnung und regionaler Relevanz/);
    expect(text).toMatch(/statt künstlicher Ortsvarianten/);
    expect(text).toContain("Nicht jede Leistung muss regionalisiert werden.");
  });

  it("names five typical statewide situations, labelled as no customer examples", () => {
    const list = items("situationen", "ol > li");
    expect(list).toHaveLength(5);
    [
      "Ein Standort, größeres Servicegebiet",
      "Mehrere reale Standorte",
      "Regionale und fachliche Suchmärkte",
      "Viele ähnliche Seiten",
      "Schrittweises Wachstum in weitere Regionen",
    ].forEach((title, index) => expect(list[index]).toContain(title));
    expect(clean(section("situationen"))).toContain(
      "Typische Situationen, keine Kundenbeispiele und keine Projektergebnisse."
    );
  });

  it("describes digital collaboration from Heide in five steps without promising presence", () => {
    const steps = items("zusammenarbeit", "ol > li").map((step) => step.toLowerCase());
    expect(steps).toHaveLength(5);
    [
      "ziele und gebiete klären",
      "website und suchmarkt prüfen",
      "keyword-map und prioritäten entwickeln",
      "ergebnisse digital besprechen",
      "umsetzung separat auswählen",
    ].forEach((expected, index) => expect(steps[index]).toContain(expected));
    const text = clean(section("zusammenarbeit"));
    expect(text).toContain(
      "TigerFlow arbeitet aus Heide digital mit Unternehmen in Schleswig-Holstein zusammen."
    );
    expect(text).toMatch(/Weitere Niederlassungen gibt es nicht/);
    expect(text).toMatch(/Termine und Kanäle werden projektbezogen vereinbart/);
    expect(text).toMatch(/pauschale Projektdauer oder feste Reaktionszeit nennen wir bewusst nicht/);
    expect(pageText()).not.toMatch(/vor Ort für Sie|überall vor Ort|persönlich in ganz|rund um die Uhr/i);
  });

  it("frames the website as a possible basis without selling a relaunch", () => {
    const text = clean(section("website"));
    expect(text).toMatch(/tragfähige bestehende Website kann optimiert werden/);
    expect(text).toMatch(/Technische oder strukturelle Grenzen können einen größeren Umbau sinnvoll machen/);
    expect(text).toMatch(/nicht aus einer pauschalen Neubauempfehlung/);
  });

  it("measures success in the briefed order with rankings as intermediate signals", () => {
    const list = items("erfolgsmessung", "ol > li").map((item) => item.toLowerCase());
    expect(list).toHaveLength(5);
    [
      "technische zugänglichkeit und indexierung",
      "sichtbarkeit für relevante suchanfragen",
      "qualifizierte organische klicks",
      "gewünschte handlungen und projektanfragen",
      "angebote, gewonnene kunden und umsatz",
    ].forEach((expected, index) => expect(list[index]).toContain(expected));
    const text = clean(section("erfolgsmessung"));
    expect(text).toMatch(/Rankings und Traffic sind Zwischensignale/);
    expect(text).toMatch(/soweit[^.]*belastbar zuord/i);
    expect(text).toMatch(/kein garantiertes Geschäftsergebnis/);
  });
});

describe("/seo-schleswig-holstein independence from /seo-heide", () => {
  const sentences = (doc) =>
    clean(doc.querySelector("main"))
      .split(/(?<=[.?!])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 45);

  it("shares no section heading and no visual with the local page", () => {
    const local = loadDoc("seo-heide.html");
    const own = loadDoc();
    const headings = (doc) => [...doc.querySelectorAll("main h1, main h2")].map(clean);
    for (const heading of headings(own)) expect(headings(local)).not.toContain(heading);
    expect(own.querySelector(".sh-map, .sh-hub, [class^='sh-']")).toBeNull();
    expect(local.querySelector(".ssh-system-visual")).toBeNull();
  });

  it("repeats only the confirmed offer sentences from the local page", () => {
    const confirmed = [
      "Analyse, Keyword-Map und priorisierter Maßnahmenplan.",
      "Umsetzung und laufende Betreuung werden separat vereinbart.",
    ];
    const local = new Set(sentences(loadDoc("seo-heide.html")));
    const shared = sentences(loadDoc()).filter((sentence) => local.has(sentence));
    for (const sentence of shared) expect(confirmed).toContain(sentence);
  });

  it("does not centre on the local business profile and uses no city list", () => {
    const text = pageText();
    expect((text.match(/Unternehmensprofil/g) ?? []).length).toBeLessThanOrEqual(5);
    expect(text).not.toMatch(/Google-Unternehmensprofil/);
    // No enumeration of place names: Heide is the only locality on the page.
    expect(text).not.toMatch(/\bin (Heide|[A-ZÄÖÜ][a-zäöüß]+), [A-ZÄÖÜ][a-zäöüß]+(,| und) [A-ZÄÖÜ]/);
  });

  it("distributes the statewide keyword cluster naturally without stuffing", () => {
    const text = pageText();
    for (const pattern of [
      /SEO[- ]Agentur in Schleswig-Holstein/,
      /SEO-Beratung für Unternehmen in Schleswig-Holstein/,
      /Suchmaschinenoptimierung/,
      /regionale SEO-Strategie/i,
      /SEO für mehrere Standorte/,
      /Keyword-Map/,
      /Seitenarchitektur/,
      /Technische SEO/i,
      /Onpage/,
    ]) {
      expect(text).toMatch(pattern);
    }
    const mentions = (text.match(/Schleswig-Holstein/g) ?? []).length;
    expect(mentions).toBeGreaterThanOrEqual(6);
    expect(mentions).toBeLessThanOrEqual(20);
    expect((text.match(/SEO[- ]Agentur/g) ?? []).length).toBeLessThanOrEqual(3);
  });
});

describe("/seo-schleswig-holstein FAQ", () => {
  const QUESTIONS = [
    "Was kostet SEO bei TigerFlow?",
    "Was ist im SEO-Setup enthalten?",
    "Ist die Umsetzung im Einstiegspreis enthalten?",
    "Braucht jede Stadt oder Region eine eigene SEO-Seite?",
    "Wie unterscheidet sich landesweite SEO von Local SEO?",
    "Kann TigerFlow mehrere Unternehmensstandorte berücksichtigen?",
    "Muss die Website neu gebaut werden?",
    "Wie läuft die Zusammenarbeit außerhalb von Heide ab?",
    "Wie lange dauert SEO?",
    "Garantiert TigerFlow bestimmte Rankings oder Anfragen?",
  ];
  const entries = () => [...loadDoc().querySelectorAll("#faq details")];
  const answer = (details) => clean(details.querySelector(".ssh-faq-answer"));

  it("heads the section with the briefed H2", () => {
    expect(clean(loadDoc().querySelector("#faq h2"))).toBe(
      "Häufige Fragen zu SEO in Schleswig-Holstein"
    );
  });

  it("uses native details/summary for the ten approved questions in order, closed by default", () => {
    const all = entries();
    expect(all).toHaveLength(QUESTIONS.length);
    all.forEach((details, index) => {
      expect(details.hasAttribute("open")).toBe(false);
      expect(clean(details.querySelector("summary"))).toBe(QUESTIONS[index]);
      expect(answer(details).length).toBeGreaterThan(60);
    });
  });

  it("answers within the confirmed limits", () => {
    const all = entries().map(answer);
    expect(all[0]).toMatch(/499 € netto zuzüglich Umsatzsteuer/);
    expect(all[0]).toMatch(/Festpreis[^.]*Bedarfsklärung/);
    expect(all[0]).toMatch(/laufende Betreuung wird individuell kalkuliert/i);
    for (const part of [
      "Analyse der Ausgangslage",
      "Suchbegriffe und Suchintentionen",
      "Wettbewerb und Suchergebnisseiten",
      "Keyword- und Seitenzuordnung",
      "schriftliche Keyword-Map",
      "priorisierter Maßnahmenplan",
      "Besprechung der Ergebnisse",
    ]) {
      expect(all[1], part).toContain(part);
    }
    expect(all[2]).toMatch(/^Nein\./);
    expect(all[2]).toMatch(/nach Umfang und Priorität separat vereinbart/);
    expect(all[3]).toMatch(/^Nein\./);
    expect(all[3]).toMatch(/eigenständige Suchintention, einen tatsächlichen Leistungsbezug und substanziell eigenen Inhalt/);
    expect(all[4]).toMatch(/reale Standorte und lokale Signale/);
    expect(all[4]).toMatch(/mehrere Märkte, Regionen, Leistungen und Themen/);
    expect(all[5]).toMatch(/^Ja, wenn die Standorte real sind/);
    expect(all[5]).toMatch(/pauschale Zusage dafür gibt es nicht/);
    expect(all[6]).toMatch(/^Nicht automatisch\./);
    expect(all[7]).toMatch(/digital organisiert/);
    expect(all[7]).toMatch(/Termine und Kanäle vereinbaren wir projektbezogen/);
    expect(all[8]).toMatch(/pauschale Dauer gibt es nicht/);
    expect(all[8]).toMatch(/Ausgangslage, Wettbewerb, Websiteumfang, Umsetzung und der Verarbeitung durch Suchmaschinen/);
    expect(all[9]).toMatch(/^Nein\./);
    expect(all[9]).toMatch(/keine Suchmaschinen- oder Geschäftsergebnisse garantieren/);
  });

  it("selects mostly different questions than the local /seo-heide FAQ", () => {
    const local = [...loadDoc("seo-heide.html").querySelectorAll("#faq summary")].map(clean);
    const shared = QUESTIONS.filter((question) => local.includes(question));
    expect(shared.length).toBeLessThanOrEqual(3);
    const localAnswers = [...loadDoc("seo-heide.html").querySelectorAll(".sh-faq-answer")].map(clean);
    for (const text of entries().map(answer)) expect(localAnswers).not.toContain(text);
  });
});

describe("/seo-schleswig-holstein structured data", () => {
  const nodes = () =>
    [...loadDoc().querySelectorAll('#root script[type="application/ld+json"]')].flatMap((script) => {
      const data = JSON.parse(script.textContent);
      return data["@graph"] ?? [data];
    });
  const byType = (type) => nodes().filter((node) => node["@type"] === type);
  const url = `${SITE_URL}${PATH}`;

  it("ships exactly one WebPage, BreadcrumbList, Service and FAQPage", () => {
    for (const type of ["WebPage", "BreadcrumbList", "Service", "FAQPage"]) {
      expect(byType(type), type).toHaveLength(1);
    }
    const page = byType("WebPage")[0];
    expect(page.url).toBe(url);
    expect(page.name).toBe(route.title);
    expect(page.description).toBe(route.description);
    const crumbs = byType("BreadcrumbList")[0].itemListElement;
    expect(crumbs.map((item) => item.item)).toEqual([`${SITE_URL}/`, url]);
    expect(crumbs.map((item) => item.name)).toEqual(["Startseite", "SEO Schleswig-Holstein"]);
  });

  it("describes the service for Schleswig-Holstein with the provider address in Heide", () => {
    const service = byType("Service")[0];
    expect(service.url).toBe(url);
    expect(service.name).toBe("SEO-Setup");
    expect(service.serviceType).toBe("Suchmaschinenoptimierung");
    expect(service.areaServed).toEqual({ "@type": "AdministrativeArea", name: "Schleswig-Holstein" });
    expect(service.provider.name).toBe("TigerFlow");
    expect(service.provider.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Rendsburger Straße 22",
      postalCode: "25746",
      addressLocality: "Heide",
      addressCountry: "DE",
    });
    expect(service.offers["@type"]).toBe("Offer");
    expect(service.offers.priceSpecification.minPrice).toBe(499);
    expect(service.offers.priceSpecification.priceCurrency).toBe("EUR");
    expect(service.offers.priceSpecification.valueAddedTaxIncluded).toBe(false);
  });

  it("matches the visible FAQ exactly", () => {
    const doc = loadDoc();
    const visible = [...doc.querySelectorAll("#faq details")].map((details) => ({
      q: clean(details.querySelector("summary")),
      a: clean(details.querySelector(".ssh-faq-answer")),
    }));
    const faq = byType("FAQPage")[0];
    expect(visible).toHaveLength(10);
    expect(faq.mainEntity).toHaveLength(visible.length);
    faq.mainEntity.forEach((entry, index) => {
      expect(entry.name).toBe(visible[index].q);
      expect(entry.acceptedAnswer.text).toBe(visible[index].a);
    });
  });

  it("contains no further locations, ratings, reviews or result data and serialises '<' safely", () => {
    const serialized = JSON.stringify(nodes());
    for (const key of ["aggregateRating", "review", "reviewRating", "ratingValue", "location", "branchOf", "subOrganization"]) {
      expect(serialized).not.toContain(`"${key}"`);
    }
    expect((serialized.match(/PostalAddress/g) ?? []).length).toBe(1);
    expect(serialized).not.toMatch(/Kiel|Lübeck|Flensburg|Neumünster/);
    const source = readFileSync(
      path.join(process.cwd(), "src/components/SeoSchleswigHolsteinPage.jsx"),
      "utf8"
    );
    expect(source).toMatch(/JSON\.stringify\(structuredData\)\.replace\(\/<\/g, "\\\\u003c"\)/);
  });
});

describe("/seo-schleswig-holstein closing CTA and page shell", () => {
  it("closes with the briefed heading, a non-binding inquiry text and the project check CTA", () => {
    const final = loadDoc().querySelector("main > section#projektanfrage");
    expect(final).not.toBeNull();
    expect(clean(final.querySelector("h2"))).toBe(
      "Klären wir, welche Suchmärkte und Seiten für Ihr Unternehmen wirklich sinnvoll sind."
    );
    const text = clean(final);
    expect(text).toMatch(/Die Projektanfrage ist unverbindlich/);
    expect(text).toMatch(/Ausgangslage, Regionen und gewünschte Leistungen/);
    expect(text).not.toMatch(/sofort|Termin|innerhalb von/i);
    const cta = final.querySelector("button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("SEO-Ausgangslage prüfen");
  });

  it("renders all eleven section H2s in the briefed order", () => {
    expect([...loadDoc().querySelectorAll("main h2")].map(clean)).toEqual([
      "Wenn ein Suchmarkt größer ist als ein einzelner Ort",
      "Was das SEO-Setup liefert",
      "Eine Architektur für Standorte, Leistungen und Themen",
      "Local SEO, regionale SEO und Fachthemen sauber trennen",
      "Für welche Situationen die landesweite Strategie sinnvoll sein kann",
      "Zusammenarbeit in Schleswig-Holstein – digital und nachvollziehbar",
      "Transparenter Einstieg ab 499 € netto",
      "Wenn SEO und Website zusammen gedacht werden müssen",
      "Erfolg wird nicht nur an Rankings gemessen",
      "Häufige Fragen zu SEO in Schleswig-Holstein",
      "Klären wir, welche Suchmärkte und Seiten für Ihr Unternehmen wirklich sinnvoll sind.",
    ]);
  });

  it("offers a skip link, exactly one banner and floating chrome that starts inert", () => {
    const doc = loadDoc();
    const skip = doc.querySelector("a.ssh-skip");
    expect(skip?.getAttribute("href")).toBe("#inhalt");
    expect(doc.querySelector("main#inhalt")?.getAttribute("tabindex")).toBe("-1");
    expect(doc.querySelectorAll("header")).toHaveLength(1);
    for (const selector of [".ssh-bar", ".ssh-mobile-bar"]) {
      const chrome = doc.querySelector(selector);
      expect(chrome, selector).not.toBeNull();
      expect(chrome.tagName).toBe("DIV");
      expect(chrome.hasAttribute("inert")).toBe(true);
      expect(chrome.getAttribute("aria-hidden")).toBe("true");
      expect(chrome.querySelector("button[data-project-check-cta]")).not.toBeNull();
    }
    expect(clean(doc.querySelector(".ssh-mobile-bar"))).toMatch(/SEO-Setup ab 499\s€/);
  });

  it("keeps the heading hierarchy without skipped levels", () => {
    const levels = [...loadDoc().querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

describe("/seo-schleswig-holstein internal linking", () => {
  const anchor = (href) => {
    const links = [...loadDoc().querySelectorAll(`main a[href="${href}"]`)];
    expect(links, href).toHaveLength(1);
    return links[0];
  };

  it("links crawlably to /seo-heide, /webdesign-schleswig-holstein, /preise and the homepage", () => {
    expect(clean(anchor("/seo-heide"))).toBe("Lokale SEO-Leistung für Unternehmen in Heide ansehen");
    expect(anchor("/seo-heide").closest("#abgrenzung")).not.toBeNull();
    expect(clean(anchor("/webdesign-schleswig-holstein"))).toBe(
      "Webdesign für Unternehmen in Schleswig-Holstein"
    );
    expect(anchor("/webdesign-schleswig-holstein").closest("#website")).not.toBeNull();
    expect(clean(anchor("/preise"))).toBe("Preise und Leistungsrahmen ansehen");
    expect(anchor("/preise").closest("#website")).not.toBeNull();
    expect(clean(anchor("/"))).toBe("TigerFlow im Überblick: Webdesign, SEO und Automatisierung");
    const hrefs = [...loadDoc().querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    for (const href of ["/impressum", "/datenschutz"]) expect(hrefs).toContain(href);
  });

  it("uses anchors that differ from the ones other pages use for the same targets", () => {
    const own = [...loadDoc().querySelectorAll("main a[href^='/']")].map(clean);
    const local = [...loadDoc("seo-heide.html").querySelectorAll("main a[href^='/']")].map(clean);
    for (const text of own) expect(local).not.toContain(text);
    expect(new Set(own).size).toBe(own.length);
  });

  it("links only to published routes or existing anchors and loads no external hosts or new assets", () => {
    const doc = loadDoc();
    const published = new Set(ROUTES.map((r) => r.path));
    for (const a of doc.getElementById("root").querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      expect(href).not.toMatch(/^https?:\/\//);
      if (href.startsWith("#")) {
        expect(doc.getElementById(href.slice(1)), href).not.toBeNull();
      } else if (href.startsWith("/")) {
        expect(published.has(href.split("#")[0]), href).toBe(true);
      } else {
        expect(href).toMatch(/^mailto:service@tigerflow\.de$/);
      }
    }
    for (const img of doc.getElementById("root").querySelectorAll("img")) {
      expect(img.getAttribute("src")).toBe("/tigerflow-mark.png");
    }
  });

  it("receives inbound links only from /seo-heide, /webdesign-schleswig-holstein, /preise, /seo-betreuung and /ueber-uns", () => {
    const linking = ROUTES.filter(
      (r) => r.path !== PATH && loadDoc(r.outFile).querySelector(`main a[href="${PATH}"]`)
    ).map((r) => r.path);
    expect(linking.sort()).toEqual(["/preise", "/seo-betreuung", "/seo-heide", "/ueber-uns", "/webdesign-schleswig-holstein"]);
  });

  it("leaves the homepage, /webdesign-heide and the shared service menu untouched", () => {
    const home = loadDoc("index.html");
    expect(clean(home.querySelector("h1"))).toBe("Wir bauen");
    expect(home.title).toBe("Webdesign, SEO und KI-Automatisierung | TigerFlow");
    for (const file of ["index.html", "webdesign-heide.html"]) {
      const links = [...loadDoc(file).querySelectorAll(`a[href="${PATH}"]`)];
      expect(links.every((a) => a.closest(".tf-service-menu")), file).toBe(true);
    }
    for (const file of ["Hero.jsx", "PositioningIntro.jsx", "WebdesignHeidePage.jsx"]) {
      const source = readFileSync(path.join(process.cwd(), "src/components", file), "utf8");
      expect(source, file).not.toContain("seo-schleswig-holstein");
    }
    // The shared menu lists the local SEO page and this page.
    const menu = loadDoc().querySelector(".tf-service-menu");
    expect(menu.querySelector('a[href="/seo-heide"]')).not.toBeNull();
    expect(menu.querySelector(`a[href="${PATH}"]`).getAttribute("aria-current")).toBe("page");
  });
});

describe("/seo-schleswig-holstein reveal mechanics", () => {
  const source = readFileSync(
    path.join(process.cwd(), "src/components/SeoSchleswigHolsteinPage.jsx"),
    "utf8"
  );

  it("hides below-the-fold items only from JS, never with reduced motion or without IntersectionObserver", () => {
    expect(source).toMatch(/prefers-reduced-motion: reduce/);
    expect(source).toMatch(/"IntersectionObserver" in window/);
    expect(source).toMatch(/classList\.add\("ssh-reveal-pending"\)/);
    expect(source).toMatch(/classList\.remove\("ssh-reveal-pending"\)/);
    expect(source).not.toMatch(/className="[^"]*ssh-reveal-pending/);
    expect(loadDoc().querySelectorAll("[data-ssh-reveal]").length).toBeGreaterThan(10);
  });

  it("uses no animation library, timers for content or scroll listeners", () => {
    expect(source).not.toMatch(/framer-motion|from "motion|gsap/);
    expect(source).not.toMatch(/addEventListener\("scroll"/);
  });
});

describe("/seo-schleswig-holstein stylesheet invariants", () => {
  const css = readFileSync(
    path.join(process.cwd(), "src/components/SeoSchleswigHolsteinPage.css"),
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
  const rule = (selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![-\\w])${escaped}\\s*\\{[^}]*`);
  };

  it("styles the page in its own isolated ssh- namespace", () => {
    expect(css).toMatch(/\.ssh-page\b/);
    expect(css).not.toMatch(/(?<![-\w])\.(sh|wdh|wdd|wsh|pr|wb|tf)-/);
    expect(css).not.toMatch(/\[data-(sh|wsh|pr|wb)-/);
  });

  it("loads no external hosts, fonts or image assets", () => {
    expect(css).not.toMatch(/url\(|@import|https?:/);
  });

  it("shows a visible focus indicator for links, buttons and summaries", () => {
    expect(css).toMatch(/\.ssh-page a:focus-visible/);
    expect(css).toMatch(/\.ssh-page button:focus-visible/);
    expect(css).toMatch(/\.ssh-page summary:focus-visible/);
    expect(css).toMatch(/:focus-visible[^}]*outline:\s*2px solid #FF7A00/);
    // Only the programmatic skip-link target may drop its outline.
    expect(css.replace(".ssh-page main:focus { outline: none; }", "")).not.toMatch(
      /outline:\s*(none|0)\b/
    );
    expect(css).toMatch(/\.ssh-skip:focus\s*\{[^}]*transform:\s*none/);
  });

  it("gates every hover rule behind (hover: hover) and (pointer: fine)", () => {
    expect(css).toMatch(hoverMedia);
    expect(stripBlocks(css, hoverMedia)).not.toMatch(/:hover/);
  });

  it("honours prefers-reduced-motion with a complete static state", () => {
    const reduced = blocks(css, /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/);
    expect(reduced.length).toBeGreaterThan(0);
    const body = reduced.join("\n");
    expect(body).toMatch(/animation:\s*none\s*!important/);
    expect(body).toMatch(/transition:\s*none\s*!important/);
    expect(body).toMatch(/\.ssh-reveal-pending/);
    expect(body).toMatch(/opacity:\s*1\s*!important/);
    expect(body).toMatch(/transform:\s*none\s*!important/);
  });

  it("handles reduced transparency, higher contrast, forced colors and a missing backdrop-filter", () => {
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-transparency\s*:\s*reduce\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*prefers-contrast\s*:\s*more\s*\)/);
    const forced = blocks(css, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/).join("\n");
    expect(forced).toMatch(/border/);
    expect(forced).toMatch(/CanvasText/);
    expect(forced).toMatch(/ButtonText/);
    expect(forced).toMatch(/Highlight/);
    expect(forced).toMatch(/\.ssh-links line/);
    expect(forced).toMatch(/\.ssh-reveal-pending/);
  });

  it("uses backdrop-filter only inside @supports on top of a solid readable background", () => {
    const outsideSupports = stripBlocks(css, /@supports[^{]*\{/).replace(
      /@supports[^{]*\{\s*\}/g,
      ""
    );
    expect(outsideSupports).not.toMatch(/backdrop-filter/);
    expect(css).toMatch(/@supports\s*\(\(?\s*(-webkit-)?backdrop-filter/);
    expect(css).toMatch(/\.ssh-glass\s*\{[^}]*background:\s*#[0-9A-Fa-f]{6}\b/);
    const supports = blocks(css, /@supports[^{]*backdrop-filter[^{]*\{/).join("\n");
    expect(supports).toMatch(/prefers-reduced-transparency:\s*reduce/);
  });

  it("never uses transition: all, scale(0) or bare ease-in", () => {
    expect(css).not.toMatch(/transition(-property)?\s*:\s*all\b/);
    expect(css).not.toMatch(/scale[XYZ3d]*\(\s*0\s*[,)]/);
    expect(css).not.toMatch(/\bease-in\b(?!-out)/);
  });

  it("moves things with transform and opacity only", () => {
    const frames = blocks(css, /@keyframes\s+[\w-]+\s*\{/);
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) {
      const properties = [...frame.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
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
    expect(css).toMatch(/--ssh-ease-out:\s*cubic-bezier\(\.23,\s*1,\s*\.32,\s*1\)/);
    for (const [, value] of css.matchAll(/transition\s*:\s*([^;}]+)/g)) {
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
        expect(ms, value).toBeLessThanOrEqual(300);
      }
    }
    for (const [, value] of css.matchAll(/(?<![-\w])animation\s*:\s*([^;}]+)/g)) {
      // The single slow ambient signal may loop; everything else is a one-shot entrance.
      if (/\binfinite\b/.test(value)) continue;
      const [duration] = [...value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)];
      if (!duration) continue; // "animation: none" in the reduced-motion block
      const ms = duration[2] === "s" ? Number(duration[1]) * 1000 : Number(duration[1]);
      expect(ms, value).toBeLessThanOrEqual(700);
    }
    for (const [, amount, unit] of css.matchAll(/animation-delay\s*:\s*[^;}]*?(\d*\.?\d+)(ms|s)\b/g)) {
      const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
      expect(ms).toBeLessThanOrEqual(1600);
    }
  });

  it("limits looping motion to a single quiet ambient signal", () => {
    const loops = [...css.matchAll(/(?<![-\w])animation\s*:\s*([^;}]+)/g)].filter(([, value]) =>
      /\binfinite\b/.test(value)
    );
    expect(loops).toHaveLength(1);
    const [, seconds] = loops[0][1].match(/(\d*\.?\d+)s\b/);
    expect(Number(seconds)).toBeGreaterThanOrEqual(3);
    expect(css).not.toMatch(/animation-iteration-count:\s*infinite/);
  });

  it("gives pressable elements instant press feedback", () => {
    expect(css).toMatch(/\.ssh-btn:active\s*\{[^}]*scale\(\.9[5-8]\)/);
  });

  it("keeps text readable: every hex text colour reaches 4.5:1 on the darkest panel", () => {
    const colours = [...css.matchAll(/(?<![-\w])color\s*:\s*(#[0-9A-Fa-f]{3,6})\b/g)].map((m) =>
      m[1].toUpperCase()
    );
    expect(colours.length).toBeGreaterThan(5);
    for (const colour of new Set(colours)) {
      if (colour === "#111" || colour === "#111111") continue;
      expect(contrast(colour, "#0A0A0A"), colour).toBeGreaterThanOrEqual(4.5);
      // Panels on this page are never lighter than #15130F.
      expect(contrast(colour, "#15130F"), colour).toBeGreaterThanOrEqual(4.5);
    }
    expect(css).toMatch(/\.ssh-btn\s*\{[^}]*background:\s*#FF7A00;[^}]*color:\s*#111111/);
    expect(contrast("#111111", "#FF7A00")).toBeGreaterThanOrEqual(4.5);
  });

  it("offers touch targets of at least 44 px for every interactive element", () => {
    for (const selector of [
      ".ssh-btn",
      ".ssh-btn-sm",
      ".ssh-nav-cta",
      ".ssh-brand",
      ".ssh-nav-links > a",
      ".ssh-bar-links a",
      ".ssh-text-link",
      ".ssh-link-row",
      ".ssh-home-link",
      ".ssh-faq-list summary",
      ".ssh-final-card small a",
    ]) {
      const match = css.match(rule(selector));
      expect(match, selector).not.toBeNull();
      const [, height] = match[0].match(/min-height:\s*(\d+)px/) ?? [];
      expect(Number(height), selector).toBeGreaterThanOrEqual(44);
    }
  });

  it("is built for 320 px without hiding page-level overflow", () => {
    expect(css).not.toMatch(/overflow-x/);
    expect(css).not.toMatch(/(?<![-\w])(html|body)\s*\{/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*760px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*420px\s*\)/);
    expect(css).not.toMatch(/(?<![-\w])min-width\s*:\s*(3[2-9]\d|[4-9]\d\d|\d{4,})px/);
    expect(css).not.toMatch(/(?<![-\w])width\s*:\s*\d{4,}px/);
    expect(css).not.toMatch(/white-space:\s*nowrap[^}]*font-size:\s*(1[8-9]|[2-9]\d)px/);
  });

  it("collapses every multi-column layout to one column at 760 px", () => {
    const mobile = blocks(css, /@media\s*\(\s*max-width\s*:\s*760px\s*\)\s*\{/).join("\n");
    for (const selector of [
      ".ssh-ledger",
      ".ssh-phases",
      ".ssh-compare",
      ".ssh-steps",
      ".ssh-scopes",
      ".ssh-paths",
      ".ssh-link-rows",
      ".ssh-price-head",
    ]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(mobile, selector).toMatch(
        new RegExp(`${escaped}[^{]*\\{[^}]*grid-template-columns:\\s*minmax\\(0,\\s*1fr\\)`)
      );
    }
  });
});
