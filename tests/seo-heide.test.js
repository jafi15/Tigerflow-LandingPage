import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const route = ROUTES.find(({ path: routePath }) => routePath === "/seo-heide");

function loadDoc(outFile) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

// Visible text only: drops JSON-LD and separates adjacent elements with a space.
function pageText(doc) {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll("script").forEach((script) => script.remove());
  body.querySelectorAll("*").forEach((element) => element.append(" "));
  return body.textContent.replace(/\s+/g, " ").trim();
}

describe("/seo-heide route and metadata", () => {
  it("is an approved prerendered route with the confirmed commercial metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        path: "/seo-heide",
        outFile: "seo-heide.html",
        title: "SEO Heide: Analyse & klarer Maßnahmenplan | TigerFlow",
        description:
          "SEO aus Heide: TigerFlow analysiert Website, Keywords und Wettbewerb und erstellt eine priorisierte SEO-Roadmap. SEO-Setup ab 499 € netto.",
      })
    );
    expect(existsSync(path.join(DIST_DIR, route.outFile))).toBe(true);
  });

  it("ships title, description, self-canonical and index,follow in the initial HTML", () => {
    const doc = loadDoc(route.outFile);
    expect(doc.title).toBe(route.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      route.description
    );
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE_URL}/seo-heide`
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "index, follow"
    );
  });

  it("has metadata distinct from both Webdesign money pages", () => {
    for (const other of ["/webdesign-heide", "/webdesign-dithmarschen"]) {
      const otherRoute = ROUTES.find(({ path: routePath }) => routePath === other);
      expect(route.title).not.toBe(otherRoute.title);
      expect(route.description).not.toBe(otherRoute.description);
    }
  });

  it("appears in the sitemap as an absolute https URL", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap).toContain(`<loc>${SITE_URL}/seo-heide</loc>`);
  });

  it("renders exactly one H1 with the confirmed wording in the initial HTML", () => {
    const doc = loadDoc(route.outFile);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("h1").textContent.replace(/\s+/g, " ").trim()).toBe(
      "SEO in Heide für Unternehmen, die gezielt gefunden werden wollen."
    );
  });
});

describe("/seo-heide confirmed offer", () => {
  const getText = () => pageText(loadDoc("seo-heide.html"));

  it("states the entry price as 'ab 499 € netto' plus VAT and an individual fixed price", () => {
    const text = getText();
    expect(text).toContain("SEO-Setup ab 499 € netto");
    expect(text).toMatch(/zzgl\. USt\.|zuzüglich Umsatzsteuer/);
    expect(text).toMatch(/individuelle[rn]? Festpreis/);
    expect(text).toMatch(/Bedarfsklärung/);
  });

  it("lists every confirmed deliverable of the SEO-Setup", () => {
    const text = getText();
    for (const item of [
      "Analyse der Ausgangslage",
      "Suchbegriffe und Suchintention",
      "Wettbewerb und Suchergebnisseiten",
      "Keyword-Map",
      "Seitenzuordnung",
      "priorisierter Maßnahmenplan",
      "Ergebnisbesprechung",
    ]) {
      expect(text).toContain(item);
    }
  });

  it("separates implementation, ongoing care, local SEO, content, offpage and third-party costs", () => {
    const text = getText();
    for (const item of [
      "Umsetzung",
      "laufende Betreuung",
      "Local SEO",
      "Google-Unternehmensprofil",
      "neue Inhalte",
      "Offpage",
      "Drittanbieter- und Toolkosten",
    ]) {
      expect(text).toContain(item);
    }
    expect(text).toMatch(/nicht automatisch enthalten/i);
  });
});

describe("/seo-heide brief sections in the initial HTML", () => {
  const getDoc = () => loadDoc("seo-heide.html");
  const headings = (doc) =>
    [...doc.querySelectorAll("h2")].map((h) => h.textContent.replace(/\s+/g, " ").trim());

  it("renders hero eyebrow, lead, price note and the primary CTA label", () => {
    const text = pageText(getDoc());
    expect(text).toContain("SEO AUS HEIDE");
    expect(text).toContain(
      "TigerFlow analysiert Suchpotenziale, Seitenstruktur und technische Grundlagen und entwickelt daraus eine nachvollziehbare SEO-Roadmap für Ihre Website."
    );
    expect(text).toContain(
      "Analyse, Keyword-Map und priorisierter Maßnahmenplan. Umsetzung und laufende Betreuung werden separat vereinbart."
    );
    expect(text).toContain("SEO-Ausgangslage klären");
  });

  it("renders every briefed section heading", () => {
    const h2s = headings(getDoc());
    for (const heading of [
      "Sichtbarkeit scheitert selten an nur einem einzelnen Problem.",
      "Am Ende steht kein loses Audit, sondern eine priorisierte Entscheidungsgrundlage.",
      "Lokale Sichtbarkeit braucht Website und Standortsignale.",
      "SEO kann eine bestehende Website verbessern – oder zeigen, dass die Grundlage zuerst erneuert werden muss.",
      "Klären wir, welche SEO-Maßnahmen für Ihre Website wirklich sinnvoll sind.",
    ]) {
      expect(h2s).toContain(heading);
    }
  });

  it("covers the four typical starting situations", () => {
    const text = pageText(getDoc());
    for (const item of [
      "falsche oder fehlende Zielseiten",
      "unklare Keyword- und Themenzuordnung",
      "technische Hindernisse",
      "schwacher Weg von der Suche zur Anfrage",
    ]) {
      expect(text.toLowerCase()).toContain(item.toLowerCase());
    }
  });

  it("covers the local SEO building blocks without reducing it to the business profile", () => {
    const text = pageText(getDoc());
    for (const item of [
      "Leistungs- und Standortzuordnung",
      "konsistente Unternehmensdaten",
      "Google-Unternehmensprofil, wenn vereinbart",
      "lokale Zielseiten nur bei echtem Leistungsbezug",
      "strukturierte Daten",
      "Kontakt- und Anfragewege",
    ]) {
      expect(text.toLowerCase()).toContain(item.toLowerCase());
    }
    expect(text).toMatch(/Unternehmensprofil[^.]*(Baustein|Teil)/);
    expect(text).not.toMatch(/Local SEO (besteht|ist) (ausschließlich|nur)/i);
  });

  it("lists the five process steps and names no flat project duration", () => {
    const doc = getDoc();
    const process = doc.querySelector("#ablauf");
    expect(process).not.toBeNull();
    const steps = [...process.querySelectorAll("ol > li")].map((li) =>
      li.textContent.replace(/\s+/g, " ").toLowerCase()
    );
    expect(steps).toHaveLength(5);
    [
      "ziele und ausgangslage klären",
      "website, suchmarkt und bestehende daten prüfen",
      "keyword-map und prioritäten entwickeln",
      "ergebnisse besprechen und umsetzung entscheiden",
      "optional umsetzen, messen und weiterentwickeln",
    ].forEach((expected, index) => expect(steps[index]).toContain(expected));

    const text = pageText(doc);
    expect(text).toMatch(/Zeitrahmen hängt/);
    expect(text).not.toMatch(/\d+\s*(Tage|Wochen|Monate)\b/);
  });

  it("measures success in the briefed order and calls rankings only an intermediate signal", () => {
    const doc = getDoc();
    const items = [...doc.querySelectorAll("#erfolgsmessung ol > li")].map((li) =>
      li.textContent.replace(/\s+/g, " ").toLowerCase()
    );
    expect(items).toHaveLength(5);
    [
      "indexierung und technische zugänglichkeit",
      "sichtbarkeit für relevante suchanfragen",
      "qualifizierter organischer traffic",
      "anfragen und gewünschte handlungen",
      "angebote, gewonnene kunden und umsatz, soweit messbar",
    ].forEach((expected, index) => expect(items[index]).toContain(expected));
    expect(pageText(doc)).toContain(
      "Rankings sind ein Zwischensignal, kein alleiniger Geschäftserfolg."
    );
  });

  it("states the six-month minimum term only for agreed ongoing care", () => {
    const text = pageText(getDoc());
    expect(text).toMatch(/Mindestlaufzeit von sechs Monaten/);
    expect(text).toMatch(/individuell kalkuliert/);
  });
});

describe("/seo-heide FAQ", () => {
  const QUESTIONS = [
    "Was kostet SEO bei TigerFlow?",
    "Was ist im SEO-Setup enthalten?",
    "Ist die Umsetzung im Preis enthalten?",
    "Wie lange dauert SEO?",
    "Kann TigerFlow eine bestehende Website optimieren?",
    "Ist ein Website-Neubau erforderlich?",
    "Was ist Local SEO?",
    "Kann TigerFlow Platz 1 bei Google garantieren?",
    "Bietet TigerFlow laufende SEO-Betreuung an?",
    "Welche Zugänge und Daten werden benötigt?",
  ];

  it("uses native details/summary for all ten briefed questions, closed by default", () => {
    const doc = loadDoc("seo-heide.html");
    const entries = [...doc.querySelectorAll("#faq details")];
    expect(entries).toHaveLength(QUESTIONS.length);
    entries.forEach((details, index) => {
      expect(details.hasAttribute("open")).toBe(false);
      expect(details.querySelector("summary").textContent.trim()).toBe(QUESTIONS[index]);
      expect(details.querySelector(".sh-faq-answer").textContent.trim().length).toBeGreaterThan(60);
    });
  });

  it("answers the guarantee and access questions within the confirmed limits", () => {
    const text = pageText(loadDoc("seo-heide.html"));
    expect(text).toMatch(/Nein\.[^.]*(garantier|Zusage)/);
    expect(text).toMatch(/Zugänge/);
    expect(text).toMatch(/Search Console/);
  });
});

describe("/seo-heide linking, claims and structured data", () => {
  const getDoc = () => loadDoc("seo-heide.html");

  it("links crawlably to /webdesign-heide, the homepage and the legal pages", () => {
    const doc = getDoc();
    const hrefs = [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    for (const href of ["/webdesign-heide", "/", "/impressum", "/datenschutz"]) {
      expect(hrefs).toContain(href);
    }
    const webdesignLink = doc.querySelector('main a[href="/webdesign-heide"]');
    expect(webdesignLink?.textContent.trim().length).toBeGreaterThan(10);
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

  it("makes no ranking, traffic, lead or revenue promise and invents no proof", () => {
    const text = pageText(getDoc());
    const sentences = text.split(/(?<=[.?!])\s+/);
    for (const sentence of sentences) {
      if (/garantier|Platz 1/i.test(sentence)) {
        const isFaqQuestion = sentence.trim().endsWith("?");
        const isNegated = /\b(kein|keine|keinen|keiner|nicht|weder|nie|niemand|ohne)\b/i.test(
          sentence
        );
        expect(isFaqQuestion || isNegated, sentence).toBe(true);
      }
    }
    expect(text).not.toMatch(/schnelle Ergebnisse|schnell zu Ergebnissen|sofort mehr|garantiert mehr/i);
    expect(text).not.toMatch(/Fallstudie|Kundenstimme|Bewertungen|Referenzkunden|★/i);
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/\d+\s*(Kunden|Projekte|Rankings|Besucher|Anfragen)\b/);
  });

  it("distributes the keyword cluster naturally without a hero keyword list", () => {
    const doc = getDoc();
    const text = pageText(doc);
    for (const pattern of [
      /SEO[- ]Agentur/,
      /Suchmaschinenoptimierung/,
      /SEO[- ]Beratung/,
      /Local SEO/,
      /bei Google/,
      /SEO für Unternehmen in Heide/,
    ]) {
      expect(text).toMatch(pattern);
    }
    expect((text.match(/SEO[ -]Heide/g) ?? []).length).toBeLessThanOrEqual(6);

    const hero = doc.querySelector(".sh-hero");
    expect(hero).not.toBeNull();
    expect(hero.querySelector("ul, ol")).toBeNull();
    expect(hero.textContent).not.toMatch(/SEO[- ]Agentur Heide|Suchmaschinenoptimierung Heide/);
  });

  it("keeps the heading hierarchy without skipped levels", () => {
    const levels = [...getDoc().querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it("ships consistent JSON-LD for WebPage, Service, BreadcrumbList and the fully visible FAQ", () => {
    const doc = getDoc();
    const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    expect(scripts.length).toBeGreaterThan(0);
    const nodes = scripts.flatMap((script) => {
      const data = JSON.parse(script.textContent);
      return data["@graph"] ?? [data];
    });
    const byType = (type) => nodes.filter((node) => node["@type"] === type);

    expect(byType("WebPage")[0].url).toBe(`${SITE_URL}/seo-heide`);
    const service = byType("Service")[0];
    expect(service.offers.priceSpecification.minPrice).toBe(499);
    expect(service.offers.priceSpecification.priceCurrency).toBe("EUR");
    expect(service.provider.address.addressLocality).toBe("Heide");

    const crumbs = byType("BreadcrumbList")[0].itemListElement.map((item) => item.item);
    expect(crumbs).toEqual([`${SITE_URL}/`, `${SITE_URL}/seo-heide`]);

    const faq = byType("FAQPage")[0];
    const visible = [...doc.querySelectorAll("#faq details")].map((details) => ({
      q: details.querySelector("summary").textContent.trim(),
      a: details.querySelector(".sh-faq-answer").textContent.replace(/\s+/g, " ").trim(),
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
  });

  it("leaves homepage hero and the existing money pages without a link to the new route yet", () => {
    const home = loadDoc("index.html");
    expect(home.querySelector("h1").textContent.replace(/\s+/g, " ").trim()).toBe("Wir bauen");
    for (const file of ["index.html", "webdesign-heide.html", "webdesign-dithmarschen.html"]) {
      const hrefs = [...loadDoc(file).querySelectorAll("a[href]")].map((a) =>
        a.getAttribute("href")
      );
      expect(hrefs).not.toContain("/seo-heide");
    }
  });
});

describe("/seo-heide stylesheet invariants", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/SeoHeidePage.css"), "utf8");

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

  it("styles the page in its own sh- namespace", () => {
    expect(css).toMatch(/\.sh-page\b/);
    expect(css).not.toMatch(/\.(wdh|wdd)-/);
  });

  it("shows a visible focus indicator for links, buttons and summaries", () => {
    expect(css).toMatch(/\.sh-page a:focus-visible/);
    expect(css).toMatch(/\.sh-page button:focus-visible/);
    expect(css).toMatch(/\.sh-page summary:focus-visible/);
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
    expect(body).toMatch(/\.sh-reveal-pending/);
    expect(body).toMatch(/transform:\s*none\s*!important/);
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

  it("keeps UI transitions under 300 ms with the strong ease-out curve", () => {
    expect(css).toMatch(/--sh-ease-out:\s*cubic-bezier\(\.23,\s*1,\s*\.32,\s*1\)/);
    for (const [, value] of css.matchAll(/transition\s*:\s*([^;}]+)/g)) {
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
        expect(ms, value).toBeLessThanOrEqual(300);
      }
    }
    for (const [, value] of css.matchAll(/(?<![-\w])animation\s*:\s*([^;}]+)/g)) {
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = unit === "s" ? Number(amount) * 1000 : Number(amount);
        expect(ms, value).toBeLessThanOrEqual(700);
      }
    }
  });

  it("gives pressable elements instant press feedback", () => {
    expect(css).toMatch(/\.sh-btn:active\s*\{[^}]*scale\(\.9[5-8]\)/);
  });

  it("uses backdrop-filter only inside @supports on top of a solid readable background", () => {
    const outsideSupports = stripBlocks(css, /@supports[^{]*\{/).replace(
      /@supports[^{]*\{\s*\}/g,
      ""
    );
    expect(outsideSupports).not.toMatch(/backdrop-filter/);
    expect(css).toMatch(/@supports\s*\(\(?\s*(-webkit-)?backdrop-filter/);
    expect(css).toMatch(/\.sh-glass\s*\{[^}]*background:\s*#[0-9A-Fa-f]{6}\b/);
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
    expect(css).toMatch(/\.sh-btn\s*\{[^}]*background:\s*#FF7A00;[^}]*color:\s*#111111/);
    expect(contrast("#111111", "#FF7A00")).toBeGreaterThanOrEqual(4.5);
  });

  it("is built for 320 px without hiding page-level overflow and offers 44 px touch targets", () => {
    expect(css).not.toMatch(/\.sh-page\s*\{[^}]*overflow-x:\s*(?:clip|hidden)/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*760px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*420px\s*\)/);
    expect(css).toMatch(/\.sh-btn\s*\{[^}]*min-height:\s*(4[4-9]|[5-9]\d)px/);
    expect(css).not.toMatch(/(?<![-\w])min-width\s*:\s*(3[2-9]\d|[4-9]\d\d|\d{4,})px/);
  });
});
