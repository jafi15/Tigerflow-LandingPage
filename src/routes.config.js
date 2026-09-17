export const SITE_URL = "https://tigerflow.de";

// Single source of truth for every indexable route: used by the App's
// router logic, the build-time prerender script and the generated
// sitemap.xml. Only routes with approved, non-empty content belong here.
export const ROUTES = [
  {
    path: "/",
    outFile: "index.html",
    title: "Webdesign, SEO und KI-Automatisierung | TigerFlow",
    description:
      "TigerFlow entwickelt Websites, SEO-Strategien und KI-Automatisierungen für Unternehmen in Schleswig-Holstein und deutschlandweit.",
    changefreq: "weekly",
    priority: "1.0",
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
