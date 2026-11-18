import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";
import { ROUTES, SITE_URL } from "../src/routes.config.js";
import { ROUTE_PAGES } from "../src/routePages.js";

const PATH = "/ueber-uns";
const OUT_FILE = "ueber-uns.html";

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
const source = (file) => readFileSync(path.join(process.cwd(), "src/components", file), "utf8");
const mainText = () => clean(loadDoc().querySelector("main"));
const rawHtml = () => readFileSync(path.join(DIST_DIR, OUT_FILE), "utf8");

describe("/ueber-uns route, metadata and rendering", () => {
  const route = ROUTES.find((r) => r.path === PATH);

  it("is registered with the approved metadata in all three layers", () => {
    expect(route).toEqual({
      path: PATH,
      outFile: OUT_FILE,
      title: "Über TigerFlow | Webdesign, SEO & KI aus Heide",
      description:
        "Lernen Sie TigerFlow und Inhaber Jafar Hamzeh kennen: Webdesign, SEO und KI-Automatisierung aus Heide – klar geplant und passend zum Bedarf.",
      ogTitle: "Über TigerFlow",
      ogDescription:
        "Wer hinter TigerFlow steht, wie wir arbeiten und wie Webdesign, SEO und Automatisierung sinnvoll zusammenspielen.",
      ogImage: "/og/ueber-uns.png",
      changefreq: "yearly",
      priority: "0.6",
    });
    expect(ROUTE_PAGES[PATH].source).toBe("src/components/UeberUnsPage.jsx");
    const server = readFileSync(path.join(process.cwd(), "src/entry-server.jsx"), "utf8");
    expect(server).toContain('"/ueber-uns": UeberUnsPage');
    expect(source("UeberUnsPage.jsx")).not.toMatch(/React\.lazy|Suspense/);
  });

  it("ships its own 1200x630 share image instead of the homepage card", () => {
    const file = path.join(DIST_DIR, "og", "ueber-uns.png");
    expect(existsSync(file)).toBe(true);
    const png = readFileSync(file);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(png.equals(readFileSync(path.join(DIST_DIR, "og", "home.png")))).toBe(false);
  });

  it("builds a prerendered file with canonical, robots and social metadata", () => {
    expect(existsSync(path.join(DIST_DIR, OUT_FILE))).toBe(true);
    const doc = loadDoc();
    expect(doc.title).toBe(route.title);
    expect(doc.querySelector('meta[name="description"]').getAttribute("content")).toBe(route.description);
    expect(doc.querySelector('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE_URL}${PATH}`);
    expect(doc.querySelector('meta[name="robots"]').getAttribute("content")).toBe("index, follow");
    expect(doc.querySelector('meta[property="og:title"]').getAttribute("content")).toBe("Über TigerFlow");
    expect(doc.querySelector('meta[property="og:description"]').getAttribute("content")).toBe(route.ogDescription);
    expect(doc.querySelector('meta[property="og:url"]').getAttribute("content")).toBe(`${SITE_URL}${PATH}`);
    expect(doc.querySelector('meta[property="og:image"]').getAttribute("content")).toContain("/og/ueber-uns.png");
    expect(doc.querySelector('meta[name="twitter:card"]')).not.toBeNull();
  });

  it("ships complete initial HTML with one H1, one banner, one main and a skip link", () => {
    const doc = loadDoc();
    expect(doc.querySelector("#root .au-page")).not.toBeNull();
    expect(texts("h1")).toEqual(["Webdesign, SEO und KI-Automatisierung aus Heide."]);
    expect(all("header")).toHaveLength(1);
    expect(all("main")).toHaveLength(1);
    expect(doc.querySelector(".au-skip").getAttribute("href")).toBe("#inhalt");
    expect(doc.getElementById("inhalt")).toBe(doc.querySelector("main"));
  });

  it("ships no hidden reveal state in the initial HTML", () => {
    expect(rawHtml()).not.toContain("au-reveal-pending");
  });
});

describe("/ueber-uns content structure", () => {
  it("uses the approved section order", () => {
    expect(all("main > section[id]").map((s) => s.id)).toEqual([
      "unternehmen", "ansatz", "system", "arbeitsweise", "grundsaetze",
      "region", "founder", "leistungen", "projektanfrage",
    ]);
    expect(loadDoc().querySelector("main > section.au-hero")).not.toBeNull();
  });

  it("has no FAQ section and no FAQ markup", () => {
    expect(loadDoc().getElementById("faq")).toBeNull();
    expect(loadDoc().querySelector("main details")).toBeNull();
    expect(rawHtml()).not.toContain("FAQPage");
  });

  it("renders the approved hero copy and actions", () => {
    const hero = loadDoc().querySelector(".au-hero");
    const text = clean(hero);
    expect(text).toContain("ÜBER TIGERFLOW");
    expect(text).toContain(
      "TigerFlow entwickelt digitale Grundlagen und Prozesse für Unternehmen: von der Website über organische Sichtbarkeit bis zur strukturierten Bearbeitung von Anfragen."
    );
    expect(text).toContain(
      "Hinter TigerFlow steht Jafar Hamzeh. Der regionale Schwerpunkt liegt auf Heide, Dithmarschen und Schleswig-Holstein. Spezialisierte Projekte setzen wir auch deutschlandweit um."
    );
    const cta = hero.querySelector("button[data-project-check-cta]");
    expect(clean(cta)).toBe("Projekt unverbindlich einordnen");
    const jump = [...hero.querySelectorAll("a")].find((a) => clean(a) === "Leistungen ansehen");
    expect(jump.getAttribute("href")).toBe("#leistungen");
  });

  it("uses the approved H2 headings", () => {
    expect(texts("main h2")).toEqual([
      "Eine klare Verantwortung statt anonymer Agenturkulisse.",
      "Eine Website ist der Anfang – nicht der gesamte Prozess.",
      "Drei Bausteine, abgestimmt auf den tatsächlichen Bedarf.",
      "Vom Bedarf bis zur freigegebenen Lösung.",
      "Klarer Umfang, ehrliche Aussagen und nachvollziehbare Entscheidungen.",
      "Regional verwurzelt, digital projektfähig.",
      "Jafar Hamzeh",
      "Wo möchten Sie beginnen?",
      "Welcher Einstieg passt zu Ihrem Vorhaben?",
    ]);
  });

  it("states the confirmed facts about the company", () => {
    const text = clean(section("unternehmen"));
    expect(text).toContain("TigerFlow ist das Einzelunternehmen von Jafar Hamzeh mit Sitz in Heide.");
    for (const fact of [
      "Inhaber Jafar Hamzeh",
      "Sitz Heide, Schleswig-Holstein",
      "Schwerpunkt Webdesign, SEO und KI-Automatisierung",
      "Projektgebiet regional und bei passenden Projekten deutschlandweit",
    ]) {
      expect(text.replace(/:/g, "")).toContain(fact);
    }
    expect(section("unternehmen").querySelector("dl")).not.toBeNull();
  });

  it("explains the approach and the leading sentence", () => {
    const text = clean(section("ansatz"));
    expect(text).toContain("Erst die digitale Grundlage. Dann Sichtbarkeit. Danach die passenden nächsten Schritte.");
    expect(text).toContain("Die Bereiche werden dort verbunden, wo die Verbindung für das Unternehmen sinnvoll und wirtschaftlich nachvollziehbar ist.");
  });

  it("renders the three building blocks as readable text with the approved links", () => {
    const sys = section("system");
    expect(texts("h3", )).toContain("Website");
    expect([...sys.querySelectorAll("h3")].map(clean)).toEqual([
      "Website", "Sichtbarkeit", "Prozesse und Automatisierung",
    ]);
    const hrefs = [...sys.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/webdesign-heide", "/seo-schleswig-holstein", "/seo-betreuung"]);
    expect(clean(sys)).toContain("Funktionen, Integrationen und laufender Betrieb werden immer projektbezogen abgegrenzt.");
    const check = sys.querySelector("button[data-project-check-cta]");
    expect(clean(check)).toBe("Projekt prüfen lassen");
  });

  it("lists the four working steps in an ordered list without time or reaction promises", () => {
    const steps = [...section("arbeitsweise").querySelectorAll("ol > li h3")].map(clean);
    expect(steps).toEqual([
      "Bedarf verstehen", "Umfang festlegen", "Umsetzen und prüfen", "Freigeben und weiterentwickeln",
    ]);
    expect(clean(section("arbeitsweise"))).not.toMatch(/\b(Stunden|Tage|Wochen|Werktage|Reaktionszeit garantiert)\b/);
  });

  it("lists the four principles", () => {
    expect([...section("grundsaetze").querySelectorAll("h3")].map(clean)).toEqual([
      "Bedarf vor Technologie", "Klare Leistungsgrenzen",
      "Prüfung vor Veröffentlichung", "Keine künstlichen Erfolgsversprechen",
    ]);
  });

  it("names Heide as the only seat and links the regional pages", () => {
    const region = section("region");
    const text = clean(region);
    expect(text).toContain("TigerFlow sitzt in Heide");
    expect(text).toContain("Spezialisierte Web-, SEO- und KI-Projekte können auch deutschlandweit umgesetzt werden.");
    expect(text).not.toMatch(/Niederlassung|Standorte|Büros/);
    const hrefs = [...region.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/webdesign-heide", "/seo-heide", "/webdesign-schleswig-holstein", "/seo-schleswig-holstein"]);
  });

  it("presents the founder with role, statement and no portrait", () => {
    const founder = section("founder");
    const text = clean(founder);
    expect(text).toContain("Founder & CEO · TigerFlow");
    expect(text).toContain("Jafar Hamzeh ist Founder & CEO von TigerFlow und Inhaber des dahinterstehenden Einzelunternehmens.");
    expect(text).toContain(
      "Ich möchte digitale Lösungen so planen, dass Unternehmen verstehen, was sie erhalten, warum es sinnvoll ist und welcher nächste Schritt wirklich gebraucht wird."
    );
    expect(text).not.toContain("biografische Angaben");
    expect(text).not.toContain("Qualifikationen");
    for (const img of founder.querySelectorAll("img")) {
      expect(img.getAttribute("alt")).toBe("");
      expect(img.getAttribute("src")).toBe("/tigerflow-mark.png");
    }
  });

  it("links the five service paths with descriptive anchors and Webdesign first", () => {
    const links = [...section("leistungen").querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/webdesign-heide", "/webdesign-schleswig-holstein", "/seo-schleswig-holstein", "/seo-betreuung", "/preise",
    ]);
    const labels = links.map((a) => clean(a));
    expect(labels.some((l) => /Mehr erfahren/i.test(l))).toBe(false);
    expect(labels[0]).toContain("Webdesign in Heide");
    expect(labels[4]).toContain("Preise und Leistungsumfang");
  });

  it("closes with the project check, e-mail and the trust note", () => {
    const final = section("projektanfrage");
    const text = clean(final);
    expect(clean(final.querySelector("button[data-project-check-cta]"))).toBe("Projekt-Check starten");
    expect(final.querySelector('a[href="mailto:service@tigerflow.de"]')).not.toBeNull();
    expect(text).toContain("Unverbindliche erste Einordnung. Keine automatische Beauftragung.");
  });

  it("contains no unverified claims, numbers or proof elements", () => {
    const text = mainText();
    for (const forbidden of [
      /führende Agentur/i, /preisgekrönt/i, /Expertenteam/i, /zertifiziert/i, /Zertifikat/i,
      /Kundenlogo/i, /Testimonial/i, /Fallstudie/i, /Platz 1/i, /garantiert mehr/i,
      /mehrjährige Erfahrung/i, /zufriedene Kunden/i, /gegründet/i, /seit \d{4}/i,
      /\d+\s*%/, /\d+\+/,
    ]) {
      expect(text).not.toMatch(forbidden);
    }
    expect(loadDoc().querySelectorAll("main video")).toHaveLength(1);
  });

  it("only links to published routes, existing anchors and the confirmed e-mail", () => {
    const known = new Set(ROUTES.map((r) => r.path));
    for (const a of all("main a[href]")) {
      const href = a.getAttribute("href");
      if (href.startsWith("#")) expect(loadDoc().getElementById(href.slice(1)), href).not.toBeNull();
      else if (href.startsWith("mailto:")) expect(href).toBe("mailto:service@tigerflow.de");
      else expect(known.has(href), href).toBe(true);
    }
    expect(all("main a[href^='http']")).toHaveLength(0);
  });
});

describe("/ueber-uns discoverability and protected pages", () => {
  const PAGES = [
    "index.html", "webdesign-heide.html", "webdesign-dithmarschen.html",
    "webdesign-schleswig-holstein.html", "seo-heide.html", "seo-schleswig-holstein.html",
    "seo-betreuung.html", "preise.html", "website-betreuung.html", OUT_FILE,
    "impressum.html", "datenschutz.html", "agb.html",
  ];

  it("offers a crawlable 'Über TigerFlow' utility link in every shared service menu", () => {
    for (const file of PAGES) {
      const link = loadDoc(file).querySelector(`.tf-service-menu a[href="${PATH}"]`);
      expect(link, file).not.toBeNull();
      expect(clean(link), file).toBe("Über TigerFlow");
    }
    const current = loadDoc().querySelector(`.tf-service-menu a[href="${PATH}"]`);
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("does not file the about page under any service group", () => {
    for (const group of all(".tf-service-groups", "index.html")) {
      expect(group.querySelector(`a[href="${PATH}"]`)).toBeNull();
    }
  });

  it("adds 'Über uns' to the desktop main navigation of the homepage and legal pages", () => {
    for (const file of ["index.html", "impressum.html", "datenschutz.html", "agb.html"]) {
      const link = loadDoc(file).querySelector(`.tf-main-nav > a[href="${PATH}"]`);
      expect(link, file).not.toBeNull();
      expect(clean(link)).toBe("Über uns");
    }
  });

  it("marks 'Über uns' as the current page in the about page navigation", () => {
    const current = loadDoc().querySelector(`header nav > a[href="${PATH}"]`);
    expect(clean(current)).toBe("Über uns");
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("links 'Über uns' in every footer, before the legal links", () => {
    for (const file of PAGES) {
      const hrefs = [...loadDoc(file).querySelectorAll("footer a")].map((a) => a.getAttribute("href"));
      expect(hrefs, file).toContain(PATH);
      expect(hrefs.indexOf(PATH), file).toBeLessThan(hrefs.indexOf("/impressum"));
      const link = loadDoc(file).querySelector(`footer a[href="${PATH}"]`);
      expect(clean(link)).toBe("Über uns");
    }
  });

  it("leaves the homepage and /webdesign-heide untouched outside shared navigation and footer", () => {
    for (const file of ["index.html", "webdesign-heide.html"]) {
      const doc = new JSDOM(readFileSync(path.join(DIST_DIR, file), "utf8")).window.document;
      doc.querySelectorAll(".tf-service-menu, .tf-main-nav, .tf-sticky-bar, footer").forEach((n) => n.remove());
      expect(doc.querySelector(`a[href="${PATH}"]`), file).toBeNull();
    }
    expect(clean(loadDoc("index.html").querySelector("h1"))).toBe("Wir bauen");
    const heide = ROUTES.find((r) => r.path === "/webdesign-heide");
    expect(loadDoc("webdesign-heide.html").title).toBe(heide.title);
  });
});

describe("/ueber-uns structured data", () => {
  const scripts = () => all('script[type="application/ld+json"]');
  const graph = () => JSON.parse(scripts()[0].textContent)["@graph"];
  const byType = (type) => graph().find((n) => n["@type"] === type);

  it("ships exactly one page-local JSON-LD script with valid JSON and no raw '<'", () => {
    expect(scripts()).toHaveLength(1);
    expect(() => JSON.parse(scripts()[0].textContent)).not.toThrow();
    expect(scripts()[0].textContent).not.toContain("<");
  });

  it("describes the page as an AboutPage that belongs to the TigerFlow website", () => {
    const page = byType("AboutPage");
    const route = ROUTES.find((r) => r.path === PATH);
    expect(page).toMatchObject({
      "@id": `${SITE_URL}${PATH}#webpage`,
      url: `${SITE_URL}${PATH}`,
      name: route.title,
      description: route.description,
      inLanguage: "de-DE",
      isPartOf: { "@type": "WebSite", name: "TigerFlow", url: `${SITE_URL}/` },
    });
    expect(page.mainEntity).toEqual({ "@id": byType("Organization")["@id"] });
  });

  it("uses only confirmed organization data", () => {
    const org = byType("Organization");
    expect(org).toMatchObject({
      name: "TigerFlow",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/tigerflow-mark.png`,
      email: "service@tigerflow.de",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rendsburger Straße 22",
        postalCode: "25746",
        addressLocality: "Heide",
        addressCountry: "DE",
      },
    });
  });

  it("links Jafar Hamzeh as founder with the approved job title and nothing else", () => {
    const person = byType("Person");
    expect(person).toEqual({
      "@type": "Person",
      "@id": `${SITE_URL}${PATH}#founder`,
      name: "Jafar Hamzeh",
      jobTitle: "Founder & CEO",
      worksFor: { "@id": byType("Organization")["@id"] },
    });
    expect(byType("Organization").founder).toEqual({ "@id": person["@id"] });
  });

  it("contains no unconfirmed fields", () => {
    const serialized = scripts()[0].textContent;
    for (const key of [
      "foundingDate", "numberOfEmployees", "award", "aggregateRating", "review", "rating",
      "sameAs", "hasCredential", "alumniOf", "knowsAbout", "makesOffer", "FAQPage", "ProfilePage",
    ]) {
      expect(serialized, key).not.toContain(key);
    }
  });
});

describe("/ueber-uns stylesheet", () => {
  const css = () => source("UeberUnsPage.css");
  // Returns the body of the first block that starts with the given prefix (brace matched).
  const block = (prefix) => {
    const text = css();
    const start = text.indexOf(prefix);
    if (start < 0) return "";
    let depth = 0;
    for (let i = text.indexOf("{", start); i < text.length; i += 1) {
      if (text[i] === "{") depth += 1;
      if (text[i] === "}" && --depth === 0) return text.slice(text.indexOf("{", start) + 1, i);
    }
    return "";
  };
  const blocks = (prefix) => {
    const text = css();
    const out = [];
    let from = 0;
    while (text.indexOf(prefix, from) >= 0) {
      const start = text.indexOf(prefix, from);
      const open = text.indexOf("{", start);
      let depth = 0;
      let i = open;
      for (; i < text.length; i += 1) {
        if (text[i] === "{") depth += 1;
        if (text[i] === "}" && --depth === 0) break;
      }
      out.push(text.slice(open + 1, i));
      from = i;
    }
    return out;
  };
  const withoutComments = () => css().replace(/\/\*[\s\S]*?\*\//g, "");

  it("scopes every class selector to the au- namespace", () => {
    const selectors = withoutComments().replace(/\{[^{}]*\}/g, "{}").replace(/\{[^{}]*\}/g, "{}");
    const classes = [...selectors.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]);
    expect(classes.length).toBeGreaterThan(40);
    for (const name of classes) expect(name.startsWith("au-"), name).toBe(true);
    expect(css()).toContain(".au-page");
  });

  it("loads nothing external and imports nothing", () => {
    expect(css()).not.toMatch(/@import|url\(\s*["']?https?:|\/\/fonts\./);
    const jsx = source("UeberUnsPage.jsx");
    expect(jsx).not.toMatch(/<(img|script|link)[^>]+(src|href)="https?:/);
    expect(jsx).not.toMatch(/<iframe|<audio/);
  });

  it("avoids transition: all, scale(0), page-wide overflow hiding and layout animation", () => {
    const text = withoutComments();
    expect(text).not.toMatch(/transition\s*:\s*all/);
    expect(text).not.toMatch(/scale\(\s*0\s*\)/);
    expect(text).not.toMatch(/(^|\})\s*(html|body|\.au-page)\s*\{[^}]*overflow(-x)?\s*:\s*(hidden|clip)/);
    for (const decl of text.match(/transition(-property)?\s*:[^;]+;/g) ?? []) {
      expect(decl).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding)\b/);
    }
  });

  it("animates only opacity and transform in keyframes", () => {
    const frames = blocks("@keyframes");
    expect(frames.length).toBeGreaterThan(1);
    for (const frame of frames) {
      const props = [...frame.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      for (const prop of props) expect(["opacity", "transform"], prop).toContain(prop);
    }
  });

  it("provides reduced-motion, contrast and forced-colors fallbacks", () => {
    const reduced = block("@media (prefers-reduced-motion: reduce)");
    expect(reduced).toMatch(/animation\s*:\s*none/);
    expect(reduced).toMatch(/transition\s*:\s*none|transition-duration/);
    expect(reduced).toContain("au-reveal-pending");
    expect(css()).toContain("@media (prefers-contrast: more)");
    expect(css()).toContain("@media (forced-colors: active)");
    if (css().includes("backdrop-filter")) {
      expect(css()).toContain("@media (prefers-reduced-transparency: reduce)");
    }
  });

  it("keeps hover effects behind a fine hover pointer and shows visible focus", () => {
    const gated = block("@media (hover: hover) and (pointer: fine)");
    expect(gated).toContain(":hover");
    const rest = withoutComments().replace(gated.replace(/\/\*[\s\S]*?\*\//g, ""), "");
    expect(rest).not.toContain(":hover");
    expect(css()).toMatch(/\.au-page [^{]*:focus-visible[^{]*\{[^}]*outline:\s*2px solid/);
  });

  it("only reveals content through the JS-set pending class", () => {
    expect(css()).toContain(".au-reveal-pending");
    expect(css()).not.toMatch(/\.au-(hero|page|section)[^{]*\{[^}]*opacity:\s*0\s*[;}]/);
  });

  it("keeps long words inside the 320 px layout", () => {
    expect(css()).toMatch(/overflow-wrap:\s*anywhere/);
    expect(css()).toContain("@media (max-width: 420px)");
  });
});

describe("/ueber-uns provisional effects: structure", () => {
  it("splits the H1 into words without changing its text (effect 3)", () => {
    const words = all(".au-hero h1 .au-word").map(clean);
    expect(words).toEqual(["Webdesign,", "SEO", "und", "KI-Automatisierung", "aus", "Heide."]);
    expect(texts("h1")).toEqual(["Webdesign, SEO und KI-Automatisierung aus Heide."]);
  });

  it("provides a decorative hero glow that is hidden from assistive tech (effect 4)", () => {
    const glow = loadDoc().querySelector(".au-hero > .au-hero-glow");
    expect(glow.getAttribute("aria-hidden")).toBe("true");
    expect(glow.textContent).toBe("");
  });

  it("reveals the fact sheet as its own block with staggered rows (effect 5)", () => {
    const facts = loadDoc().querySelector("dl.au-facts");
    expect(facts.hasAttribute("data-au-reveal")).toBe(true);
    expect([...facts.children].map((row) => row.style.getPropertyValue("--au-i"))).toEqual(["0", "1", "2", "3"]);
  });

  it("writes the leading sentence as three lines and the statement as phrases (effects 6, 13)", () => {
    expect(all(".au-pullquote .au-quote-line").map(clean)).toEqual([
      "Erst die digitale Grundlage.", "Dann Sichtbarkeit.", "Danach die passenden nächsten Schritte.",
    ]);
    expect(all(".au-statement .au-phrase")).toHaveLength(4);
    expect(clean(loadDoc().querySelector(".au-statement"))).toBe(
      "Ich möchte digitale Lösungen so planen, dass Unternehmen verstehen, was sie erhalten, warum es sinnvoll ist und welcher nächste Schritt wirklich gebraucht wird."
    );
  });
});

describe("/ueber-uns provisional effects: stylesheet", () => {
  const css = () => source("UeberUnsPage.css");
  it("defines the effect keyframes and hooks for all fifteen effects", () => {
    for (const token of [
      ".au-word", ".au-hero-glow", ".au-facts.au-reveal-pending",
      ".au-pullquote.au-reveal-pending", "@keyframes au-ring-once", "--au-progress", ".au-scrollspy",
      ".au-flow:hover", ".au-principles li::before", ".au-region-links li:hover", ".au-signature::before",
      ".au-statement.au-reveal-pending", ".au-path::before", "@keyframes au-breathe", "@keyframes au-lift",
      "--au-px", "--au-mx",
    ]) expect(css(), token).toContain(token);
  });
  it("lets effects run once and never keep a forwards transform on pressable elements", () => {
    expect(css()).not.toMatch(/\.au-btn[^{]*\{[^}]*animation[^}]*forwards/);
    expect(css()).not.toMatch(/animation:[^;]*infinite/);
  });
});

describe("/ueber-uns hero video", () => {
  const video = () => loadDoc().querySelector(".au-hero .au-visual video");

  it("sits on the right side of the hero as a silent, non-looping, self-hosted film", () => {
    expect(video()).not.toBeNull();
    const el = video();
    expect(el.hasAttribute("muted")).toBe(true);
    expect(el.hasAttribute("playsinline")).toBe(true);
    expect(el.hasAttribute("autoplay")).toBe(false);
    expect(el.hasAttribute("loop")).toBe(false);
    expect(el.hasAttribute("controls")).toBe(false);
    expect(el.getAttribute("preload")).toBe("auto");
    expect(el.getAttribute("poster")).toBe("/video/tigerflow-ueber-uns-poster.jpg");
    expect([...el.querySelectorAll("source")].map((s) => [s.getAttribute("src"), s.getAttribute("type")])).toEqual([
      ["/video/tigerflow-ueber-uns.mp4", "video/mp4"],
      ["/video/tigerflow-ueber-uns.webm", "video/webm"],
    ]);
    expect(el.getAttribute("aria-label")).toMatch(/ohne Ton/);
    expect(el.getAttribute("width")).toBe("1920");
    expect(el.getAttribute("height")).toBe("1080");
  });

  it("ships the files in the build and keeps them small enough for a hero", () => {
    for (const file of ["tigerflow-ueber-uns.mp4", "tigerflow-ueber-uns.webm", "tigerflow-ueber-uns-poster.jpg"]) {
      const target = path.join(DIST_DIR, "video", file);
      expect(existsSync(target), file).toBe(true);
    }
    expect(readFileSync(path.join(DIST_DIR, "video", "tigerflow-ueber-uns.mp4")).length).toBeLessThan(5.5 * 1024 * 1024);
  });

  it("offers a real pause/play button that is not a project check trigger", () => {
    const button = loadDoc().querySelector(".au-hero .au-visual button.au-video-toggle");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-label")).toMatch(/Video/);
    expect(button.hasAttribute("data-project-check-cta")).toBe(false);
  });

  it("keeps the control hidden until JavaScript knows the playback state", () => {
    const button = loadDoc().querySelector(".au-video-toggle");
    expect(button.classList.contains("au-video-pending")).toBe(true);
    expect(button.querySelector(".au-video-label")).not.toBeNull();
    const css = source("UeberUnsPage.css");
    for (const token of [".au-video-pending", ".au-video-cover", ".au-video-icon"]) expect(css, token).toContain(token);
  });

  it("offers a full-screen control that stays hidden until JavaScript can use it", () => {
    const button = loadDoc().querySelector(".au-visual button.au-video-fullscreen");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Video im Vollbild ansehen");
    expect(button.classList.contains("au-video-pending")).toBe(true);
    expect(button.hasAttribute("data-project-check-cta")).toBe(false);
    const css = source("UeberUnsPage.css");
    for (const token of [".au-video:fullscreen", ".au-video:-webkit-full-screen", "object-fit: contain"]) expect(css, token).toContain(token);
  });

  it("does not load the video on any other route", () => {
    expect(readFileSync(path.join(DIST_DIR, "index.html"), "utf8")).not.toContain("tigerflow-ueber-uns.mp4");
  });
});
