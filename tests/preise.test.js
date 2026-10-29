import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const PATH = "/preise";
const OUT_FILE = "preise.html";
const route = ROUTES.find(({ path: routePath }) => routePath === PATH);

function loadDoc(outFile = OUT_FILE) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

const clean = (element) => element.textContent.replace(/\s+/g, " ").trim();

describe("/preise route and metadata", () => {
  it("is an approved prerendered route with the briefed metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        path: PATH,
        outFile: OUT_FILE,
        title: "Webdesign-Preise & Website-Kosten | TigerFlow",
        description:
          "Website ab 829 € netto: Leistungen, Zahlungsplan, Betreuung, SEO-Setup und Add-ons bei TigerFlow transparent erklärt. Festpreis nach Bedarfsklärung.",
      })
    );
    expect(existsSync(path.join(DIST_DIR, OUT_FILE))).toBe(true);
  });

  it("has its own Open Graph title and description based on title and description", () => {
    expect(route.ogTitle).toBeTruthy();
    expect(route.ogTitle).not.toBe(route.title);
    expect(route.ogDescription).toBeTruthy();
    expect(route.ogDescription).not.toBe(route.description);
    expect(route.ogDescription).toContain("829 €");
  });

  it("ships title, description, self-canonical and index,follow in the initial HTML", () => {
    const doc = loadDoc();
    expect(doc.title).toBe(route.title);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      route.description
    );
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      `${SITE_URL}${PATH}`
    );
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "index, follow"
    );
  });

  it("has metadata distinct from every other route", () => {
    for (const other of ROUTES.filter((r) => r.path !== PATH)) {
      expect(route.title).not.toBe(other.title);
      expect(route.description).not.toBe(other.description);
    }
  });

  it("appears in the sitemap exactly once as an absolute https URL", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap.split(`<loc>${SITE_URL}${PATH}</loc>`)).toHaveLength(2);
  });

  it("ships no hidden reveal state in the initial HTML", () => {
    const html = readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8");
    expect(html).not.toContain("pr-reveal-pending");
    expect(html).not.toContain("pr-revealed");
  });

  it("renders exactly one H1 with the briefed wording in the initial HTML", () => {
    const doc = loadDoc();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(clean(doc.querySelector("h1"))).toBe("Was kostet eine Website bei TigerFlow?");
  });

  it("renders hero eyebrow, sub-line, primary CTA and the jump link in the initial HTML", () => {
    const doc = loadDoc();
    const hero = doc.querySelector(".pr-hero");
    expect(hero).not.toBeNull();
    const text = clean(hero);
    expect(text).toMatch(/Preise & Leistungsumfang/i);
    expect(text).toContain(
      "Der Einstieg beginnt bei 829 € netto. Vor dem Projekt erhalten Sie ein Festpreisangebot mit klar definiertem Umfang – inklusive Website-Basis, Launch und technischer SEO-Grundlage."
    );
    const cta = hero.querySelector("button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("Projekt unverbindlich einordnen");
    const jump = [...hero.querySelectorAll('a[href^="#"]')].find(
      (a) => clean(a) === "Leistungen und Preise ansehen"
    );
    expect(jump).toBeTruthy();
    expect(doc.getElementById(jump.getAttribute("href").slice(1))).not.toBeNull();
  });
});

describe("/preise inbound link and protected pages", () => {
  it("is linked crawlably as 'Preise und Leistungsumfang' from the shared service menu", () => {
    for (const file of [
      "index.html",
      "webdesign-heide.html",
      "webdesign-dithmarschen.html",
      "webdesign-schleswig-holstein.html",
      "seo-heide.html",
      OUT_FILE,
    ]) {
      const link = loadDoc(file).querySelector(`.tf-service-menu a[href="${PATH}"]`);
      expect(link, file).not.toBeNull();
      expect(clean(link)).toBe("Preise und Leistungsumfang");
    }
    const current = loadDoc().querySelector(`.tf-service-menu a[href="${PATH}"]`);
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("does not change the homepage hero", () => {
    expect(clean(loadDoc("index.html").querySelector("h1"))).toBe("Wir bauen");
  });
});

// Visible text only: drops JSON-LD and separates adjacent elements with a space.
function pageText(doc) {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll("script").forEach((script) => script.remove());
  body.querySelectorAll("*").forEach((element) => element.append(" "));
  return body.textContent.replace(/\s+/g, " ").trim();
}

const sectionText = (id) => {
  const section = loadDoc().getElementById(id);
  expect(section, `#${id}`).not.toBeNull();
  return pageText({ body: section });
};

const expectAll = (text, items) => {
  for (const item of items) expect(text, item).toContain(item);
};

describe("/preise website entry and full standard scope", () => {
  it("shows the entry price as 'ab 829 € netto' plus VAT with up to five content pages", () => {
    const text = sectionText("website-einstieg");
    expectAll(text, ["ab 829 €", "netto", "zzgl. USt.", "bis zu fünf Inhaltsseiten"]);
    expect(text).toMatch(/Impressum und Datenschutz zusätzlich/);
  });

  it("separates the entry price from the individual fixed-price offer", () => {
    const text = sectionText("website-einstieg");
    expect(text).toMatch(/Einstiegspreis, kein pauschaler Endpreis/);
    expect(text).toMatch(/individuell kalkuliertes Festpreisangebot/);
    expect(text).toMatch(/Bedarfsklärung/);
  });

  it("states the 50/50 payment plan", () => {
    const text = sectionText("website-einstieg");
    expectAll(text, ["50 % bei Beauftragung", "50 % vor dem Launch"]);
  });

  it("lists the complete confirmed standard scope, not a shortened example list", () => {
    const items = [...loadDoc().querySelectorAll("#website-einstieg .pr-included > li")].map(clean);
    expect(items.length).toBeGreaterThanOrEqual(13);
    const text = items.join(" | ");
    expectAll(text, [
      "Bis zu fünf Inhaltsseiten",
      "Impressum und Datenschutz",
      "Responsive Darstellung für Mobilgeräte, Tablets und Desktop",
      "Erstellung und Überarbeitung der vereinbarten Seitentexte",
      "vorhandener Kundenbilder",
      "korrekt lizenzierter Bilder",
      "Verlinkung vorhandener Social-Media-Profile",
      "Technische SEO-Basis",
      "Barrierefreiheits-Basis",
      "einfacher E-Mail-Anfragefunnel",
      "Impressums- und Datenschutzentwürfe",
      "Veröffentlichung der freigegebenen Website über Vercel",
      "Domain- und DNS-Anbindung",
      "Launchbereite, öffentlich erreichbare Website",
    ]);
  });

  it("spells out what the technical SEO base covers", () => {
    const text = sectionText("website-einstieg");
    expectAll(text, [
      "Seitentitel",
      "Meta-Descriptions",
      "Überschriftenstruktur",
      "Indexierbarkeit",
      "Sitemap",
      "robots.txt",
      "Canonicals",
    ]);
  });

  it("explains corrections without promising unlimited scope", () => {
    const text = sectionText("website-einstieg");
    expect(text).toMatch(
      /Korrekturen innerhalb des vereinbarten Leistungsumfangs haben vor dem Launch keine feste Rundenzahl/
    );
    expect(text).toMatch(/Zusätzliche Seiten, neue Funktionen, grundlegende Richtungswechsel/);
    expect(text).toMatch(/separat kalkuliert/);
  });

  it("links descriptively to the detailed Schleswig-Holstein web design page", () => {
    const link = loadDoc().querySelector('main a[href="/webdesign-schleswig-holstein"]');
    expect(link).not.toBeNull();
    expect(clean(link).length).toBeGreaterThan(14);
  });
});

describe("/preise price factors and suitability", () => {
  it("names the five transparent price factors in order", () => {
    const items = [...loadDoc().querySelectorAll("#preisfaktoren ol > li")].map((li) =>
      clean(li).toLowerCase()
    );
    expect(items).toHaveLength(5);
    [
      "seiten und inhaltsumfang",
      "funktionen und integrationen",
      "vorhandene oder neu zu erstellende inhalte",
      "design- und änderungsumfang",
      "externe dienste und laufende kosten",
    ].forEach((expected, index) => expect(items[index]).toContain(expected));
  });

  it("pre-qualifies complex projects as individually checked, without market prices", () => {
    const text = sectionText("preisfaktoren");
    expectAll(text, ["Shops", "Portale", "individuell geprüft und kalkuliert"]);
    expect(pageText(loadDoc())).not.toMatch(/Durchschnitt|Marktpreis|andere Agenturen|günstiger als/i);
  });
});

describe("/preise included, optional and external costs", () => {
  const groups = () =>
    [...loadDoc().querySelectorAll("#leistungen .pr-split > article")].map((article) => ({
      title: clean(article.querySelector("h3")),
      text: clean(article),
    }));

  it("separates included, optional and external costs into three visible groups", () => {
    expect(groups().map((g) => g.title)).toEqual([
      "Im Website-Einstieg enthalten",
      "Optional durch TigerFlow",
      "Extern und laufend",
    ]);
  });

  it("lists the briefed optional services separately", () => {
    const optional = groups()[1].text;
    expectAll(optional, [
      "Fotoshooting",
      "Zusätzliche Inhaltsseiten",
      "Umfangreiche zusätzliche Inhalte",
      "Shops, Portale und individuelle Webanwendungen",
      "Komplexe Schnittstellen",
      "Strategische oder laufende SEO-Leistungen",
      "Analytics und Conversion-Messung",
      "Formale Barrierefreiheitsprüfung",
      "Terminbuchungssysteme",
      "Automatisierte E-Mail-Follow-ups",
      "TigerBot, TelefonBot",
      "Monatliche Wartung und Betreuung",
    ]);
  });

  it("names third-party costs and when they are disclosed", () => {
    const external = groups()[2].text;
    expectAll(external, ["Domain", "Hosting", "Software", "Lizenz", "Medien"]);
    expect(sectionText("leistungen")).toContain("Fremdkosten werden vor Beauftragung ausgewiesen");
  });

  it("explains the legal boundary calmly and without conformity promises", () => {
    const text = sectionText("leistungen");
    expectAll(text, [
      "anhand der von Ihnen bereitgestellten Informationen",
      "keine Rechtsberatung",
      "rechtliche Konformität wird nicht garantiert",
      "qualifizierte Stelle",
      "keine formale WCAG- oder BFSG-Prüfung",
    ]);
  });
});

describe("/preise care plans after launch", () => {
  const plans = () =>
    [...loadDoc().querySelectorAll("#betreuung .pr-plan")].map((plan) => clean(plan));

  it("shows the three confirmed care plans with prices and change allowances", () => {
    const [basis, wachstum, premium] = plans();
    expect(plans()).toHaveLength(3);
    expectAll(basis, ["Basis", "49 €", "netto pro Monat", "Technische Wartung", "Betreuung des Hostings", "Support per E-Mail", "30 Minuten Änderungskontingent", "Keine Analytics-Leistung"]);
    expectAll(wachstum, ["Wachstum", "99 €", "netto pro Monat", "Leistungen aus Basis", "1 Stunde Änderungskontingent", "Einrichtung von Analytics", "Analytics-Dashboard"]);
    expectAll(premium, ["Premium", "199 €", "netto pro Monat", "Leistungen aus Wachstum", "2 Stunden Änderungskontingent", "monatlicher Bericht"]);
  });

  it("states every condition that applies to all care plans", () => {
    const text = sectionText("betreuung");
    expectAll(text, [
      "drei Monate Mindestlaufzeit, danach monatlich kündbar",
      "verfällt am Monatsende",
      "99 € netto pro Stunde in 15-Minuten-Einheiten",
      "keine feste Reaktionszeit",
      "Fremdkosten sind nicht enthalten",
      "SEO nur bei ausdrücklicher Zusatzvereinbarung",
    ]);
    expect(text).toMatch(/Zusätzliche Seiten, Funktionen, größere Umgestaltungen und eigenständige Projekte/);
  });

  it("presents the plans as optional without belittling a website without a plan", () => {
    const text = sectionText("betreuung");
    expect(text).toMatch(/optional/i);
    expect(text).toMatch(/keine Voraussetzung/);
    expect(text).not.toMatch(/unsicher|ungeschützt|veraltet|Risiko/i);
  });

  it("uses no popularity badge, discount or scarcity element anywhere", () => {
    const text = pageText(loadDoc());
    expect(text).not.toMatch(/beliebt|bestseller|empfohlen|Rabatt|sparen|nur noch|Angebot endet|limitiert/i);
    expect(text).not.toMatch(/statt \d/);
  });
});

describe("/preise SEO staging and add-ons", () => {
  it("stages SEO as base included, setup from 499 €, implementation and ongoing care separate", () => {
    const text = sectionText("seo");
    expectAll(text, [
      "Technische SEO-Basis",
      "ab 499 €",
      "Keyword-, Wettbewerbs- und Suchintentionsanalyse",
      "Schriftliche Analyse der Ausgangslage",
      "Keyword-Map",
      "Priorisierter Maßnahmenplan",
      "Technische Umsetzung",
      "Redaktionelle Umsetzung",
      "Neue Zielseiten",
      "Laufende Betreuung",
      "sechs Monate Mindestlaufzeit",
      "individuell kalkuliert",
    ]);
    expect(text).toMatch(/Festpreis richtet sich nach Umfang, Websitegröße, Markt und Wettbewerb/);
    const link = loadDoc().querySelector('#seo a[href="/seo-heide"]');
    expect(link && clean(link).length).toBeGreaterThan(14);
  });

  it("names no monthly amount for ongoing SEO care", () => {
    const ongoing = clean(loadDoc().querySelector("#seo .pr-seo-ongoing"));
    expect(ongoing).not.toMatch(/€/);
  });

  it("shows booking from 149 € and follow-up from 399 € with their scope limits", () => {
    const cards = [...loadDoc().querySelectorAll("#add-ons .pr-addon")].map(clean);
    expect(cards).toHaveLength(4);
    const [booking, followUp] = cards;
    expectAll(booking, ["Terminbuchung", "ab 149 €", "Standard-Buchungssystem", "Ein Buchungstyp", "Kalender", "Bestätigung", "Funktionstest", "Weitere Buchungstypen", "Mehrere Mitarbeiter oder Standorte", "Individuelle Buchungslogik"]);
    expectAll(followUp, ["E-Mail-Follow-up", "ab 399 €", "Bis zu drei automatisierte E-Mails", "Technische Einrichtung", "Funktionstest", "finalen E-Mail-Texte", "Keine Rechtsprüfung", "CRM-Logik", "Versand-"]);
  });

  it("publishes no bot prices", () => {
    const [, , ai, more] = [...loadDoc().querySelectorAll("#add-ons .pr-addon")].map(clean);
    expectAll(ai, ["TigerBot", "TelefonBot", "individuell"]);
    expect(ai).not.toMatch(/€|\d/);
    expect(more).not.toMatch(/€/);
    expect(pageText(loadDoc())).not.toMatch(/(TigerBot|TelefonBot)[^.]{0,80}\d+\s?€/);
  });
});

describe("/preise process and FAQ", () => {
  it("lists the seven steps to the fixed price and names no flat project duration", () => {
    const steps = [...loadDoc().querySelectorAll("#ablauf ol > li")].map((li) =>
      clean(li).toLowerCase()
    );
    expect(steps).toHaveLength(7);
    [
      "projekt-check",
      "bedarf und umfang klären",
      "schriftliches festpreisangebot",
      "beauftragung und 50-%-startzahlung",
      "umsetzung und abstimmung",
      "restzahlung vor launch",
      "veröffentlichung nach freigabe",
    ].forEach((expected, index) => expect(steps[index]).toContain(expected));
    expect(pageText(loadDoc())).not.toMatch(/\d+\s*(Tage|Tagen|Wochen|Werktage)\b/);
  });

  const QUESTIONS = [
    "Was kostet eine Website bei TigerFlow?",
    "Was ist im Einstiegspreis von 829 € enthalten?",
    "Ist der Ab-Preis bereits ein verbindlicher Festpreis?",
    "Wie wird die Website bezahlt?",
    "Wie viele Korrekturen sind möglich?",
    "Welche laufenden Kosten können nach dem Launch entstehen?",
    "Ist SEO im Websitepreis enthalten?",
    "Muss ich ein monatliches Servicepaket buchen?",
    "Sind Impressum und Datenschutz enthalten?",
    "Was kosten zusätzliche Seiten oder Funktionen?",
  ];

  it("uses native details/summary for all ten briefed questions, closed by default", () => {
    const entries = [...loadDoc().querySelectorAll("#faq details")];
    expect(entries).toHaveLength(QUESTIONS.length);
    entries.forEach((details, index) => {
      expect(details.hasAttribute("open")).toBe(false);
      expect(clean(details.querySelector("summary"))).toBe(QUESTIONS[index]);
      expect(clean(details.querySelector(".pr-faq-answer")).length).toBeGreaterThan(60);
    });
  });
});

describe("/preise linking, claims and structured data", () => {
  it("links only to published routes, never to /website-betreuung or external hosts", () => {
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
        expect(href).toMatch(/^mailto:/);
      }
    }
    expect(doc.body.innerHTML).not.toContain("/website-betreuung");
    for (const img of doc.getElementById("root").querySelectorAll("img")) {
      expect(img.getAttribute("src")).toBe("/tigerflow-mark.png");
    }
  });

  it("makes no ranking, lead, revenue, legal or accessibility promise", () => {
    const text = pageText(loadDoc());
    for (const sentence of text.split(/(?<=[.?!])\s+/)) {
      if (/garantier|Platz 1/i.test(sentence)) {
        const isQuestion = sentence.trim().endsWith("?");
        const isNegated = /\b(kein|keine|keinen|keiner|nicht|weder|nie|niemand|ohne)\b/i.test(sentence);
        expect(isQuestion || isNegated, sentence).toBe(true);
      }
    }
    expect(text).not.toMatch(
      /alles inklusive|unbegrenzt|rechtssicher|vollständig barrierefrei|barrierefrei nach|kostenlos|gratis|keine laufenden Kosten|SEO inklusive|ohne versteckte Kosten|mehr Kunden|mehr Umsatz/i
    );
    expect(text).not.toMatch(/Fallstudie|Kundenstimme|Bewertungen|Referenzkunden|★/i);
    expect(text.replace(/50\s?%/g, "")).not.toMatch(/\d+\s?%/);
  });

  it("keeps the heading hierarchy without skipped levels", () => {
    const levels = [...loadDoc().querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it("ships WebPage, BreadcrumbList and a FAQPage identical to the visible FAQ, without Offer or ratings", () => {
    const doc = loadDoc();
    const nodes = [...doc.querySelectorAll('#root script[type="application/ld+json"]')].flatMap(
      (script) => {
        const data = JSON.parse(script.textContent);
        return data["@graph"] ?? [data];
      }
    );
    const byType = (type) => nodes.filter((node) => node["@type"] === type);

    expect(byType("WebPage")[0].url).toBe(`${SITE_URL}${PATH}`);
    expect(byType("BreadcrumbList")[0].itemListElement.map((item) => item.item)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}${PATH}`,
    ]);

    const faq = byType("FAQPage")[0];
    const visible = [...doc.querySelectorAll("#faq details")].map((details) => ({
      q: clean(details.querySelector("summary")),
      a: clean(details.querySelector(".pr-faq-answer")),
    }));
    expect(faq.mainEntity).toHaveLength(visible.length);
    faq.mainEntity.forEach((entry, index) => {
      expect(entry.name).toBe(visible[index].q);
      expect(entry.acceptedAnswer.text).toBe(visible[index].a);
    });

    const serialized = JSON.stringify(nodes);
    for (const key of ["Offer", "aggregateRating", "review", "reviewRating", "availability"]) {
      expect(serialized).not.toContain(key);
    }
  });
});

describe("/preise stylesheet invariants", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/PreisePage.css"), "utf8");

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

  it("styles the page in its own pr- namespace", () => {
    expect(css).toMatch(/\.pr-page\b/);
    expect(css).not.toMatch(/\.(wdh|wdd|wsh|sh)-/);
  });

  it("shows a visible focus indicator for links, buttons and summaries", () => {
    expect(css).toMatch(/\.pr-page a:focus-visible/);
    expect(css).toMatch(/\.pr-page button:focus-visible/);
    expect(css).toMatch(/\.pr-page summary:focus-visible/);
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
    expect(body).toMatch(/\.pr-reveal-pending/);
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
    expect(css).toMatch(/--pr-ease-out:\s*cubic-bezier\(\.23,\s*1,\s*\.32,\s*1\)/);
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
    expect(css).toMatch(/\.pr-btn:active\s*\{[^}]*scale\(\.9[5-8]\)/);
  });

  it("uses backdrop-filter only inside @supports on top of a solid readable background", () => {
    const outsideSupports = stripBlocks(css, /@supports[^{]*\{/).replace(
      /@supports[^{]*\{\s*\}/g,
      ""
    );
    expect(outsideSupports).not.toMatch(/backdrop-filter/);
    expect(css).toMatch(/@supports\s*\(\(?\s*(-webkit-)?backdrop-filter/);
    expect(css).toMatch(/\.pr-glass\s*\{[^}]*background:\s*#[0-9A-Fa-f]{6}\b/);
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
    expect(css).toMatch(/\.pr-btn\s*\{[^}]*background:\s*#FF7A00;[^}]*color:\s*#111111/);
    expect(contrast("#111111", "#FF7A00")).toBeGreaterThanOrEqual(4.5);
  });

  it("is built for 320 px without hiding page-level overflow and offers 44 px touch targets", () => {
    expect(css).not.toMatch(/\.pr-page\s*\{[^}]*overflow-x:\s*(?:clip|hidden)/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*760px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*420px\s*\)/);
    expect(css).toMatch(/\.pr-btn\s*\{[^}]*min-height:\s*(4[4-9]|[5-9]\d)px/);
    expect(css).not.toMatch(/(?<![-\w])min-width\s*:\s*(3[2-9]\d|[4-9]\d\d|\d{4,})px/);
  });

  it("collapses every multi-column grid to one column at 760 px, including the SEO-setup lists", () => {
    const mobile = blocks(css, /@media\s*\(\s*max-width\s*:\s*760px\s*\)\s*\{/).join("\n");
    for (const selector of [".pr-included", ".pr-terms", ".pr-addons", ".pr-seo-steps", ".pr-seo-step-key .pr-seo-lists"]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(mobile, selector).toMatch(
        new RegExp(`${escaped}[^{]*\\{[^}]*grid-template-columns:\\s*minmax\\(0,\\s*1fr\\)`)
      );
    }
  });

  it("pops cards in with a short scale-up keyframe that never holds the transform afterwards", () => {
    const pop = blocks(css, /@keyframes\s+pr-pop\s*\{/).join("\n");
    expect(pop).toMatch(/scale\(\.9\d*\)/);
    expect(css).toMatch(
      /\[data-pr-reveal="pop"\]\.pr-revealed\s*\{[^}]*animation:\s*pr-pop\s+\d+ms[^;}]*\bbackwards\b/
    );
    expect(css).toMatch(/\[data-pr-reveal="pop"\]\.pr-reveal-pending\s*\{[^}]*scale\(/);
  });

  it("gives hovered cards a lifted glass layer with a pointer-following light, only for fine pointers", () => {
    expect(css).toMatch(/\.pr-sheen\s*\{[^}]*opacity:\s*0[^}]*\}/);
    expect(css).toMatch(/\.pr-sheen\s*\{[^}]*radial-gradient\([^)]*var\(--pr-mx/);
    expect(css).toMatch(/\[data-pr-glass\]\s*\{[^}]*isolation:\s*isolate/);
    const hover = blocks(css, hoverMedia).join("\n");
    expect(hover).toMatch(/\[data-pr-glass\]:hover\s*\{[^}]*translate3d\(0,\s*-\d+px,\s*0\)/);
    expect(hover).toMatch(/\[data-pr-glass\]:hover\s*>\s*\.pr-sheen\s*\{[^}]*opacity:\s*1/);
    expect(hover).toMatch(/var\(--pr-px/);
  });

  it("sends a short, finite light pulse through the hero connector", () => {
    expect(css).toMatch(/\.pr-connector::after\s*\{[^}]*animation-iteration-count:\s*[1-3]\b/);
  });

  it("falls back for reduced transparency, high contrast and forced colours", () => {
    const supports = blocks(css, /@supports[^{]*backdrop-filter[^{]*\{/).join("\n");
    expect(supports).toMatch(/prefers-reduced-transparency:\s*reduce/);
    expect(css).toMatch(/@media\s*\(\s*prefers-contrast\s*:\s*more\s*\)/);
    const forced = blocks(css, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/).join("\n");
    expect(forced).toMatch(/CanvasText|ButtonText|Highlight/);
  });
});
