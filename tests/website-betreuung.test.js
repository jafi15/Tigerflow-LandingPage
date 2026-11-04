import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { ROUTE_PAGES } from "../src/routePages.js";
import { DIST_DIR } from "../scripts/serve-dist.mjs";

const PATH = "/website-betreuung";
const OUT_FILE = "website-betreuung.html";
const TITLE = "Website-Betreuung & Wartung ab 49 € | TigerFlow";
const DESCRIPTION =
  "Website-Betreuung ab 49 € netto: monatliche Wartung, Änderungen und E-Mail-Support mit klaren Konditionen. Pakete und Grenzen im Überblick.";
const H1 = "Website-Betreuung mit klaren Leistungen und Grenzen";
const route = ROUTES.find(({ path: routePath }) => routePath === PATH);

function loadDoc(outFile = OUT_FILE) {
  return new JSDOM(readFileSync(path.join(DIST_DIR, outFile), "utf8")).window.document;
}

const clean = (element) => element.textContent.replace(/\s+/g, " ").trim();

// Visible text only: drops JSON-LD and separates adjacent elements with a space.
function pageText(doc) {
  const body = doc.body.cloneNode(true);
  body.querySelectorAll("script").forEach((script) => script.remove());
  body.querySelectorAll("*").forEach((element) => element.append(" "));
  return body.textContent.replace(/\s+/g, " ").trim();
}

describe("/website-betreuung route and metadata", () => {
  it("is registered in the route config with the briefed metadata", () => {
    expect(route).toEqual(
      expect.objectContaining({
        path: PATH,
        outFile: OUT_FILE,
        title: TITLE,
        description: DESCRIPTION,
        changefreq: "monthly",
        priority: "0.8",
      })
    );
  });

  it("has its own Open Graph title and description based on title and description", () => {
    expect(route.ogTitle).toBeTruthy();
    expect(route.ogTitle).not.toBe(route.title);
    expect(route.ogTitle).toMatch(/Website-Betreuung/);
    expect(route.ogDescription).toBeTruthy();
    expect(route.ogDescription).not.toBe(route.description);
    expect(route.ogDescription).toContain("49 €");
    // No new image asset: the existing approved social image is reused.
    expect(route.ogImage).toBeUndefined();
  });

  it("is code-split into its own page module and registered for SSR", () => {
    expect(ROUTE_PAGES[PATH]?.source).toBe("src/components/WebsiteBetreuungPage.jsx");
    const ssr = readFileSync(path.join(process.cwd(), "src/entry-server.jsx"), "utf8");
    expect(ssr).toMatch(/import \{ WebsiteBetreuungPage \} from "\.\/components\/WebsiteBetreuungPage"/);
    expect(ssr).toMatch(/"\/website-betreuung": WebsiteBetreuungPage/);
    expect(ssr).not.toMatch(/React\.lazy|Suspense/);
  });

  it("is prerendered to dist/website-betreuung.html", () => {
    expect(existsSync(path.join(DIST_DIR, OUT_FILE))).toBe(true);
  });

  it("ships title, description, self-canonical and index,follow in the initial HTML", () => {
    const doc = loadDoc();
    expect(doc.title).toBe(TITLE);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(DESCRIPTION);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(`${SITE_URL}${PATH}`);
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index, follow");
  });

  it("has metadata distinct from every other route", () => {
    for (const other of ROUTES.filter((r) => r.path !== PATH)) {
      expect(route.title).not.toBe(other.title);
      expect(route.description).not.toBe(other.description);
    }
  });

  it("appears in the sitemap exactly once", () => {
    const sitemap = readFileSync(path.join(DIST_DIR, "sitemap.xml"), "utf8");
    expect(sitemap.split(`<loc>${SITE_URL}${PATH}</loc>`)).toHaveLength(2);
  });

  it("renders exactly one H1 with the briefed wording inside the page root", () => {
    const doc = loadDoc();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(clean(doc.querySelector("h1"))).toBe(H1);
    expect(doc.querySelector("#root .wb-page h1")).not.toBeNull();
  });

  it("renders hero eyebrow, sub-line, entry price, primary CTA and jump link in the initial HTML", () => {
    const doc = loadDoc();
    const hero = doc.querySelector(".wb-hero");
    expect(hero).not.toBeNull();
    const text = clean(hero);
    expect(text).toMatch(/Website-Betreuung nach dem Launch/i);
    expect(text).toContain(
      "Monatliche technische Prüfung, kleinere Änderungen und E-Mail-Support ab 49 € netto. Transparent geregelt – ohne pauschale Sicherheits- oder Reaktionszeitversprechen."
    );
    const cta = hero.querySelector("button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("Projekt unverbindlich einordnen");
    const jump = [...hero.querySelectorAll('a[href^="#"]')].find(
      (a) => clean(a) === "Pakete und Leistungen ansehen"
    );
    expect(jump).toBeTruthy();
    expect(doc.getElementById(jump.getAttribute("href").slice(1))).not.toBeNull();
  });

  it("ships no hidden reveal state and no loading fallback in the initial HTML", () => {
    const html = readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8");
    expect(html).not.toContain("wb-reveal-pending");
    expect(html).not.toContain("wb-revealed");
    expect(pageText(loadDoc())).not.toMatch(/Wird geladen|Lädt|Loading/i);
  });
});

const sectionText = (id) => {
  const section = loadDoc().getElementById(id);
  expect(section, `#${id}`).not.toBeNull();
  return pageText({ body: section });
};

const expectAll = (text, items) => {
  for (const item of items) expect(text, item).toContain(item);
};

describe("/website-betreuung service frame (Betreuung, Wartung, Pflege)", () => {
  it("separates maintenance, care and support as three tasks of one frame", () => {
    const text = sectionText("leistung");
    expectAll(text, [
      "Drei Aufgaben, ein klarer Service-Rahmen",
      "nicht „alles unbegrenzt“",
      "Wartung",
      "Pflege",
      "Betreuung",
      "technische Wartung einmal monatlich",
      "Betreuung des Hostings im vereinbarten System",
      "Support per E-Mail während üblicher Geschäftszeiten",
      "tarifabhängiges Kontingent für kleinere Änderungen",
    ]);
    expect(loadDoc().querySelectorAll("#leistung .wb-layer")).toHaveLength(3);
  });
});

const CHECKS = [
  "Prüfung der Erreichbarkeit",
  "Kontrolle von Build und Deployment",
  "Funktionstest vorhandener Formulare",
  "Prüfung wichtiger interner und externer Links",
  "Kontrolle von Domain und SSL-Zertifikat",
  "Prüfung relevanter Abhängigkeiten und bekannter Sicherheitsprobleme",
  "Nachvollziehbare Versionierung ausgeführter Änderungen über GitHub",
];

describe("/website-betreuung monthly technical check routine (vollständiger Umfang)", () => {
  it("lists all seven confirmed checks in order, from one data source", () => {
    const items = [...loadDoc().querySelectorAll("#pruefroutine ol.wb-checks > li")].map((li) =>
      clean(li.querySelector("h3"))
    );
    expect(items).toEqual(CHECKS);
  });

  it("describes the form check safely, without promising productive test submissions", () => {
    const formCheck = [...loadDoc().querySelectorAll("#pruefroutine ol.wb-checks > li")][2];
    expect(clean(formCheck.querySelector("p"))).toBe(
      "Vorhandene Formulare werden einmal monatlich auf ihre grundlegende Funktion geprüft. Eine produktive Testübermittlung wird nicht pauschal zugesagt."
    );
    const text = pageText(loadDoc());
    expect(text).not.toMatch(/testweise ausgelöst/);
    expect(text).not.toMatch(/(Formular\w*|Testanfrage\w*)[^.]{0,80}(abgesendet|abschick|übermittelt|ausgelöst)(?![^.]*nicht)/i);
    expect(text).not.toMatch(/Test-?E-Mail|CRM-Eintr|Testdaten/i);
  });

  it("states the monthly rhythm and the briefed limitation right at the module", () => {
    const text = sectionText("pruefroutine");
    expectAll(text, [
      "Was TigerFlow einmal monatlich technisch prüft",
      "Die Prüfung reduziert keine technischen Risiken auf null und ersetzt keine gesondert vereinbarte Notfall-, Sicherheits- oder Backup-Lösung.",
    ]);
    expect(text).toMatch(/kein permanentes Monitoring|keine permanente Überwachung/);
  });

  it("derives the hero visual only from the seven confirmed checks, with no simulated live data", () => {
    const doc = loadDoc();
    const visual = doc.querySelector(".wb-hero .wb-visual");
    expect(visual).not.toBeNull();
    expect(visual.getAttribute("aria-hidden")).toBe("true");
    expect(visual.querySelectorAll(".wb-station")).toHaveLength(7);
    const text = clean(visual);
    expect(text).not.toMatch(/\d+[,.]?\d*\s?%|online seit|uptime|live|ms\b|status: ok/i);
  });
});

describe("/website-betreuung three website service plans (vollständiger Umfang)", () => {
  const plans = () => [...loadDoc().querySelectorAll("#pakete .wb-plan")].map(clean);

  it("shows exactly three plans, always labelled 'Website-Service'", () => {
    const names = [...loadDoc().querySelectorAll("#pakete .wb-plan h3")].map(clean);
    expect(names).toEqual([
      "Website-Service Basis",
      "Website-Service Wachstum",
      "Website-Service Premium",
    ]);
  });

  it("shows Basis with 49 € net per month, 30 minutes and no analytics", () => {
    expectAll(plans()[0], ["49 €", "netto pro Monat", "zzgl. USt.", "30 Minuten Änderungskontingent pro Monat", "Keine Analytics-Leistung"]);
    expect(plans()[0]).not.toMatch(/Dashboard|Monatsbericht/);
    expect(clean(loadDoc().querySelectorAll("#pakete .wb-plan-fit")[0])).toBe(
      "Für Unternehmen mit Websites, die selten kleinere Inhaltsänderungen benötigen und regelmäßig technisch geprüft werden sollen."
    );
  });

  it("shows Wachstum with 99 € net per month, 1 hour, analytics setup and dashboard", () => {
    expectAll(plans()[1], ["99 €", "netto pro Monat", "zzgl. USt.", "1 Stunde Änderungskontingent pro Monat", "Einrichtung von Analytics", "Zugang zu einem Analytics-Dashboard"]);
    expect(plans()[1]).not.toMatch(/Monatsbericht/);
  });

  it("shows Premium with 199 € net per month, 2 hours, analytics, dashboard and monthly report", () => {
    expectAll(plans()[2], [
      "199 €",
      "netto pro Monat",
      "zzgl. USt.",
      "2 Stunden Änderungskontingent pro Monat",
      "Einrichtung von Analytics",
      "Zugang zu einem Analytics-Dashboard",
      "Kurzer monatlicher Bericht mit relevanten Kennzahlen, Einordnung und konkreten Handlungsempfehlungen",
    ]);
    expect(clean(loadDoc().querySelectorAll("#pakete .wb-plan-fit")[2])).toBe(
      "Für Unternehmen mit häufigerem Änderungsbedarf, die die Website-Nutzung regelmäßig eingeordnet erhalten möchten."
    );
  });

  it("names the shared scope of all plans visibly next to the plans", () => {
    const text = pageText({ body: loadDoc().querySelector("#pakete .wb-shared") });
    expectAll(text, [
      "In allen drei Paketen enthalten",
      "Technische Wartung einmal monatlich",
      "Betreuung des Hostings im vereinbarten System",
      "Support per E-Mail während üblicher Geschäftszeiten",
    ]);
  });

  it("keeps analytics apart from SEO and success promises", () => {
    const text = sectionText("pakete");
    expect(text).toMatch(/Analytics-System wird projektbezogen ausgewählt/);
    expect(text).toMatch(/Datenschutz-, Consent-, Konfigurations- und Fremdkostenfragen/);
    expect(text).toMatch(/keine laufende SEO-Betreuung und keine Erfolgszusage/);
  });

  it("highlights no plan: no badge, discount, scarcity or extra emphasis", () => {
    const doc = loadDoc();
    const text = pageText(doc);
    // "Handlungsempfehlungen" (Premium report) is briefed wording, so only whole words count.
    expect(text).not.toMatch(/\bbeliebt|bestseller|\bempfohlen|\bEmpfehlung\b|Rabatt|\bsparen\b|nur noch|Angebot endet|limitiert|gratis|kostenlos/i);
    const classes = [...doc.querySelectorAll("#pakete .wb-plan")].map((plan) => plan.className);
    expect(new Set(classes).size).toBe(1);
  });
});

describe("/website-betreuung conditions and change scope", () => {
  it("lists every shared condition visibly, not only in FAQ or footnotes", () => {
    const text = sectionText("konditionen");
    expectAll(text, [
      "drei Monate Mindestlaufzeit",
      "danach monatlich mit einem Monat Frist kündbar",
      "Nicht genutztes Änderungskontingent verfällt am Monatsende",
      "99 € netto pro Stunde zzgl. USt.",
      "15-Minuten-Einheiten",
      "nur nach vorheriger Freigabe",
      "Keine garantierte Reaktions- oder Behebungszeit",
      "Hosting-, Plattform-, Domain-, Lizenz- und sonstige Fremdkosten",
      "projektbezogen vor Beauftragung ausgewiesen",
      "SEO-Leistungen nur bei ausdrücklicher Zusatzvereinbarung",
      "Maßgeblich bleibt das individuelle Angebot beziehungsweise der Vertrag",
    ]);
  });

  it("separates typical small changes from separately calculated projects", () => {
    const doc = loadDoc();
    const inside = pageText({ body: doc.querySelector("#aenderungen .wb-scope-in") });
    const outside = pageText({ body: doc.querySelector("#aenderungen .wb-scope-out") });
    expectAll(inside, [
      "abhängig vom Aufwand",
      "Texte korrigieren",
      "Vorhandene Bilder austauschen",
      "Kontaktangaben oder Öffnungszeiten aktualisieren",
      "Links anpassen",
      "Bestehende Inhalte in kleinerem Umfang aktualisieren",
    ]);
    expectAll(outside, [
      "Separat kalkuliert",
      "Neue Seiten",
      "Neue Formulare oder komplexe Formularlogik",
      "Neue Funktionen",
      "Neue Integrationen",
      "Grundlegende Design- oder Strukturänderungen",
      "Shops, Mitgliederbereiche oder Portale",
      "Umfangreiche Texterstellung",
      "Strategische SEO-Projekte",
      "Akute Wiederherstellung oder Bereinigung nach Sicherheitsvorfällen",
      "Eigenständige Entwicklungsprojekte",
    ]);
    const text = sectionText("aenderungen");
    expectAll(text, [
      "Kleine Aktualisierung oder eigenes Projekt?",
      "Die bestehende Seitenstruktur und Funktion bleiben grundsätzlich erhalten",
      "Der tatsächliche Zeitaufwand entscheidet",
      "Passt eine Anfrage voraussichtlich nicht in das vorhandene Kontingent, erfolgt Mehrarbeit erst nach Ihrer Freigabe.",
    ]);
  });
});

describe("/website-betreuung existing websites, versioning and optionality", () => {
  it("serves TigerFlow websites directly and others only after a technical check", () => {
    const text = sectionText("bestehende-websites");
    expectAll(text, [
      "Betreuung für neue und bestehende Websites",
      "Von TigerFlow erstellte Websites können direkt in einen passenden Service übergehen.",
      "prüfen wir zuerst Technik, Zugänge und bestehenden Zustand",
      "individuelles Angebot",
      "eine Übernahme jedes Systems wird nicht pauschal zugesagt",
      "Komplexe Shops",
      "Portale und individuelle Webanwendungen",
      "Nicht dokumentierte Altsysteme",
      "Systeme ohne notwendige Zugänge",
      "Akute Sicherheitsvorfälle oder Wiederherstellungsprojekte",
      "24/7-Bereitschaft",
    ]);
    const review = pageText({ body: loadDoc().querySelector("#bestehende-websites .wb-review") });
    expect(review).toContain("Nicht automatisch im Standardumfang – auf Anfrage gesondert geprüft und kalkuliert");
    expect(review).toContain("Systeme, deren technische oder rechtliche Risiken TigerFlow nicht vertretbar übernehmen kann");
    const cta = loadDoc().querySelector("#bestehende-websites button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("Website-Projekt einordnen");
  });

  it("places the confirmed regional trust signal unobtrusively in the same section", () => {
    const doc = loadDoc();
    const note = doc.querySelector("#bestehende-websites .wb-region");
    expect(note).not.toBeNull();
    expect(note.tagName).toBe("P");
    expect(clean(note)).toBe(
      "TigerFlow arbeitet aus Heide mit Schwerpunkt Schleswig-Holstein. Geeignete Web- und Betreuungsprojekte können auch deutschlandweit umgesetzt werden."
    );
    expectAll(clean(note), ["Heide", "Schleswig-Holstein", "deutschlandweit"]);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(clean(doc.querySelector("h1"))).toBe(H1);
  });

  it("frames GitHub versioning as history, not as a complete backup", () => {
    const text = sectionText("transparenz");
    expect(text).toContain(
      "Änderungen am Website-Code werden über GitHub nachvollziehbar versioniert. Eine technische Wiederherstellung richtet sich nach dem jeweils vereinbarten System. Klassische oder tägliche Backups, eine vollständige Wiederherstellung aller externen Daten sowie eine Sicherheits- oder Wiederherstellungsgarantie sind nicht pauschal Bestandteil der Servicepakete."
    );
    expect(pageText(loadDoc())).not.toMatch(/GitHub[^.]{0,60}(ist|als|dient als)[^.]{0,20}(vollständiges )?Backup/i);
  });

  it("lists every excluded service visibly", () => {
    const text = pageText({ body: loadDoc().querySelector("#transparenz .wb-excluded") });
    expectAll(text, [
      "Strategische und laufende SEO-Betreuung",
      "Neue Zielseiten oder umfangreiche Content-Erstellung",
      "Neue Funktionen und Integrationen",
      "Grundlegende Redesigns",
      "Formale Barrierefreiheitsprüfung oder Konformitätszusage",
      "Rechtsberatung oder rechtliche Prüfung von Rechtstexten",
      "Pflege von Rechtstexten aufgrund gesetzlicher Änderungen",
      "Klassische oder tägliche Backups ohne gesonderte Vereinbarung",
      "Malware-Bereinigung oder Forensik",
      "Sicherheits-, Verfügbarkeits- oder Wiederherstellungsgarantien",
      "Garantierte Reaktions- oder Behebungszeiten",
      "24/7-Bereitschaft",
      "Hosting-, Plattform-, Domain-, Lizenz- und sonstige Fremdkosten",
      "Betreuung jedes Fremdsystems ohne vorherige technische Prüfung",
    ]);
  });

  it("presents the service plans as optional, without belittling a website without a plan", () => {
    const text = sectionText("optional");
    expectAll(text, [
      "Betreuung ist eine Option – keine Kaufbedingung",
      "Ein monatliches Servicepaket ist keine Voraussetzung für den Kauf einer TigerFlow-Website.",
      "laufende Fremdkosten trägt der Kunde",
      "nur nach separater Anfrage und Vereinbarung",
    ]);
    expect(text).not.toMatch(/unsicher|ungeschützt|unbrauchbar|veraltet|Risiko/i);
    expect(pageText(loadDoc())).not.toMatch(/überwach\w* (wir|TigerFlow) (Ihre Website )?(auch )?ohne/i);
  });
});

const QUESTIONS = [
  "Was ist der Unterschied zwischen Website-Wartung, Pflege und Betreuung?",
  "Was kostet die Website-Betreuung bei TigerFlow?",
  "Was wird einmal monatlich technisch geprüft?",
  "Welche Änderungen zählen zum Kontingent?",
  "Was passiert, wenn das Änderungskontingent nicht ausreicht?",
  "Wird ungenutzte Zeit in den nächsten Monat übertragen?",
  "Wie lange läuft ein Servicepaket?",
  "Ist SEO in der Website-Betreuung enthalten?",
  "Sind Hosting, Domain und andere Fremdkosten enthalten?",
  "Sind Backups und Wiederherstellung enthalten?",
  "Gibt es garantierte Reaktions- oder Behebungszeiten?",
  "Betreut TigerFlow auch Websites anderer Anbieter?",
  "Muss ich beim Websitekauf ein Servicepaket buchen?",
  "Was geschieht bei einer Kündigung?",
];

describe("/website-betreuung FAQ and structured data", () => {
  it("uses native details/summary for all 14 briefed questions, closed by default", () => {
    const entries = [...loadDoc().querySelectorAll("#faq details")];
    expect(entries).toHaveLength(QUESTIONS.length);
    entries.forEach((details, index) => {
      expect(details.hasAttribute("open")).toBe(false);
      expect(clean(details.querySelector("summary"))).toBe(QUESTIONS[index]);
      expect(clean(details.querySelector(".wb-faq-answer")).length).toBeGreaterThan(60);
    });
  });

  it("answers the cancellation question only with the confirmed terms", () => {
    const answer = clean([...loadDoc().querySelectorAll("#faq details")][13].querySelector(".wb-faq-answer"));
    expectAll(answer, ["drei Monate", "monatlich", "einem Monat"]);
    expect(answer).not.toMatch(/Übergabe|Stichtag|Paketwechsel|Daten/);
  });

  it("ships WebPage, BreadcrumbList, Service and a FAQPage identical to the visible FAQ", () => {
    const doc = loadDoc();
    const scripts = [...doc.querySelectorAll('#root script[type="application/ld+json"]')];
    expect(scripts.length).toBeGreaterThan(0);
    const nodes = scripts.flatMap((script) => {
      const data = JSON.parse(script.textContent);
      return data["@graph"] ?? [data];
    });
    const byType = (type) => nodes.filter((node) => node["@type"] === type);

    expect(byType("WebPage")[0].url).toBe(`${SITE_URL}${PATH}`);
    expect(byType("BreadcrumbList")[0].itemListElement.map((item) => item.item)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}${PATH}`,
    ]);
    const service = byType("Service")[0];
    expect(service.name).toBe("Website-Betreuung");
    expect(service.provider.name).toBe("TigerFlow");

    const faq = byType("FAQPage")[0];
    const visible = [...doc.querySelectorAll("#faq details")].map((details) => ({
      q: clean(details.querySelector("summary")),
      a: clean(details.querySelector(".wb-faq-answer")),
    }));
    expect(faq.mainEntity).toHaveLength(14);
    faq.mainEntity.forEach((entry, index) => {
      expect(entry.name).toBe(visible[index].q);
      expect(entry.acceptedAnswer.text).toBe(visible[index].a);
    });

    const serialized = JSON.stringify(nodes);
    for (const key of ["Offer", "aggregateRating", "AggregateRating", "review", "availability", "priceSpecification", "Organization\",\"address"]) {
      expect(serialized).not.toContain(key);
    }
  });
});

describe("/website-betreuung links, closing CTA and claims", () => {
  it("links crawlably to /preise, /webdesign-schleswig-holstein and /seo-heide with descriptive anchors", () => {
    const doc = loadDoc();
    const anchor = (href) =>
      [...doc.querySelectorAll(`main a[href="${href}"]`)].map(clean);
    expect(anchor("/preise")).toContain("Website-Preise und enthaltene Leistungen ansehen");
    expect(anchor("/webdesign-schleswig-holstein")).toContain("Website erstellen oder überarbeiten lassen");
    expect(anchor("/seo-heide")).toContain("SEO-Setup und laufende SEO-Leistungen");
  });

  it("links only to published routes or in-page anchors", () => {
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
  });

  it("closes with headline, text and CTA that match the real project check", () => {
    const text = sectionText("projektanfrage");
    expectAll(text, [
      "Welcher nächste Schritt passt zu Ihrer Website?",
      "Im Projekt-Check ordnen Sie Ihr aktuelles Ziel und Ihre Ausgangslage unverbindlich ein. Ob TigerFlow eine bestehende Fremdwebsite betreuen kann, wird anschließend vor einem Angebot technisch geprüft.",
    ]);
    const cta = loadDoc().querySelector("#projektanfrage button[data-project-check-cta]");
    expect(cta && clean(cta)).toBe("Projekt-Check starten");
    expect(text).not.toMatch(/sofort|innerhalb von \d|ohne Kontaktdaten|freigeschaltet/i);
  });

  // The real project check only classifies website, SEO, inquiries and automation.
  it("never claims the project check selects a care plan or runs the technical check", () => {
    const blocks = [...loadDoc().querySelectorAll("main p, main small, main li")].map(clean);
    const sentences = blocks.flatMap((block) => block.split(/(?<=[.?!])\s+/));
    expect(sentences.some((s) => /Projekt-Check/.test(s))).toBe(true);
    for (const sentence of sentences.filter((s) => /Projekt-Check/.test(s))) {
      expect(sentence, sentence).not.toMatch(/Paket|Servicepaket|gewünschten Service|Betreuung\w* (aus)?wählen|technisch(e)? (Prüfung|geprüft|prüf)(?![^.]*anschließend)/i);
    }
    const labels = [...loadDoc().querySelectorAll("button[data-project-check-cta]")].map(clean);
    for (const label of labels) {
      expect(label).not.toMatch(/prüfen lassen|Betreuung (unverbindlich )?anfragen|Paket/i);
    }
  });

  // Claim words are allowed only in negated sentences, questions or explicit exclusion lists.
  it("makes no uptime, security, response, backup, unlimited, WordPress or SEO promise", () => {
    const doc = loadDoc();
    const claim =
      /garantie|garantier|24\/7|täglich|unbegrenzt|uptime|verfügbarkeit|sofortig|notdienst|wordpress|plugin|immer sicher|lückenlos|permanent/i;
    const negation = /\b(kein|keine|keinen|keiner|keinem|nicht|weder|nie|ohne)\b/i;
    const blocks = doc.querySelectorAll("main p, main li, main summary, main dd, main dt, main h2, main h3, main small");
    for (const block of blocks) {
      if (block.closest("[data-wb-negative]") || block.closest("[aria-hidden='true']")) continue;
      for (const sentence of clean(block).split(/(?<=[.?!])\s+/)) {
        if (!claim.test(sentence)) continue;
        expect(sentence.trim().endsWith("?") || negation.test(sentence), sentence).toBe(true);
      }
    }
    const text = pageText(doc);
    expect(text).not.toMatch(
      /rundum-sorglos|sorglos|nie wieder|99[,.]9|garantierte Erreichbarkeit|sofortige Fehlerbehebung|Malware-Bereinigung inklusive|vollständige Wiederherstellung garantiert|alles inklusive|SEO inklusive|Fair Use|rechtssicher|vollständig barrierefrei|für jedes System geeignet|keine laufenden Fremdkosten|mehr Kunden|mehr Umsatz/i
    );
    expect(text).not.toMatch(/Fallstudie|Kundenstimme|Bewertungen|Referenzkunden|zufriedene Kunden|★/i);
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/\d+\s*(Tage|Tagen|Wochen|Werktage|Stunden Reaktionszeit)\b/);
  });

  it("keeps the heading hierarchy without skipped levels and offers a skip link", () => {
    const doc = loadDoc();
    const levels = [...doc.querySelectorAll("#root h1,#root h2,#root h3,#root h4")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
    const skip = doc.querySelector('.wb-page > a.wb-skip[href="#inhalt"]');
    expect(skip).not.toBeNull();
    expect(doc.querySelectorAll(".wb-page > header")).toHaveLength(1);
  });
});

describe("/website-betreuung stylesheet invariants", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/WebsiteBetreuungPage.css"), "utf8");

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

  const hoverMedia = /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)\s*\{/;
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

  it("styles the page only in its own wb- namespace, without global selectors", () => {
    expect(css).toMatch(/\.wb-page\b/);
    expect(css).not.toMatch(/\.(wdh|wdd|wsh|sh|pr)-/);
    // Every rule outside at-rule preludes starts with a wb- scoped selector.
    const selectors = [...css.replace(/\/\*[^]*?\*\//g, "").matchAll(/(?:^|})\s*([^{}@]+)\{/g)]
      .map((m) => m[1].trim())
      .filter((s) => s && !/^(from|to|\d+%)/.test(s));
    for (const group of selectors) {
      for (const selector of group.split(",")) {
        expect(selector.trim(), selector).toMatch(/^(html:has\(\.wb-page\)|\.wb-|\[data-wb-)/);
      }
    }
  });

  it("shows a visible focus indicator for links, buttons and summaries", () => {
    expect(css).toMatch(/\.wb-page a:focus-visible/);
    expect(css).toMatch(/\.wb-page button:focus-visible/);
    expect(css).toMatch(/\.wb-page summary:focus-visible/);
    expect(css).toMatch(/:focus-visible[^}]*outline:\s*2px solid #FF7A00/);
  });

  it("gates every hover rule behind (hover: hover) and (pointer: fine)", () => {
    expect(css).toMatch(hoverMedia);
    expect(stripBlocks(css, hoverMedia)).not.toMatch(/:hover/);
  });

  it("honours prefers-reduced-motion by removing animation, transition and reveal offsets", () => {
    const body = blocks(css, /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/).join("\n");
    expect(body).toMatch(/animation:\s*none\s*!important/);
    expect(body).toMatch(/transition:\s*none\s*!important/);
    expect(body).toMatch(/\.wb-reveal-pending/);
  });

  it("never uses transition: all, infinite loops, scale(0) or bare ease-in", () => {
    expect(css).not.toMatch(/transition(-property)?\s*:\s*all\b/);
    expect(css).not.toMatch(/\binfinite\b/);
    expect(css).not.toMatch(/scale[XYZ3d]*\(\s*0\s*[,)]/);
    expect(css).not.toMatch(/\bease-in\b(?!-out)/);
  });

  it("moves things with transform and opacity only, with short UI transitions", () => {
    for (const frames of blocks(css, /@keyframes\s+[\w-]+\s*\{/)) {
      for (const [, property] of frames.matchAll(/([a-z-]+)\s*:/g)) {
        expect(["transform", "opacity"], property).toContain(property);
      }
    }
    for (const [, value] of css.matchAll(/transition\s*:\s*([^;}]+)/g)) {
      const props = value.split(/,(?![^(]*\))/).map((part) => part.trim().split(/\s+/)[0]);
      for (const property of props) {
        expect(["transform", "opacity", "color", "background-color", "border-color", "none"], property).toContain(property);
      }
      for (const [, amount, unit] of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        expect(unit === "s" ? Number(amount) * 1000 : Number(amount), value).toBeLessThanOrEqual(300);
      }
    }
  });

  it("gives pressable elements instant press feedback", () => {
    expect(css).toMatch(/\.wb-btn:active\s*\{[^}]*scale\(\.9[5-8]\)/);
  });

  it("uses backdrop-filter only inside @supports on top of a solid readable background", () => {
    const outsideSupports = stripBlocks(css, /@supports[^{]*\{/).replace(/@supports[^{]*\{\s*\}/g, "");
    expect(outsideSupports).not.toMatch(/backdrop-filter/);
    expect(css).toMatch(/\.wb-glass\s*\{[^}]*background:\s*#[0-9A-Fa-f]{6}\b/);
  });

  it("falls back for reduced transparency, high contrast and forced colours", () => {
    const supports = blocks(css, /@supports[^{]*backdrop-filter[^{]*\{/).join("\n");
    expect(supports).toMatch(/prefers-reduced-transparency:\s*reduce/);
    expect(css).toMatch(/@media\s*\(\s*prefers-contrast\s*:\s*more\s*\)/);
    const forced = blocks(css, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/).join("\n");
    expect(forced).toMatch(/CanvasText|ButtonText|Highlight/);
  });

  it("keeps text readable: every hex text colour reaches 4.5:1 on the darkest panel", () => {
    const colours = [...css.matchAll(/(?<![-\w])color\s*:\s*(#[0-9A-Fa-f]{3,6})\b/g)].map((m) => m[1].toUpperCase());
    expect(colours.length).toBeGreaterThan(5);
    for (const colour of new Set(colours)) {
      if (colour === "#111" || colour === "#111111") continue;
      expect(contrast(colour, "#0A0A0A"), colour).toBeGreaterThanOrEqual(4.5);
    }
    expect(css).toMatch(/\.wb-btn\s*\{[^}]*background:\s*#FF7A00;[^}]*color:\s*#111111/);
  });

  it("is built for 320 px without hiding page-level overflow and offers 44 px touch targets", () => {
    expect(css).not.toMatch(/overflow-x:\s*(?:clip|hidden)/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*760px\s*\)/);
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*420px\s*\)/);
    expect(css).toMatch(/\.wb-btn\s*\{[^}]*min-height:\s*(4[4-9]|[5-9]\d)px/);
    expect(css).not.toMatch(/(?<![-\w])min-width\s*:\s*(3[2-9]\d|[4-9]\d\d|\d{4,})px/);
  });

  it("stacks plans, layers, scope panels and conditions in one column on mobile", () => {
    const mobile = blocks(css, /@media\s*\(\s*max-width\s*:\s*760px\s*\)\s*\{/).join("\n");
    for (const selector of [".wb-plans", ".wb-layers", ".wb-scope", ".wb-terms", ".wb-origin"]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(mobile, selector).toMatch(new RegExp(`${escaped}[^{]*\\{[^}]*grid-template-columns:\\s*minmax\\(0,\\s*1fr\\)`));
    }
  });
});

describe("/website-betreuung inbound links", () => {
  it("is linked crawlably as 'Website-Betreuung' from the shared service menu", () => {
    for (const file of [
      "index.html",
      "webdesign-heide.html",
      "webdesign-dithmarschen.html",
      "webdesign-schleswig-holstein.html",
      "seo-heide.html",
      "preise.html",
      OUT_FILE,
    ]) {
      const links = loadDoc(file).querySelectorAll(`.tf-service-menu a[href="${PATH}"]`);
      expect(links, file).toHaveLength(1);
      expect(clean(links[0])).toBe("Website-Betreuung");
    }
    const current = loadDoc().querySelector(`.tf-service-menu a[href="${PATH}"]`);
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(loadDoc("preise.html").querySelector(`.tf-service-menu a[href="${PATH}"]`).hasAttribute("aria-current")).toBe(false);
  });

  it("is linked from the care section of /preise with the descriptive anchor", () => {
    const link = loadDoc("preise.html").querySelector(`#betreuung a[href="${PATH}"]`);
    expect(link && clean(link)).toBe("Website-Betreuung und Wartungsumfang ansehen");
  });

  it("gets no new inbound links from the regional money pages' content or the homepage service cards", () => {
    for (const file of ["index.html", "webdesign-heide.html", "webdesign-dithmarschen.html", "webdesign-schleswig-holstein.html", "seo-heide.html"]) {
      const all = [...loadDoc(file).querySelectorAll(`a[href="${PATH}"]`)];
      expect(all.every((a) => a.closest(".tf-service-menu")), file).toBe(true);
    }
  });
});

describe("/website-betreuung service menu target sizes (page-local)", () => {
  const css = readFileSync(path.join(process.cwd(), "src/components/WebsiteBetreuungPage.css"), "utf8");
  const menuCss = readFileSync(path.join(process.cwd(), "src/components/ServiceMegaMenu.css"), "utf8");

  it("raises summary, group links and the footer button to 44 px, scoped under .wb-page and outside media queries", () => {
    const top = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
    for (const selector of [
      ".wb-page .tf-service-menu > summary",
      ".wb-page .tf-service-groups section > a",
      ".wb-page .tf-service-footer > button",
    ]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
      expect(top, selector).toMatch(new RegExp(`${escaped}[^{]*\\{[^}]*min-height:\\s*44px`));
    }
  });

  it("does not use pseudo-element hit areas for the menu targets", () => {
    expect(css).not.toMatch(/\.tf-service[^{]*::?(before|after)/);
  });

  it("leaves the shared ServiceMegaMenu.css untouched", () => {
    expect(menuCss).toMatch(/min-height:33px/);
    expect(menuCss).not.toMatch(/wb-/);
  });
});
