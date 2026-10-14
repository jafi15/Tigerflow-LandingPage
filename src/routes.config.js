export const SITE_URL = "https://tigerflow.de";

// Single source of truth for every indexable route: used by the App's
// router logic, the build-time prerender script and the generated
// sitemap.xml. Only routes with approved, non-empty content belong here.
export const ROUTES = [
  {
    path: "/",
    ogImage: "/og/home.png",
    outFile: "index.html",
    title: "Webdesign, SEO und KI-Automatisierung | TigerFlow",
    description:
      "TigerFlow entwickelt Websites, SEO-Strategien und KI-Automatisierungen für Unternehmen in Schleswig-Holstein und deutschlandweit.",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/webdesign-heide",
    ogImage: "/og/webdesign-heide.png",
    outFile: "webdesign-heide.html",
    title: "Webdesign Heide: Moderne Website ab 829 € | TigerFlow",
    description:
      "Professionelles Webdesign aus Heide: responsive Unternehmenswebsite, Texte, technische SEO-Basis und Anfragefunnel – ab 829 € netto.",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/webdesign-dithmarschen",
    ogImage: "/og/webdesign-dithmarschen.png",
    outFile: "webdesign-dithmarschen.html",
    title: "Webdesign Dithmarschen: Website ab 829 € | TigerFlow",
    description:
      "Professionelles Webdesign für Unternehmen in Dithmarschen: responsive Website, Texte, technische SEO-Basis und Anfrageweg – ab 829 € netto.",
    ogTitle: "Webdesign für Unternehmen in Dithmarschen | TigerFlow",
    ogDescription:
      "Moderne Unternehmenswebsites für Dithmarschen – klarer Leistungsumfang, regionale Erreichbarkeit und ausbaufähige technische Grundlage.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/webdesign-schleswig-holstein",
    ogImage: "/og/webdesign-schleswig-holstein.png",
    outFile: "webdesign-schleswig-holstein.html",
    title: "Webdesign Schleswig-Holstein: Website ab 829 € | TigerFlow",
    description:
      "Webdesign für Unternehmen in Schleswig-Holstein: responsive Website, Texte, technische SEO-Basis und klarer Anfrageweg – ab 829 € netto.",
    ogTitle: "Webdesign für Unternehmen in Schleswig-Holstein | TigerFlow",
    ogDescription:
      "Moderne Unternehmenswebsites mit klarem Leistungsumfang, digitaler Zusammenarbeit und ausbaufähiger technischer Grundlage.",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/seo-heide",
    ogImage: "/og/seo-heide.png",
    outFile: "seo-heide.html",
    title: "SEO Heide: Analyse & klarer Maßnahmenplan | TigerFlow",
    description:
      "SEO aus Heide: TigerFlow analysiert Website, Keywords und Wettbewerb und erstellt eine priorisierte SEO-Roadmap. SEO-Setup ab 499 € netto.",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/impressum",
    outFile: "impressum.html",
    title: "Impressum | TigerFlow",
    description:
      "Anbieterkennzeichnung und rechtliche Angaben zu TigerFlow, Einzelunternehmen von Jafar Hamzeh, Heide.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/datenschutz",
    outFile: "datenschutz.html",
    title: "Datenschutz | TigerFlow",
    description:
      "Informationen zur Verarbeitung personenbezogener Daten auf tigerflow.de gemäß DSGVO.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/agb",
    outFile: "agb.html",
    title: "AGB | TigerFlow",
    description:
      "Allgemeine Geschäftsbedingungen für Agentur-, Website- und Automationsleistungen von TigerFlow.",
    changefreq: "yearly",
    priority: "0.3",
  },
];
