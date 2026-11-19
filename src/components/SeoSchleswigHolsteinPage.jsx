import { ArrowRight, Check, ChevronDown, FileText, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { useScrolledPast } from "./useScrolledPast";
import { ROUTES, SITE_URL } from "../routes.config";
import "./SeoSchleswigHolsteinPage.css";

const PATH = "/seo-schleswig-holstein";
const PAGE_URL = `${SITE_URL}${PATH}`;
const route = ROUTES.find(({ path }) => path === PATH);

// Hero visual "Regionale Sichtbarkeit als System": three layers with abstract,
// unlabelled nodes. Positions are schematic (percent of the track width) and stand
// for roles, never for real places, customers, shares or rankings.
const systemLayers = [
  { id: "standorte", name: "Standorte", note: "nur reale Niederlassungen", nodes: [26, 68], active: 68 },
  { id: "regionen", name: "Regionen", note: "nur bei eigener Suchintention", nodes: [14, 38, 62, 86], active: 62 },
  { id: "themen", name: "Leistungen & Themen", note: "als fachliche Basis", nodes: [10, 30, 50, 70, 90], active: 50 },
];

// [x1, x2, row] – row 0 links Standorte to Regionen, row 1 Regionen to Leistungen & Themen.
const systemLinks = [
  [26, 14, 0], [26, 38, 0], [68, 86, 0],
  [14, 10, 1], [14, 30, 1], [38, 30, 1], [62, 70, 1], [86, 90, 1],
];
const activeLinks = [[68, 62, 0], [62, 50, 1]];
const LAYER_Y = [16.667, 50, 83.333];

const marketSituations = [
  {
    title: "Mehrere Leistungen auf einer allgemeinen Seite",
    text: "Verschiedene Leistungen teilen sich eine einzige Seite. Für keine davon entsteht eine klare Antwort auf die jeweilige Suchanfrage.",
  },
  {
    title: "Mehrere Regionen ohne Seitenstruktur",
    text: "Das Unternehmen bedient mehrere Regionen, aber es ist nicht festgelegt, welche Seite für welches Gebiet und welchen Suchbegriff zuständig ist.",
  },
  {
    title: "Nahezu identische Ortsseiten",
    text: "Für mehrere reale Standorte existieren Seiten, die sich fast nur im Ortsnamen unterscheiden und unkoordiniert nebeneinanderstehen.",
  },
  {
    title: "Interne Konkurrenz zwischen Seiten",
    text: "Stadt-, Kreis-, Leistungs- und Fachthemen überschneiden sich. Mehrere Seiten konkurrieren intern um dieselben Begriffe.",
  },
];

const setupPhases = [
  {
    title: "Ausgangslage und Suchmarkt prüfen",
    items: [
      "Website, vorhandene Seiten und verfügbare Daten betrachten",
      "Relevante Suchintentionen und das Wettbewerbsumfeld in den Suchergebnissen prüfen",
    ],
  },
  {
    title: "Keywords und Seiten zuordnen",
    items: [
      "Keyword-Map erstellen",
      "Primär- und Sekundärrollen für bestehende oder mögliche Seiten definieren",
      "Überschneidungen und Kannibalisierungsrisiken kennzeichnen",
    ],
  },
  {
    title: "Maßnahmen priorisieren",
    items: [
      "Technische, strukturelle und inhaltliche Schritte ordnen",
      "Abhängigkeiten und sinnvolle Reihenfolge dokumentieren",
      "Ergebnisse verständlich besprechen",
    ],
  },
];

const setupResults = [
  "Schriftliche Keyword-Map",
  "Priorisierter Maßnahmenplan",
  "Entscheidungsgrundlage für eine separate Umsetzung",
];

const tiers = [
  {
    id: "standorte",
    name: "Standorte",
    title: "Reale Standorte",
    items: [
      "Nur echte Niederlassungen und tatsächlich bediente Standorte verwenden",
      "Unternehmensprofile und lokale Signale standortbezogen behandeln",
      "Keine virtuellen Standorte suggerieren",
    ],
  },
  {
    id: "regionen",
    name: "Regionen",
    title: "Einzugsgebiete und Regionen",
    items: [
      "Regionale Zielseiten nur bei eigenständiger Suchintention, Leistung und Substanz",
      "Kreis-, Stadt- und Landesebene nicht wahllos vervielfachen",
      "Liefergebiet nicht mit dem Unternehmensstandort verwechseln",
    ],
  },
  {
    id: "themen",
    name: "Leistungen & Themen",
    title: "Leistungen und Fachthemen",
    items: [
      "Starke Leistungsseiten als fachliche Basis",
      "Regionale Seiten mit den relevanten Leistungsseiten verknüpfen",
      "Ratgeber- oder Fachinhalte nur ergänzen, wenn sie einen eigenen Informationsauftrag erfüllen",
    ],
  },
];

const scopes = [
  {
    tag: "Ein Ort",
    title: "Local SEO",
    text: "Für reale Standorte und lokale Suchintentionen. Website und Standortsignale werden zusammen betrachtet. Die Pflege eines Unternehmensprofils ist ein optionaler Baustein, der nur nach Vereinbarung dazugehört.",
  },
  {
    tag: "Mehrere Märkte",
    title: "Regionale oder landesweite SEO",
    text: "Für größere Einzugsgebiete und mehrere regionale Märkte. Der Schwerpunkt liegt auf Seitenarchitektur, Leistungszuordnung und regionaler Relevanz.",
    focus: true,
  },
  {
    tag: "Ohne Ortsbezug",
    title: "Deutschlandweite Fachthemen",
    text: "Fach- oder Leistungsseiten statt künstlicher Ortsvarianten. Nicht jede Leistung muss regionalisiert werden.",
  },
];

const cases = [
  {
    title: "Ein Standort, größeres Servicegebiet",
    text: "Ein Betrieb arbeitet von einem Standort aus in einem Gebiet, das deutlich über den eigenen Ort hinausreicht.",
  },
  {
    title: "Mehrere reale Standorte",
    text: "Ein Unternehmen ist an mehreren Standorten tatsächlich vertreten und braucht dafür abgestimmte statt austauschbare Seiten.",
  },
  {
    title: "Regionale und fachliche Suchmärkte",
    text: "Ein B2B-Dienstleister wird teils nach Region, teils nach Fachthema gesucht und muss beides sauber zuordnen.",
  },
  {
    title: "Viele ähnliche Seiten",
    text: "Eine bestehende Website enthält viele ähnliche Standort- oder Leistungsseiten, deren Rollen nie festgelegt wurden.",
  },
  {
    title: "Schrittweises Wachstum in weitere Regionen",
    text: "Ein Unternehmen ist lokal sichtbar und möchte weitere Regionen nacheinander erschließen, ohne die bestehende Struktur zu verwässern.",
  },
];

const steps = [
  {
    title: "Ziele und Gebiete klären",
    text: "Ziele, Leistungen, reale Standorte und Einzugsgebiete werden gemeinsam festgehalten.",
  },
  {
    title: "Website und Suchmarkt prüfen",
    text: "Website, Suchmarkt und vorhandene Daten werden betrachtet, soweit der Zugang besteht.",
  },
  {
    title: "Keyword-Map und Prioritäten entwickeln",
    text: "Suchbegriffe werden Seiten zugeordnet, Maßnahmen in eine Reihenfolge gebracht.",
  },
  {
    title: "Ergebnisse digital besprechen",
    text: "Sie erhalten die Unterlagen und gehen sie mit TigerFlow in einem digitalen Gespräch durch.",
  },
  {
    title: "Umsetzung separat auswählen",
    text: "Welche Maßnahmen umgesetzt, freigegeben und gemessen werden, vereinbaren Sie gesondert.",
    separate: true,
  },
];

const measures = [
  {
    title: "Technische Zugänglichkeit und Indexierung",
    text: "Können die wichtigen Seiten gefunden und verarbeitet werden?",
  },
  {
    title: "Sichtbarkeit für relevante Suchanfragen",
    text: "Erscheinen die Seiten bei den Suchanfragen, die zu Leistung und Region passen?",
  },
  {
    title: "Qualifizierte organische Klicks",
    text: "Kommen Besucher, deren Anliegen zum Angebot passt?",
  },
  {
    title: "Gewünschte Handlungen und Projektanfragen",
    text: "Führen Besuche zu Kontaktaufnahmen und Anfragen?",
    business: true,
  },
  {
    title: "Angebote, gewonnene Kunden und Umsatz",
    text: "Soweit belastbar zuordenbar, wird die Suche mit konkreten Aufträgen verbunden.",
    business: true,
  },
];

const included = [
  "Analyse der Ausgangslage",
  "Prüfung relevanter Suchbegriffe und Suchintentionen",
  "Betrachtung von Wettbewerb und Suchergebnisseiten",
  "Keyword- und Seitenzuordnung",
  "Schriftliche Keyword-Map",
  "Priorisierter Maßnahmenplan",
  "Verständliche Besprechung der Ergebnisse",
];

const notIncluded = [
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
];

const optional = [
  "Technische und inhaltliche Umsetzung priorisierter Maßnahmen",
  "Überarbeitung bestehender Leistungs-, Standort- und Themenseiten",
  "Neue SEO-Zielseiten, wenn Suchauftrag und eigenständiger Inhalt dies rechtfertigen",
  "Local SEO für reale Standorte, wenn passend und vereinbart",
  "Monitoring und laufende Onpage-Betreuung",
  "Verbindung mit einem Webdesign- oder Relaunchprojekt",
  "Offpage-Leistungen nur nach separater Prüfung und Vereinbarung",
];

const faqs = [
  {
    question: "Was kostet SEO bei TigerFlow?",
    answer:
      "Das SEO-Setup beginnt bei 499 € netto zuzüglich Umsatzsteuer. Den genauen Festpreis nennen wir nach der Bedarfsklärung, weil Websiteumfang, Zahl der Regionen und Ausgangslage den Aufwand bestimmen. Eine laufende Betreuung wird individuell kalkuliert und ist im Setup nicht enthalten.",
  },
  {
    question: "Was ist im SEO-Setup enthalten?",
    answer:
      "Enthalten sind die Analyse der Ausgangslage, die Prüfung relevanter Suchbegriffe und Suchintentionen, die Betrachtung von Wettbewerb und Suchergebnisseiten, die Keyword- und Seitenzuordnung, eine schriftliche Keyword-Map, ein priorisierter Maßnahmenplan und eine verständliche Besprechung der Ergebnisse.",
  },
  {
    question: "Ist die Umsetzung im Einstiegspreis enthalten?",
    answer:
      "Nein. Das Setup endet mit Keyword-Map und Maßnahmenplan als Grundlage für Ihre Entscheidung. Die technische und inhaltliche Umsetzung wird nach Umfang und Priorität separat vereinbart.",
  },
  {
    question: "Braucht jede Stadt oder Region eine eigene SEO-Seite?",
    answer:
      "Nein. Eine eigene Seite ist nur sinnvoll, wenn es eine eigenständige Suchintention, einen tatsächlichen Leistungsbezug und substanziell eigenen Inhalt gibt. Seiten, die sich nur im Ortsnamen unterscheiden, konkurrieren eher miteinander, als dass sie helfen.",
  },
  {
    question: "Wie unterscheidet sich landesweite SEO von Local SEO?",
    answer:
      "Local SEO konzentriert sich auf reale Standorte und lokale Signale. Landesweite SEO ordnet mehrere Märkte, Regionen, Leistungen und Themen in einer konsistenten Seitenarchitektur. Beides kann sich ergänzen, hat aber unterschiedliche Aufgaben.",
  },
  {
    question: "Kann TigerFlow mehrere Unternehmensstandorte berücksichtigen?",
    answer:
      "Ja, wenn die Standorte real sind. Welche Seiten, Unternehmensprofile oder weiteren Leistungen dazugehören, wird im Projekt geklärt; eine pauschale Zusage dafür gibt es nicht.",
  },
  {
    question: "Muss die Website neu gebaut werden?",
    answer:
      "Nicht automatisch. Die Analyse zeigt, ob die bestehende Grundlage tragfähig ist. Nur wenn Technik oder Struktur dauerhaft Grenzen setzen, kann ein größerer Umbau sinnvoll sein, und darüber entscheiden Sie.",
  },
  {
    question: "Wie läuft die Zusammenarbeit außerhalb von Heide ab?",
    answer:
      "Abstimmung und Ergebnisbesprechung werden digital organisiert. TigerFlow sitzt in Heide und unterhält keine weiteren Niederlassungen. Konkrete Termine und Kanäle vereinbaren wir projektbezogen.",
  },
  {
    question: "Wie lange dauert SEO?",
    answer:
      "Eine pauschale Dauer gibt es nicht. Sie hängt von Ausgangslage, Wettbewerb, Websiteumfang, Umsetzung und der Verarbeitung durch Suchmaschinen ab. Deshalb nennen wir keine festen Fristen.",
  },
  {
    question: "Garantiert TigerFlow bestimmte Rankings oder Anfragen?",
    answer:
      "Nein. TigerFlow kann Analyse, Priorisierung, Umsetzung und Messung vereinbaren, aber keine Suchmaschinen- oder Geschäftsergebnisse garantieren.",
  },
];

// Only visible, confirmed facts: one provider address (Heide), no ratings or results.
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
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "SEO Schleswig-Holstein", item: PAGE_URL },
      ],
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "SEO-Setup",
      serviceType: "Suchmaschinenoptimierung",
      description:
        "Analyse der Ausgangslage, Prüfung relevanter Suchbegriffe und Suchintentionen, Betrachtung von Wettbewerb und Suchergebnisseiten, Keyword- und Seitenzuordnung, schriftliche Keyword-Map, priorisierter Maßnahmenplan und Besprechung der Ergebnisse.",
      url: PAGE_URL,
      areaServed: { "@type": "AdministrativeArea", name: "Schleswig-Holstein" },
      provider: {
        "@type": "Organization",
        name: "TigerFlow",
        url: `${SITE_URL}/`,
        email: "service@tigerflow.de",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rendsburger Straße 22",
          postalCode: "25746",
          addressLocality: "Heide",
          addressCountry: "DE",
        },
      },
      offers: {
        "@type": "Offer",
        url: PAGE_URL,
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: 499,
          priceCurrency: "EUR",
          valueAddedTaxIncluded: false,
          description:
            "Ab 499 € netto zuzüglich Umsatzsteuer; konkreter Festpreis nach der Bedarfsklärung.",
        },
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
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
          const delay = Number(target.dataset.sshOrder ?? 0) * 60;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.remove("ssh-reveal-pending");
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

    page.querySelectorAll("[data-ssh-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("ssh-reveal-pending");
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
    const heroCta = page?.querySelector(".ssh-hero-actions");
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
  { id: "architektur", label: "Architektur" },
  { id: "preis", label: "Preis" },
  { id: "faq", label: "FAQ" },
];

function BrandLink() {
  return (
    <a className="ssh-brand" href="/" aria-label="TigerFlow Startseite">
      <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
      <span>TigerFlow</span>
    </a>
  );
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`ssh-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function PageHeader() {
  return (
    <header className="ssh-nav">
      <BrandLink />
      <nav className="ssh-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath={PATH} />
        {navLinks.map(({ id, label }) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>
      <button
        type="button"
        className="ssh-nav-cta"
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
      className={`ssh-bar ssh-glass${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="ssh-bar-inner">
        <BrandLink />
        <ServiceMegaMenu className="tf-service-menu-bar" currentPath={PATH} />
        <nav className="ssh-bar-links" aria-label="Abschnitte">
          {navLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ProjectCheckButton className="ssh-btn-sm">
          Projekt-Check <ArrowRight size={15} aria-hidden="true" />
        </ProjectCheckButton>
      </div>
    </div>
  );
}

function MobileBar({ visible }) {
  return (
    <div
      className={`ssh-mobile-bar${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="ssh-mobile-bar-price">
        <b>SEO-Setup ab 499{"\u00a0"}€</b>
        <span>netto zzgl. USt.</span>
      </div>
      <ProjectCheckButton>
        Projekt-Check <ArrowRight size={16} aria-hidden="true" />
      </ProjectCheckButton>
    </div>
  );
}

// Decorative system map. Its statement is repeated as real text in #architektur.
function SystemVisual() {
  return (
    <div className="ssh-system-visual" aria-hidden="true">
      <div className="ssh-system-head">
        <b>REGIONALE SICHTBARKEIT ALS SYSTEM</b>
        <em>Schematische Darstellung</em>
      </div>
      <div className="ssh-system-stage">
        <svg className="ssh-links" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          {systemLinks.map(([x1, x2, row]) => (
            <line key={`${x1}-${x2}-${row}`} x1={x1} y1={LAYER_Y[row]} x2={x2} y2={LAYER_Y[row + 1]} />
          ))}
          {activeLinks.map(([x1, x2, row]) => (
            <line
              key={`active-${row}`}
              className="ssh-link-active"
              x1={x1}
              y1={LAYER_Y[row]}
              x2={x2}
              y2={LAYER_Y[row + 1]}
            />
          ))}
        </svg>
        {systemLayers.map((layer, index) => (
          <div className="ssh-layer" key={layer.id} data-ssh-layer={layer.id} style={{ "--ssh-i": index }}>
            <div className="ssh-layer-key">
              <i className="ssh-glyph" />
              <span className="ssh-layer-name">{layer.name}</span>
              <span className="ssh-layer-note">{layer.note}</span>
            </div>
            <div className="ssh-track">
              {layer.nodes.map((x) => (
                <i
                  key={x}
                  className={`ssh-node${x === layer.active ? " is-active" : ""}`}
                  style={{ left: `${x}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="ssh-system-foot">
        Ein Suchmarkt entsteht, wo Standort, Region und Leistung zusammenpassen.
      </p>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`ssh-intro ${className}`.trim()} data-ssh-reveal>
      <span className="ssh-label">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function ScopeList({ title, items, icon: Icon, tone }) {
  return (
    <div className={`ssh-scope ssh-scope-${tone}`} data-ssh-scope={tone}>
      <h3>{title}</h3>
      <ul role="list">
        {items.map((item) => (
          <li key={item}>
            <Icon size={15} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeoSchleswigHolsteinPage() {
  const pageRef = useReveal();
  const { pastHero, reachedFinal } = useScrollChrome(pageRef);
  // The section bar also covers the gap between the static header and the hero button.
  const pastHeader = useScrolledPast(80);
  const activeSection = useActiveSection(pageRef);

  return (
    <div ref={pageRef} className="ssh-page" style={{ background: C.pageBg, color: C.textPri }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="ssh-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />
      <FloatingBar visible={pastHero || pastHeader} active={activeSection} />

      <main id="inhalt" tabIndex={-1}>
        <section className="ssh-hero">
          <div className="ssh-hero-bg" aria-hidden="true" />
          <div className="ssh-hero-copy">
            <span className="ssh-eyebrow">SEO FÜR SCHLESWIG-HOLSTEIN</span>
            <h1>
              <span>SEO für Schleswig-Holstein:</span>{" "}
              <span>Sichtbarkeit mit klarer Seitenstrategie.</span>
            </h1>
            <p className="ssh-lead">
              TigerFlow analysiert Suchmärkte, Seitenstruktur und technische Grundlagen und
              entwickelt daraus eine priorisierte SEO-Roadmap für Unternehmen mit regionalem oder
              landesweitem Einzugsgebiet.
            </p>
            <div className="ssh-hero-actions">
              <ProjectCheckButton>
                SEO-Ausgangslage prüfen <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="ssh-text-link" href="#suchmarkt">Typische Ausgangslagen ansehen</a>
            </div>
            <div className="ssh-entry">
              <p className="ssh-entry-price">
                <strong>SEO-Setup ab 499 € netto</strong>
                <span>zzgl. USt. · konkreter Festpreis nach Bedarfsklärung</span>
              </p>
              <p className="ssh-entry-limit">
                Analyse, Keyword-Map und priorisierter Maßnahmenplan. Umsetzung und laufende
                Betreuung werden separat vereinbart.
              </p>
            </div>
          </div>
          <SystemVisual />
        </section>

        <section id="suchmarkt" className="ssh-section">
          <SectionIntro
            className="ssh-intro-split"
            eyebrow="SUCHMARKT"
            title="Wenn ein Suchmarkt größer ist als ein einzelner Ort"
            text="Wer Kunden in mehreren Städten, Kreisen oder im ganzen Bundesland erreichen möchte, trifft auf unterschiedliche Suchintentionen. Zusätzliche Ortsnamen auf bestehenden Seiten lösen das nicht: Leistungen, Standorte und Themen brauchen eindeutige Seitenrollen."
          />
          <ol className="ssh-ledger" role="list">
            {marketSituations.map(({ title, text }, index) => (
              <li key={title} data-ssh-reveal data-ssh-order={index % 2}>
                <span className="ssh-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="ssh-aside" data-ssh-reveal>
            Nicht jeder Ort benötigt eine eigene Zielseite. Entscheidend ist, ob Suchintention,
            Leistung und Inhalt eigenständig genug sind.
          </p>
        </section>

        <section id="setup" className="ssh-section ssh-band">
          <SectionIntro
            eyebrow="SEO-SETUP"
            title="Was das SEO-Setup liefert"
            text="Das SEO-Setup ist der Einstieg in die SEO-Beratung für Unternehmen in Schleswig-Holstein. Es endet mit schriftlichen Unterlagen, nicht mit der Umsetzung: Was danach folgt, entscheiden Sie."
          />
          <ol className="ssh-phases" role="list">
            {setupPhases.map(({ title, items }, index) => (
              <li key={title} data-ssh-reveal data-ssh-order={index}>
                <span className="ssh-phase-node" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <ul role="list">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </li>
            ))}
          </ol>
          <div className="ssh-result" data-ssh-reveal>
            <span className="ssh-label">SICHTBARES ENDERGEBNIS</span>
            <ul role="list">
              {setupResults.map((item) => (
                <li key={item}>
                  <FileText size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="architektur" className="ssh-section">
          <SectionIntro
            className="ssh-intro-split"
            eyebrow="SEITENARCHITEKTUR"
            title="Eine Architektur für Standorte, Leistungen und Themen"
            text="Landesweite Suchmaschinenoptimierung ist vor allem eine Ordnungsaufgabe. Drei Ebenen bekommen jeweils eine eigene Rolle und werden gezielt miteinander verknüpft, statt dieselbe Ortsseite für jede Region zu wiederholen."
          />
          <div className="ssh-tiers ssh-surface" data-ssh-reveal>
            <p className="ssh-tiers-head">
              <span className="ssh-label">REGIONALE SICHTBARKEIT ALS SYSTEM</span>
              <span>Drei Ebenen, jede mit eigener Rolle</span>
            </p>
            <ol role="list">
              {tiers.map(({ id, name, title, items }) => (
                <li key={id} data-ssh-tier={id}>
                  <div className="ssh-tier-key">
                    <i className="ssh-glyph" aria-hidden="true" />
                    <span className="ssh-tier-name">{name}</span>
                  </div>
                  <div className="ssh-tier-body">
                    <h3>{title}</h3>
                    <ul role="list">
                      {items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="ssh-aside" data-ssh-reveal>
            Die Darstellung ist schematisch. Sie zeigt Rollen und Verknüpfungen, keine Standorte,
            Marktanteile oder Rankings.
          </p>
        </section>

        <section id="abgrenzung" className="ssh-section ssh-band">
          <SectionIntro
            eyebrow="ABGRENZUNG"
            title="Local SEO, regionale SEO und Fachthemen sauber trennen"
            text="Die drei Begriffe beschreiben unterschiedliche Aufgaben. Welche davon für Ihr Unternehmen zählt, bestimmt, welche Seiten sinnvoll sind."
          />
          <div className="ssh-compare">
            {scopes.map(({ tag, title, text, focus }, index) => (
              <article key={title} className={focus ? "is-focus" : undefined} data-ssh-reveal data-ssh-order={index}>
                <span className="ssh-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {focus && <em>Thema dieser Seite</em>}
              </article>
            ))}
          </div>
          <a className="ssh-link-row" href="/seo-heide" data-ssh-reveal>
            <span>Lokale SEO-Leistung für Unternehmen in Heide ansehen</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="situationen" className="ssh-section ssh-cases-section">
          <SectionIntro
            eyebrow="EIGNUNG"
            title="Für welche Situationen die landesweite Strategie sinnvoll sein kann"
            text="Eine regionale SEO-Strategie, etwa SEO für mehrere Standorte oder größere Einzugsgebiete, lohnt sich nicht für jedes Unternehmen. Diese fünf Situationen sprechen dafür, sie zumindest zu prüfen."
          />
          <div className="ssh-cases-body">
            <ol className="ssh-cases" role="list">
              {cases.map(({ title, text }, index) => (
                <li key={title} data-ssh-reveal data-ssh-order={index}>
                  <span className="ssh-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="ssh-note" data-ssh-reveal>
              Typische Situationen, keine Kundenbeispiele und keine Projektergebnisse.
            </p>
          </div>
        </section>

        <section id="zusammenarbeit" className="ssh-section ssh-band">
          <SectionIntro
            className="ssh-intro-split"
            eyebrow="ZUSAMMENARBEIT"
            title="Zusammenarbeit in Schleswig-Holstein – digital und nachvollziehbar"
            text="TigerFlow arbeitet aus Heide digital mit Unternehmen in Schleswig-Holstein zusammen. Weitere Niederlassungen gibt es nicht, und für die Abstimmung ist kein Vor-Ort-Termin vorausgesetzt."
          />
          <ol className="ssh-steps" role="list">
            {steps.map(({ title, text, separate }, index) => (
              <li key={title} className={separate ? "is-separate" : undefined} data-ssh-reveal data-ssh-order={index}>
                <span className="ssh-step-node" aria-hidden="true">{index + 1}</span>
                {separate && <em>Separat vereinbart</em>}
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="ssh-aside" data-ssh-reveal>
            Termine und Kanäle werden projektbezogen vereinbart. Eine pauschale Projektdauer oder
            feste Reaktionszeit nennen wir bewusst nicht.
          </p>
        </section>

        <section id="preis" className="ssh-section">
          <div className="ssh-price ssh-surface" data-ssh-reveal>
            <div className="ssh-price-head">
              <div className="ssh-price-copy">
                <span className="ssh-label">PREIS UND LEISTUNGSGRENZEN</span>
                <h2>Transparenter Einstieg ab 499 € netto</h2>
                <p>
                  Wer eine SEO-Agentur in Schleswig-Holstein sucht, sollte Preis, Ergebnis und
                  Grenzen des Einstiegs vorab kennen. Das SEO-Setup beginnt bei 499 € netto
                  zuzüglich Umsatzsteuer. Der konkrete Festpreis entsteht nach der Bedarfsklärung.
                </p>
              </div>
              <div className="ssh-price-panel">
                <small>SEO-Setup</small>
                <strong><em>ab</em> 499 €</strong>
                <span>netto zzgl. USt.</span>
                <ProjectCheckButton className="ssh-btn-block">
                  SEO-Projekt unverbindlich anfragen <ArrowRight size={16} aria-hidden="true" />
                </ProjectCheckButton>
              </div>
            </div>
            <div className="ssh-scopes">
              <ScopeList title="Im SEO-Setup enthalten" items={included} icon={Check} tone="in" />
              <ScopeList title="Nicht automatisch enthalten" items={notIncluded} icon={Minus} tone="out" />
              <ScopeList title="Optional und separat vereinbart" items={optional} icon={Plus} tone="opt" />
            </div>
          </div>
          <p className="ssh-aside" data-ssh-reveal>
            Laufende SEO-Betreuung wird individuell kalkuliert. Soweit sie vereinbart wird, gilt
            eine Mindestlaufzeit von sechs Monaten. Offpage-Leistungen und Fremdkosten werden
            separat geprüft, vereinbart und ausgewiesen.
          </p>
          <a className="ssh-link-row" href="/seo-betreuung" data-ssh-reveal>
            <span>Monitoring, Onpage-Optimierung und Monatsbericht im Detail</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="website" className="ssh-section ssh-band">
          <SectionIntro
            eyebrow="SEO UND WEBSITE"
            title="Wenn SEO und Website zusammen gedacht werden müssen"
            text="Ob eine Website optimiert oder umgebaut wird, folgt aus der Analyse und nicht aus einer pauschalen Neubauempfehlung."
          />
          <div className="ssh-paths">
            <article data-ssh-reveal>
              <h3>Die bestehende Website trägt</h3>
              <p>
                Eine tragfähige bestehende Website kann optimiert werden. Technische SEO und
                Onpage-SEO setzen dann am Bestand an.
              </p>
            </article>
            <article data-ssh-reveal data-ssh-order="1">
              <h3>Die Struktur setzt Grenzen</h3>
              <p>
                Technische oder strukturelle Grenzen können einen größeren Umbau sinnvoll machen.
                Ob das so ist, zeigt die Analyse, und die Entscheidung liegt bei Ihnen.
              </p>
            </article>
          </div>
          <div className="ssh-link-rows" data-ssh-reveal>
            <a className="ssh-link-row" href="/webdesign-schleswig-holstein">
              <span>Webdesign für Unternehmen in Schleswig-Holstein</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="ssh-link-row" href="/preise">
              <span>Preise und Leistungsrahmen ansehen</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section id="erfolgsmessung" className="ssh-section">
          <SectionIntro
            className="ssh-intro-split"
            eyebrow="ERFOLGSMESSUNG"
            title="Erfolg wird nicht nur an Rankings gemessen"
            text="Rankings und Traffic sind Zwischensignale. Bewertet wird in dieser Reihenfolge, soweit sich Ergebnisse belastbar zuordnen lassen."
          />
          <ol className="ssh-measure" role="list">
            {measures.map(({ title, text, business }, index) => (
              <li key={title} className={business ? "is-business" : undefined} data-ssh-reveal data-ssh-order={index}>
                <span className="ssh-measure-node" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="ssh-aside" data-ssh-reveal>
            Rankings und Traffic sind kein garantiertes Geschäftsergebnis. TigerFlow sagt weder
            bestimmte Positionen noch Klicks, Anfragen oder Umsatz zu.
          </p>
        </section>

        <section id="faq" className="ssh-section ssh-band ssh-faq-section">
          <SectionIntro
            eyebrow="FAQ"
            title={<>Häufige Fragen zu SEO in <span className="ssh-nowrap">Schleswig-Holstein</span></>}
          />
          <div className="ssh-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="ssh-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="ssh-section ssh-final">
          <div className="ssh-final-card ssh-surface" data-ssh-reveal>
            <div className="ssh-final-glow" aria-hidden="true" />
            <span className="ssh-label">PROJEKTANFRAGE</span>
            <h2>Klären wir, welche Suchmärkte und Seiten für Ihr Unternehmen wirklich sinnvoll sind.</h2>
            <p>
              Die Projektanfrage ist unverbindlich. Im Projekt-Check erfassen Sie Ausgangslage,
              Regionen und gewünschte Leistungen; danach klären wir gemeinsam, ob und in welchem
              Umfang ein SEO-Setup passt.
            </p>
            <ProjectCheckButton>
              SEO-Ausgangslage prüfen <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail? <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="ssh-home-link" href="/">
              TigerFlow im Überblick: Webdesign, SEO und Automatisierung
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBar visible={pastHero && !reachedFinal} />
    </div>
  );
}
