import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./SeoBetreuungPage.css";

const PATH = "/seo-betreuung";
const PAGE_URL = `${SITE_URL}${PATH}`;
const route = ROUTES.find(({ path }) => path === PATH);
const CTA_LABEL = "SEO-Betreuung unverbindlich anfragen";

// Hero visual "SEO als kontinuierlicher Arbeitskreislauf": four phases on one closed ring.
// Purely schematic: it carries no values, positions, rankings or customer data.
const cyclePhases = [
  { id: "pruefen", name: "Prüfen", note: "Daten und Indexierung" },
  { id: "priorisieren", name: "Priorisieren", note: "Chancen und Probleme" },
  { id: "umsetzen", name: "Umsetzen", note: "vereinbarte Maßnahmen" },
  { id: "einordnen", name: "Einordnen", note: "Wirkung und nächste Schritte" },
];
// Ring geometry in a 320 × 320 viewBox: centre 160/160, radius 124.
const RING_NODES = [[160, 36], [284, 160], [160, 284], [36, 160]];
const RING_CHEVRONS = [[247.68, 72.32, 45], [247.68, 247.68, 135], [72.32, 247.68, 225], [72.32, 72.32, 315]];

const situations = [
  {
    title: "Der Maßnahmenplan liegt vor, die Umsetzung stockt",
    text: "Ein SEO-Setup oder Audit hat Prioritäten benannt. Im Tagesgeschäft bleiben sie liegen, weil niemand sie Monat für Monat abarbeitet.",
  },
  {
    title: "Die Zahlen bewegen sich, die nächste Maßnahme fehlt",
    text: "Seiten gewinnen oder verlieren Impressionen. Ohne Einordnung bleibt offen, ob und an welcher Stelle gehandelt werden sollte.",
  },
  {
    title: "Mehrere Seiten zielen auf ähnliche Begriffe",
    text: "Leistungs- und Themenseiten überschneiden sich. Zuordnung und interne Verlinkung brauchen fortlaufende Pflege statt einer einmaligen Korrektur.",
  },
  {
    title: "Berichte gibt es, Entscheidungen nicht",
    text: "Reports listen Werte auf, erklären aber nicht, was daraus folgt. Gebraucht wird eine verständliche Einordnung mit priorisierter Empfehlung.",
  },
];

const cycleSteps = [
  {
    tag: "Prüfen",
    title: "Daten und Indexierung prüfen",
    items: [
      "Signale aus Google Search Console und Analytics im vereinbarten Umfang",
      "Indexierung, relevante Seiten und technische Auffälligkeiten",
      "Grundlage sind die bereitgestellten Zugänge und verfügbaren Daten",
    ],
  },
  {
    tag: "Priorisieren",
    title: "Chancen und Probleme priorisieren",
    items: [
      "Suchintention, Seitenrolle und Geschäftsziel gemeinsam betrachten",
      "Nicht jede Schwankung ist ein Handlungszwang",
      "Die nächsten Maßnahmen in eine Reihenfolge bringen",
    ],
  },
  {
    tag: "Umsetzen",
    title: "Vereinbarte Maßnahmen umsetzen",
    items: [
      "Vorhandene Seiten optimieren",
      "Technik und interne Verlinkung im vereinbarten Rahmen bearbeiten",
      "Neue oder umfangreich überarbeitete Zielseiten nur nach Tarif und fachlicher Eignung",
      "Inhalte vor Veröffentlichung abstimmen",
    ],
  },
  {
    tag: "Einordnen",
    title: "Wirkung einordnen und nächste Schritte festlegen",
    items: [
      "Monatsbericht erstellen",
      "Entwicklungen sachlich einordnen",
      "Nächste Prioritäten ableiten",
      "Keine Wirkung behaupten, die sich nicht belastbar zuordnen lässt",
    ],
  },
];

const core = [
  {
    title: "Monitoring über Google Search Console und Analytics",
    text: "Relevante Suchdaten werden im vereinbarten Umfang beobachtet.",
  },
  {
    title: "Technische SEO-Kontrollen",
    text: "Indexierung und technische Auffälligkeiten werden regelmäßig geprüft.",
  },
  {
    title: "Onpage-Optimierung bestehender Seiten",
    text: "Vorhandene Seiten werden im vereinbarten Umfang überarbeitet.",
  },
  {
    title: "Interne Verlinkung",
    text: "Seitenrollen und Verknüpfungen werden fortlaufend gepflegt.",
  },
  {
    title: "Monatlicher Bericht",
    text: "Jeder Monat endet mit einem schriftlichen Bericht.",
  },
  {
    title: "Keine Ergebnis- oder Rankinggarantie",
    text: "Vereinbart wird die Arbeit, nicht ein Suchmaschinen- oder Geschäftsergebnis.",
    limit: true,
  },
];

// Slots show the possible page capacity per month: none, one, one plus an optional second.
const frames = [
  {
    id: "basis",
    name: "SEO Basis",
    title: "SEO Basis – vorhandene Seiten gezielt optimieren",
    slots: ["empty", "empty"],
    caption: "Keine neue Zielseite pro Monat",
    fit: "Passt, wenn zunächst vorhandene Seiten, Technik und interne Verlinkung kontinuierlich verbessert werden sollen.",
    included: [
      "Gemeinsamer Leistungsrahmen aller Tarife",
      "Optimierung vorhandener Seiten im vereinbarten Umfang",
      "Monatsbericht",
    ],
    excluded: [
      "Local SEO als Standardbaustein",
      "Pflege des Google-Unternehmensprofils als Standardbaustein",
      "Besprechung nach Bedarf als Tarifbestandteil",
    ],
  },
  {
    id: "wachstum",
    name: "SEO Wachstum",
    title: "SEO Wachstum – laufende Optimierung plus eine Zielseite",
    slots: ["filled", "empty"],
    caption: "Eine neue oder umfangreich überarbeitete Zielseite pro Monat",
    fit: "Passt, wenn neben bestehenden Seiten regelmäßig ein neuer oder umfassend überarbeiteter Suchauftrag umgesetzt werden soll.",
    included: [
      "Alle Leistungen aus SEO Basis",
      "Local SEO bei Eignung und vorhandenen Zugängen",
      "Optimierung korrekter Unternehmensdaten und projektbezogene Beiträge im Google-Unternehmensprofil, sofern vereinbart und Zugänge vorhanden sind",
      "Bericht mit Handlungsempfehlungen",
      "Besprechung nach Bedarf",
    ],
    note: "Gemeint ist insgesamt eine Seite pro Monat, nicht zusätzlich je eine neue und eine überarbeitete.",
  },
  {
    id: "premium",
    name: "SEO Premium",
    title: "SEO Premium – bis zu zwei Zielseiten",
    slots: ["filled", "optional"],
    caption: "Bis zu zwei neue oder umfangreich überarbeitete Zielseiten pro Monat statt einer",
    fit: "Passt, wenn mehrere fachlich eigenständige Zielseiten priorisiert sind und der höhere Umfang tatsächlich sinnvoll ist.",
    included: ["Alle Leistungen aus SEO Wachstum"],
    note: "„Bis zu zwei“ ist eine Obergrenze und kein Anspruch auf zwei Seiten in jedem Monat. Weitere Zusatzleistungen enthält Premium nicht.",
  },
];

const prerequisites = [
  {
    title: "Ein TigerFlow-SEO-Setup liegt vor",
    text: "Analyse, Keyword-Map und priorisierter Maßnahmenplan sind vorhanden. Die laufende Betreuung baut darauf auf und wird separat angeboten und kalkuliert.",
  },
  {
    title: "Eine andere Analyse liegt vor",
    text: "TigerFlow prüft die vorhandene Analyse vor Beginn. Ist sie nach Prüfung gleichwertig, braucht es kein zusätzliches Setup. Automatisch anerkannt wird sie nicht.",
  },
  {
    title: "Es gibt noch keine Grundlage",
    text: "Dann steht zuerst das SEO-Setup an: ein separates einmaliges Projekt ab 499 € netto zuzüglich Umsatzsteuer.",
  },
];

const matrixColumns = ["SEO-Setup", "Separate Umsetzung", "Laufende SEO-Betreuung", "Website-Betreuung"];
const FOCUS_COLUMN = 2;
const matrixRows = [
  ["Hauptaufgabe", "Ausgangslage analysieren und Prioritäten festlegen", "einzelne vereinbarte Maßnahmen umsetzen", "Website monatlich überwachen, priorisieren und optimieren", "Website technisch warten und kleinere Änderungen betreuen"],
  ["Ergebnis", "schriftliche Keyword-Map und Maßnahmenplan", "konkret vereinbartes Arbeitsergebnis", "fortlaufender Arbeits- und Berichtszyklus", "technische Prüfroutine und tarifabhängiges Änderungskontingent"],
  ["Preislogik", "ab 499 € netto, individueller Festpreis", "separat nach Umfang kalkuliert", "individuell kalkulierter Monatspreis", "öffentliche Pakete ab 49 € netto monatlich"],
  ["Laufzeit", "einmaliges Projekt", "projektbezogen", "sechs Monate Mindestlaufzeit, danach monatlich kündbar", "drei Monate Mindestlaufzeit, danach monatlich mit einem Monat Frist kündbar"],
  ["Neue Zielseiten", "nicht enthalten", "nach Vereinbarung", "tarifabhängig: keine, eine oder bis zu zwei pro Monat", "nicht enthalten"],
  ["SEO-Monitoring", "Analyse der Ausgangslage", "nur wenn vereinbart", "gemeinsamer Bestandteil aller Tarife", "nur bei ausdrücklicher SEO-Zusatzvereinbarung"],
];

const contextLinks = [
  { href: "/seo-heide", label: "SEO-Setup und Local SEO für Unternehmen in Heide" },
  { href: "/seo-schleswig-holstein", label: "SEO-Architektur für mehrere Regionen in Schleswig-Holstein" },
  { href: "/preise", label: "Preisübersicht mit SEO-Setup ab 499 € netto" },
  { href: "/website-betreuung", label: "Technische Website-Betreuung und Wartung im Vergleich" },
];

const limits = [
  {
    title: "Umfang außerhalb der Tarife",
    items: [
      "Unbegrenzt viele neue oder überarbeitete Seiten",
      "Vollständige Website-Neuentwicklung oder Relaunch",
      "Technische Umsetzung in nicht zugänglichen Fremdsystemen",
      "Fotos, Videos oder umfangreiche Medienproduktion",
      "Übersetzungen",
      "Besondere GEO-/KI-Sichtbarkeitsleistungen als pauschaler Standardumfang",
      "Local SEO oder Unternehmensprofilpflege außerhalb der Tarif- und Projektgrenzen",
    ],
  },
  {
    title: "Offpage und Werbung",
    items: [
      "Garantierter Linkaufbau",
      "Kauf oder Vermittlung von Backlinks",
      "Pauschale Digital-PR-Leistungen",
      "Bezahlte Anzeigen oder Media-Budget",
    ],
  },
  {
    title: "Fremdkosten und formale Prüfungen",
    items: [
      "Software-, Lizenz-, Medien-, Tool- oder Werbekosten",
      "Rechtsprüfung",
      "Formale Datenschutz-, BFSG- oder WCAG-Konformitätsprüfung",
    ],
  },
  {
    title: "Ergebnisse und Erreichbarkeit",
    items: [
      "Garantierte Rankings, Indexierung, Klicks, Anfragen, Kunden oder Umsatz",
      "Garantierte Reaktions- oder Behebungszeiten",
      "Rund-um-die-Uhr-Support",
    ],
  },
];

const steps = [
  {
    title: "Grundlage, Ziele und Zugänge prüfen",
    text: "Wir klären, welche Analyse vorliegt, was erreicht werden soll und welche Zugänge bereitstehen.",
  },
  {
    title: "Tarif und Umfang im Angebot festhalten",
    text: "Leistungsrahmen, individueller Umfang und Monatspreis stehen vor der Beauftragung schriftlich fest.",
  },
  {
    title: "Daten und aktuelle Prioritäten betrachten",
    text: "Jeder Monat beginnt mit dem Blick auf Suchdaten, Indexierung und offene Maßnahmen.",
  },
  {
    title: "Maßnahmen im vereinbarten Rahmen umsetzen",
    text: "Bearbeitet wird, was im Angebot vereinbart und für den Monat priorisiert ist.",
  },
  {
    title: "Inhalte vor Veröffentlichung abstimmen",
    text: "Neue und überarbeitete Inhalte gehen erst nach Ihrer Abstimmung online.",
  },
  {
    title: "Monatlich berichten und Prioritäten einordnen",
    text: "Der Monatsbericht hält fest, was getan wurde und was als Nächstes ansteht.",
  },
];

const terms = [
  ["Mindestlaufzeit", "Sechs Monate"],
  ["Danach", "Monatlich kündbar"],
  ["Voraussetzung", "SEO-Setup oder nach Prüfung gleichwertige Analyse"],
  ["Fremdkosten", "Nur enthalten, wenn sie ausdrücklich im Angebot stehen"],
  ["Offpage-Leistungen", "Werden separat geprüft, vereinbart und ausgewiesen"],
  ["Fehlt die Grundlage", "SEO-Setup ab 499 € netto als separates Projekt"],
];

const measures = [
  {
    title: "Technische Zugänglichkeit und Indexierung",
    text: "Können die relevanten Seiten gecrawlt und indexiert werden?",
  },
  {
    title: "Sichtbarkeit für relevante Suchanfragen",
    text: "Erscheint die Website dort, wo die passende Nachfrage sucht?",
  },
  {
    title: "Qualifizierte organische Klicks",
    text: "Kommen Besucher mit passendem Anliegen auf die richtigen Seiten?",
  },
  {
    title: "Gewünschte Handlungen und Projektanfragen",
    text: "Führen diese Besuche zu Kontaktaufnahmen und Anfragen?",
    business: true,
  },
  {
    title: "Angebote, gewonnene Kunden und Umsatz",
    text: "Nur so weit, wie sich das belastbar zuordnen lässt.",
    business: true,
  },
];

const faqs = [
  {
    question: "Was kostet die SEO-Betreuung bei TigerFlow?",
    answer:
      "Der Monatspreis wird individuell kalkuliert. Er hängt von Website, Ausgangslage, Zielen, eingesetzten Systemen und dem vereinbarten Umfang ab. Den konkreten Preis nennt das individuelle Angebot vor der Beauftragung; feste öffentliche Monatsbeträge gibt es nicht.",
  },
  {
    question: "Muss vorher das TigerFlow-SEO-Setup gebucht werden?",
    answer:
      "Voraussetzung ist entweder das TigerFlow-SEO-Setup oder eine vorhandene Analyse, die TigerFlow nach Prüfung als gleichwertig anerkennt. Liegt eine solche Grundlage bereits vor, muss das Setup nicht noch einmal gebucht werden.",
  },
  {
    question: "Was ist in allen Tarifen enthalten?",
    answer:
      "Alle drei Tarife enthalten Monitoring über Google Search Console und Analytics, technische SEO-Kontrollen, Onpage-Optimierung bestehender Seiten, interne Verlinkung und einen monatlichen Bericht. Eine Ergebnis- oder Rankinggarantie gehört in keinem Tarif dazu.",
  },
  {
    question: "Was unterscheidet Basis, Wachstum und Premium?",
    answer:
      "SEO Basis optimiert vorhandene Seiten und enthält keine neue Zielseite pro Monat. SEO Wachstum ergänzt eine neue oder umfangreich überarbeitete Zielseite pro Monat, Local SEO bei Eignung und einen Bericht mit Handlungsempfehlungen. SEO Premium erhöht den Seitenumfang auf bis zu zwei Zielseiten pro Monat.",
  },
  {
    question: "Werden jeden Monat automatisch neue Seiten veröffentlicht?",
    answer:
      "Nein. Neue oder umfangreich überarbeitete Seiten müssen fachlich sinnvoll, eigenständig und mit Ihnen abgestimmt sein. „Bis zu“ beschreibt eine Obergrenze, und SEO Basis enthält keine neue Zielseite pro Monat.",
  },
  {
    question: "Ist Local SEO in der Betreuung enthalten?",
    answer:
      "In SEO Wachstum und SEO Premium ist Local SEO bei Eignung und vorhandenen Zugängen vorgesehen. Der konkrete Umfang wird vereinbart. Eine pauschale Profilpflege für beliebig viele Standorte gehört nicht dazu.",
  },
  {
    question: "Ist Linkaufbau enthalten?",
    answer:
      "Nicht als garantierter Standard. Offpage-Leistungen übernimmt TigerFlow nur nach separater Prüfung und Vereinbarung; dabei entstehende Fremdkosten werden ausgewiesen.",
  },
  {
    question: "Wie lange läuft die SEO-Betreuung?",
    answer:
      "Für alle SEO-Tarife gelten sechs Monate Mindestlaufzeit. Danach ist die Betreuung monatlich kündbar.",
  },
  {
    question: "Garantiert TigerFlow bessere Rankings oder mehr Anfragen?",
    answer:
      "Nein. TigerFlow kann Monitoring, Priorisierung, Umsetzung und Messung vereinbaren. Suchmaschinen- und Geschäftsergebnisse lassen sich nicht garantieren.",
  },
  {
    question: "Kann TigerFlow eine bestehende Website betreuen?",
    answer:
      "Grundsätzlich ja, nach Prüfung von Technik, System, Ausgangslage und Zugängen. Ein pauschales Versprechen für jedes CMS oder Fremdsystem geben wir nicht. Ein Relaunch ist nicht automatisch erforderlich.",
  },
  {
    question: "Wie werden Inhalte freigegeben?",
    answer:
      "Inhalte werden vor der Veröffentlichung mit Ihnen abgestimmt. Die konkreten Freigabewege vereinbaren wir projektbezogen.",
  },
];

// Only visible, true content: no offer or price (the monthly price is individual),
// no rating and no service area beyond the confirmed provider address.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: route.title,
      description: route.description,
      inLanguage: "de-DE",
      isPartOf: { "@type": "WebSite", name: "TigerFlow", url: `${SITE_URL}/` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "SEO-Betreuung", item: PAGE_URL },
      ],
    },
    {
      "@type": "Service",
      name: "Laufende SEO-Betreuung",
      serviceType: "Suchmaschinenoptimierung",
      url: PAGE_URL,
      description: route.description,
      provider: {
        "@type": "Organization",
        name: "TigerFlow",
        url: `${SITE_URL}/`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rendsburger Straße 22",
          postalCode: "25746",
          addressLocality: "Heide",
          addressCountry: "DE",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

// Same mechanism as ServiceMegaMenu's "Projekt einordnen" trigger: the existing global
// ProjectCheck listens for this event and restores focus to detail.trigger on close.
function openProjectCheck(event) {
  window.dispatchEvent(
    new CustomEvent("tigerflow:open-project-check", {
      detail: { trigger: event.currentTarget },
    })
  );
}

// Below-the-fold items start hidden and rise once, only when JS can reveal them again;
// without JS, with reduced motion or in the initial HTML they stay fully visible.
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const page = ref.current;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!page || reduceMotion || !("IntersectionObserver" in window)) return undefined;

    const timers = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Tall blocks (price, tiers) count as visible once a readable strip is on screen.
          const visible =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.12 || entry.intersectionRect.height >= 120);
          // After an anchor jump an item can sit half above the viewport: never keep
          // content hidden that the reader has already passed.
          const passed = entry.isIntersecting && entry.boundingClientRect.top < 0;
          if (!visible && !passed) return;
          const target = entry.target;
          const delay = Number(target.dataset.sbOrder ?? 0) * 60;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.remove("sb-reveal-pending");
          // Drop the stagger delay afterwards so hover feedback stays instant.
          const timer = window.setTimeout(() => {
            target.style.removeProperty("transition-delay");
            timers.delete(timer);
          }, delay + 340);
          timers.add(timer);
          observer.unobserve(target);
        });
      },
      { threshold: [0, 0.04, 0.12], rootMargin: "0px 0px -6% 0px" }
    );

    page.querySelectorAll("[data-sb-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("sb-reveal-pending");
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return ref;
}

// Floating chrome appears once the hero actions have scrolled away. The mobile bar steps
// aside again at the closing CTA, so there is never a duplicate CTA on screen.
function useScrollChrome(pageRef) {
  const [chrome, setChrome] = useState({ pastHero: false, reachedFinal: false });

  useEffect(() => {
    const page = pageRef.current;
    const heroCta = page?.querySelector(".sb-hero-actions");
    const finalCta = page?.querySelector("#projektanfrage");
    if (!heroCta || !finalCta || !("IntersectionObserver" in window)) return undefined;

    const state = { pastHero: false, reachedFinal: false };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const above = entry.boundingClientRect.top < 0;
        if (entry.target === heroCta) state.pastHero = !entry.isIntersecting && above;
        else state.reachedFinal = entry.isIntersecting || above;
      });
      setChrome({ ...state });
    });
    observer.observe(heroCta);
    observer.observe(finalCta);
    return () => observer.disconnect();
  }, [pageRef]);

  return chrome;
}

// Marks the section that currently sits in the middle band of the viewport.
function useActiveSection(pageRef) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    page.querySelectorAll("main > section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pageRef]);

  return active;
}

const navLinks = [
  { id: "leistungsrahmen", label: "Leistungsrahmen" },
  { id: "preis", label: "Preis" },
  { id: "faq", label: "FAQ" },
];

function BrandLink() {
  return (
    <a className="sb-brand" href="/" aria-label="TigerFlow Startseite">
      <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
      <span>TigerFlow</span>
    </a>
  );
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`sb-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function PageHeader() {
  return (
    <header className="sb-nav">
      <BrandLink />
      <nav className="sb-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath={PATH} />
        {navLinks.map(({ id, label }) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>
      <button
        type="button"
        className="sb-nav-cta"
        data-project-check-cta
        aria-label="Projekt-Check starten"
        onClick={openProjectCheck}
      >
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}

// Not a second banner landmark: a plain, initially inert layer after the page header.
function FloatingBar({ visible, active }) {
  return (
    <div
      className={`sb-bar sb-glass${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="sb-bar-inner">
        <BrandLink />
        <nav className="sb-bar-links" aria-label="Abschnitte">
          {navLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ProjectCheckButton className="sb-btn-sm">
          Projekt-Check <ArrowRight size={15} aria-hidden="true" />
        </ProjectCheckButton>
      </div>
    </div>
  );
}

function MobileBar({ visible }) {
  return (
    <div
      className={`sb-mobile-bar${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="sb-mobile-bar-price">
        <b>Individuell kalkuliert</b>
        <span>sechs Monate Mindestlaufzeit</span>
      </div>
      <ProjectCheckButton>
        Projekt-Check <ArrowRight size={16} aria-hidden="true" />
      </ProjectCheckButton>
    </div>
  );
}

// Decorative work cycle. Its statement is repeated as real text in #arbeitskreislauf.
function CycleVisual() {
  return (
    <div className="sb-cycle" aria-hidden="true">
      <div className="sb-cycle-head">
        <b>SEO ALS KONTINUIERLICHER ARBEITSKREISLAUF</b>
        <em>Schematische Darstellung</em>
      </div>
      <div className="sb-cycle-stage">
        <div className="sb-ring">
          <svg viewBox="0 0 320 320" focusable="false">
            <circle className="sb-ring-inner" cx="160" cy="160" r="84" />
            <circle className="sb-ring-base" cx="160" cy="160" r="124" />
            {RING_CHEVRONS.map(([x, y, angle]) => (
              <path
                key={angle}
                className="sb-ring-chev"
                d="M-4 -5 L3 0 L-4 5"
                transform={`translate(${x} ${y}) rotate(${angle})`}
              />
            ))}
            {RING_NODES.map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle className="sb-ring-node" cx={x} cy={y} r="9" />
                <circle className="sb-ring-dot" cx={x} cy={y} r="3" />
              </g>
            ))}
            <g className="sb-orbit">
              <path className="sb-orbit-trail" d="M65.01 80.29 A124 124 0 0 1 160 36" />
              <circle className="sb-orbit-glow" cx="160" cy="36" r="14" />
              <circle className="sb-orbit-dot" cx="160" cy="36" r="5" />
            </g>
          </svg>
          <div className="sb-ring-core">
            <b>Monat für Monat</b>
            <span>ein Ablauf, kein Einzelprojekt</span>
          </div>
        </div>
        <ol className="sb-cycle-phases" role="list">
          {cyclePhases.map(({ id, name, note }) => (
            <li key={id} data-sb-phase={id}>
              <b>{name}</b>
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="sb-cycle-foot">
        Jeder Monat endet mit einer Einordnung und beginnt mit der nächsten Prüfung.
      </p>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`sb-intro ${className}`.trim()} data-sb-reveal>
      <span className="sb-label">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function LimitList({ title, items }) {
  return (
    <div className="sb-scope sb-scope-out">
      <h3>{title}</h3>
      <ul role="list">
        {items.map((item) => (
          <li key={item}>
            <Minus size={15} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeoBetreuungPage() {
  const pageRef = useReveal();
  const { pastHero, reachedFinal } = useScrollChrome(pageRef);
  const activeSection = useActiveSection(pageRef);

  return (
    <div ref={pageRef} className="sb-page" style={{ background: C.pageBg, color: C.textPri }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="sb-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />
      <FloatingBar visible={pastHero} active={activeSection} />

      <main id="inhalt" tabIndex={-1}>
        <section className="sb-hero">
          <div className="sb-hero-bg" aria-hidden="true" />
          <div className="sb-hero-copy">
            <span className="sb-eyebrow">LAUFENDE SEO-BETREUUNG</span>
            <h1>
              <span>Laufende SEO-Betreuung:</span>{" "}
              <span>Monat für Monat klar priorisiert.</span>
            </h1>
            <p className="sb-lead">
              TigerFlow überwacht relevante Suchdaten, prüft technische und inhaltliche
              Entwicklungen und setzt die vereinbarten SEO-Maßnahmen in einer nachvollziehbaren
              Reihenfolge um.
            </p>
            <p className="sb-anchors">Monitoring · Onpage · interne Verlinkung · Monatsbericht</p>
            <div className="sb-hero-actions">
              <ProjectCheckButton>
                {CTA_LABEL} <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="sb-text-link" href="#leistungskern">Leistungsrahmen ansehen</a>
            </div>
            <div className="sb-entry">
              <p className="sb-entry-price">
                <strong>Individuell kalkuliert</strong>
                <span>sechs Monate Mindestlaufzeit</span>
              </p>
              <p className="sb-entry-limit">
                Voraussetzung ist ein SEO-Setup oder eine nach Prüfung gleichwertige Analyse.
                Umfang, Zugänge und Fremdkosten werden individuell vereinbart.
              </p>
            </div>
          </div>
          <CycleVisual />
        </section>

        <section id="ausgangslage" className="sb-section">
          <SectionIntro
            className="sb-intro-split"
            eyebrow="AUSGANGSLAGE"
            title="Wenn SEO nach dem Maßnahmenplan nicht liegen bleiben soll"
            text="Ein SEO-Setup schafft eine priorisierte Grundlage. Umgesetzt ist damit noch nichts, und Website, Suchergebnisse und Wettbewerbsumfeld verändern sich weiter. Die laufende Betreuung ordnet Monitoring, Umsetzung und Reporting in einen wiederkehrenden Ablauf."
          />
          <ol className="sb-ledger" role="list">
            {situations.map(({ title, text }, index) => (
              <li key={title} data-sb-reveal data-sb-order={index % 2}>
                <span className="sb-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="sb-aside" data-sb-reveal>
            Das sind typische Ausgangslagen, keine Kundenfälle und keine erzielten Resultate. Daten
            allein ersetzen keine Priorisierung.
          </p>
        </section>

        <section id="arbeitskreislauf" className="sb-section sb-band">
          <SectionIntro
            eyebrow="ARBEITSWEISE"
            title="Ein monatlicher Arbeitskreislauf statt einzelner SEO-Aktionen"
            text="Monatliche SEO-Betreuung folgt vier Phasen, die ineinandergreifen. Was am Ende eines Monats eingeordnet wird, bestimmt, was im nächsten zuerst geprüft wird."
          />
          <ol className="sb-phases sb-phases-4" role="list">
            {cycleSteps.map(({ tag, title, items }, index) => (
              <li key={title} data-sb-reveal data-sb-order={index}>
                <span className="sb-phase-node" aria-hidden="true">{index + 1}</span>
                <span className="sb-phase-tag">{tag}</span>
                <h3>{title}</h3>
                <ul role="list">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </li>
            ))}
          </ol>
          <p className="sb-aside" data-sb-reveal>
            Der Kreislauf beschreibt eine Arbeitsweise. Feste Wochen- oder Tageszusagen sind damit
            nicht verbunden.
          </p>
        </section>

        <section id="leistungskern" className="sb-section">
          <SectionIntro
            className="sb-intro-split"
            eyebrow="GEMEINSAMER KERN"
            title="Was in jeder SEO-Betreuung enthalten ist"
            text="Der Kern ist in allen drei Tarifen gleich. Technische und analytische Grundlagen sind kein Extra höherer Tarife."
          />
          <div className="sb-core sb-surface" data-sb-reveal>
            <p className="sb-core-head">
              <span className="sb-label">IN JEDEM TARIF ENTHALTEN</span>
              <span>SEO Basis, SEO Wachstum und SEO Premium</span>
            </p>
            <ul role="list">
              {core.map(({ title, text, limit }) => (
                <li key={title} className={limit ? "is-limit" : undefined}>
                  {limit ? <Minus size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="sb-aside" data-sb-reveal>
            Umfang und Prioritäten stehen im individuellen Angebot. Zugänge und Systeme werden
            projektbezogen geprüft. Fremdkosten sind nicht automatisch enthalten.
          </p>
        </section>

        <section id="leistungsrahmen" className="sb-section sb-band">
          <SectionIntro
            eyebrow="LEISTUNGSRAHMEN"
            title="Welcher Leistungsrahmen zur Website passt"
            text="Die drei Rahmen bauen aufeinander auf. Sie unterscheiden sich vor allem darin, wie viele neue oder umfangreich überarbeitete Zielseiten pro Monat möglich sind."
          />
          <div className="sb-frames sb-surface" data-sb-reveal>
            {frames.map(({ id, name, title, slots, caption, fit, included, excluded, note }) => (
              <article key={id} className="sb-frame" data-sb-frame={id}>
                <span className="sb-frame-name">{name}</span>
                <h3>{title}</h3>
                <div className="sb-slots" aria-hidden="true">
                  {slots.map((state, index) => (
                    <i key={index} className={`sb-slot is-${state}`}>
                      {state === "optional" && <em>bis zu</em>}
                    </i>
                  ))}
                </div>
                <p className="sb-slot-caption">{caption}</p>
                <p className="sb-frame-fit">{fit}</p>
                <ul role="list">
                  {included.map((item) => (
                    <li key={item}>
                      <Check size={15} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {excluded && (
                  <>
                    <h4>Nicht als Tarifbestandteil bestätigt</h4>
                    <ul role="list" className="sb-frame-out">
                      {excluded.map((item) => (
                        <li key={item}>
                          <Minus size={15} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {note && <p className="sb-frame-note">{note}</p>}
                <p className="sb-frame-price">
                  <small>Monatspreis</small>
                  <b>individuell kalkuliert</b>
                </p>
              </article>
            ))}
          </div>
          <div className="sb-frames-foot" data-sb-reveal>
            <p>
              Welcher Rahmen passt, ergibt sich aus Grundlage, Website und Zielen. Keiner der drei
              ist eine pauschale Standardempfehlung.
            </p>
            <ProjectCheckButton>
              Leistungsrahmen einordnen <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
          </div>
        </section>

        <section id="voraussetzung" className="sb-section">
          <SectionIntro
            className="sb-intro-split"
            eyebrow="VORAUSSETZUNG"
            title="Voraussetzung: eine belastbare SEO-Grundlage"
            text="Ohne Analyse wären monatliche Einzelmaßnahmen ein Blindflug. Deshalb beginnt die laufende SEO-Betreuung erst, wenn klar ist, welche Seiten, Begriffe und Maßnahmen Vorrang haben."
          />
          <div className="sb-paths sb-paths-3">
            {prerequisites.map(({ title, text }, index) => (
              <article key={title} data-sb-reveal data-sb-order={index}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="sb-matrix-wrap" data-sb-reveal>
            <h3 id="sb-matrix-title">Setup, Umsetzung, Betreuung und Website-Betreuung im Vergleich</h3>
            <p>
              Vier Leistungen, vier Aufgaben. Die technische SEO-Basis einer Website und ihre
              Wartung sind keine laufende SEO-Betreuung.
            </p>
            <table className="sb-matrix" aria-labelledby="sb-matrix-title">
              <thead>
                <tr>
                  <th scope="col">Dimension</th>
                  {matrixColumns.map((column, index) => (
                    <th key={column} scope="col" className={index === FOCUS_COLUMN ? "is-focus" : undefined}>
                      {column}
                      {index === FOCUS_COLUMN && <em> Diese Seite</em>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows.map(([dimension, ...cells]) => (
                  <tr key={dimension}>
                    <th scope="row">{dimension}</th>
                    {cells.map((cell, index) => (
                      <td
                        key={matrixColumns[index]}
                        data-label={matrixColumns[index]}
                        className={index === FOCUS_COLUMN ? "is-focus" : undefined}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sb-link-rows" data-sb-reveal>
            {contextLinks.map(({ href, label }) => (
              <a key={href} className="sb-link-row" href={href}>
                <span>{label}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section id="grenzen" className="sb-section sb-band">
          <SectionIntro
            eyebrow="GRENZEN"
            title="Was nicht automatisch zur laufenden Betreuung gehört"
            text="Die laufende Betreuung ist Onpage-Arbeit an Ihrer Website. Alles hier Genannte gehört nur dazu, wenn es ausdrücklich individuell vereinbart wird."
          />
          <div className="sb-limits sb-surface" data-sb-reveal>
            <div className="sb-scopes sb-scopes-4">
              {limits.map(({ title, items }) => (
                <LimitList key={title} title={title} items={items} />
              ))}
            </div>
          </div>
        </section>

        <section id="zusammenarbeit" className="sb-section">
          <SectionIntro
            className="sb-intro-split"
            eyebrow="ZUSAMMENARBEIT"
            title="Zusammenarbeit mit klaren Freigaben"
            text="Sechs Schritte, von der Prüfung der Grundlage bis zum Monatsbericht. Veröffentlicht wird nichts, was nicht mit Ihnen abgestimmt ist."
          />
          <ol className="sb-steps sb-steps-6" role="list">
            {steps.map(({ title, text }, index) => (
              <li key={title} data-sb-reveal data-sb-order={index % 3}>
                <span className="sb-step-node" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="sb-aside" data-sb-reveal>
            Die Zusammenarbeit kann digital organisiert werden. Kanäle und Termine werden
            projektbezogen vereinbart; eine Besprechung nach Bedarf ist in SEO Wachstum und SEO
            Premium vorgesehen. Feste Antwortzeiten oder eine jederzeitige Erreichbarkeit sagen wir
            nicht zu.
          </p>
        </section>

        <section id="preis" className="sb-section sb-band">
          <div className="sb-price sb-surface" data-sb-reveal>
            <div className="sb-price-head">
              <div className="sb-price-copy">
                <span className="sb-label">PREIS UND VERTRAGSRAHMEN</span>
                <h2>Individuell kalkuliert und klar abgegrenzt</h2>
                <p>
                  Einen öffentlichen Pauschalpreis gibt es für die laufende SEO-Betreuung nicht.
                  Umfang und Monatspreis hängen von Website, Ausgangslage, Zielen und Systemen ab
                  und stehen vor der Beauftragung im individuellen Angebot.
                </p>
              </div>
              <div className="sb-price-panel">
                <small>Laufende SEO-Betreuung</small>
                <strong>Individuell kalkuliert</strong>
                <span>Monatspreis laut individuellem Angebot</span>
                <ProjectCheckButton className="sb-btn-block">{CTA_LABEL}</ProjectCheckButton>
                <p className="sb-price-note">
                  Die Anfrage öffnet den Projekt-Check. Ein Preis wird dabei nicht automatisch
                  berechnet; ein Angebot folgt erst nach der Bedarfsklärung.
                </p>
              </div>
            </div>
            <dl className="sb-terms">
              {terms.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="erfolgsmessung" className="sb-section">
          <SectionIntro
            className="sb-intro-split"
            eyebrow="ERFOLGSMESSUNG"
            title="Erfolg wird entlang der gesamten Kette eingeordnet"
            text="Positionen und Besucherzahlen zeigen nur einen Teil des Bildes. Eingeordnet wird entlang dieser fünf Stufen, so weit die Daten es zulassen."
          />
          <ol className="sb-measure" role="list">
            {measures.map(({ title, text, business }, index) => (
              <li key={title} className={business ? "is-business" : undefined} data-sb-reveal data-sb-order={index}>
                <span className="sb-measure-node" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="sb-aside" data-sb-reveal>
            Nicht jede Veränderung lässt sich einer einzelnen Maßnahme zuordnen. Geringe
            Datenmengen werden nicht überinterpretiert, und Vergleiche nutzen nach Möglichkeit
            gleich lange Zeiträume mit identischen Filtern.
          </p>
        </section>

        <section id="faq" className="sb-section sb-band sb-faq-section">
          <SectionIntro eyebrow="FAQ" title="Häufige Fragen zur laufenden SEO-Betreuung" />
          <div className="sb-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="sb-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="sb-section sb-final">
          <div className="sb-final-card sb-surface" data-sb-reveal>
            <div className="sb-final-glow" aria-hidden="true" />
            <span className="sb-label">PROJEKTANFRAGE</span>
            <h2>Klären wir, welcher laufende SEO-Rahmen zu Ihrer Website passt.</h2>
            <p>
              Die Anfrage ist unverbindlich. Im Projekt-Check ordnen Sie vorhandene Grundlage,
              Website und gewünschten Umfang ein. Eine sofortige Analyse, Eignungszusage oder
              Preisberechnung ist damit nicht verbunden.
            </p>
            <ProjectCheckButton>
              {CTA_LABEL} <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail? <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="sb-home-link" href="/preise">Alle Preise und Leistungen im Überblick</a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBar visible={pastHero && !reachedFinal} />
    </div>
  );
}
