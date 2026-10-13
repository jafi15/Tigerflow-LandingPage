import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Compass,
  FileSearch,
  Globe2,
  Layers,
  ListOrdered,
  MapPin,
  Minus,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./SeoHeidePage.css";

const PAGE_URL = `${SITE_URL}/seo-heide`;
const route = ROUTES.find(({ path }) => path === "/seo-heide");

const mapRows = [
  { intent: "Anbieter finden", page: "Leistungsseite", priority: "Zuerst" },
  { intent: "Preis und Ablauf prüfen", page: "Angebot und Einstieg", priority: "Danach" },
  { intent: "Ort und Erreichbarkeit", page: "Standortbezug", priority: "Danach" },
  { intent: "Offene Fragen klären", page: "FAQ-Bereich", priority: "Später" },
];

const situations = [
  {
    title: "Falsche oder fehlende Zielseiten",
    text: "Mehrere Leistungen stehen vermischt auf einer einzigen Seite, oder für eine gesuchte Leistung gibt es keine passende Seite. Besucher und Suchmaschinen finden dann keine klare Antwort.",
  },
  {
    title: "Unklare Keyword- und Themenzuordnung",
    text: "Es ist nicht festgelegt, welche Suchbegriffe zu welcher Seite gehören. Seiten überschneiden sich oder lassen offen, was Suchende eigentlich erwarten.",
  },
  {
    title: "Technische Hindernisse",
    text: "Technik, Inhalte und interne Verlinkung wurden nie systematisch geprüft. Schon Zugänglichkeit und Indexierung können begrenzen, was überhaupt sichtbar werden kann.",
  },
  {
    title: "Schwacher Weg von der Suche zur Anfrage",
    text: "Es gibt Besucher oder Impressionen, aber keine belastbare Verbindung zu Anfragen und Aufträgen. Kontaktwege sind schwer zu finden oder unklar beschrieben.",
  },
];

const deliverables = [
  {
    title: "Ausgangsanalyse",
    text: "Website, Seitenstruktur, Technik und vorhandene Daten werden betrachtet, soweit der Zugang besteht.",
  },
  {
    title: "Suchintention und Wettbewerb",
    text: "Welche Suchbegriffe sind relevant, was erwarten Suchende, und was zeigen die Suchergebnisseiten (SERP) der Wettbewerber?",
  },
  {
    title: "Keyword-Map",
    text: "Eine schriftliche Zuordnung von Suchbegriffen zu Themen und Seiten statt einer losen Wortliste.",
  },
  {
    title: "Seiten- und Themenzuordnung",
    text: "Welche Seite übernimmt welche Suchanfrage, und wo fehlt eine eigene Zielseite?",
  },
  {
    title: "Priorisierter Maßnahmenplan",
    text: "Maßnahmen nach Bedeutung, Aufwand und Reihenfolge sortiert, damit klar ist, was zuerst sinnvoll ist.",
  },
  {
    title: "Ergebnisbesprechung",
    text: "Die Ergebnisse werden verständlich erklärt. Danach entscheiden Sie, was umgesetzt wird und von wem.",
  },
];

const localSignals = [
  {
    title: "Leistungs- und Standortzuordnung",
    text: "Auf der Website ist klar benannt, welche Leistung Sie wo anbieten.",
  },
  {
    title: "Konsistente Unternehmensdaten",
    text: "Name, Anschrift und Kontaktdaten stimmen auf Website und in Einträgen überein.",
  },
  {
    title: "Google-Unternehmensprofil, wenn vereinbart",
    text: "Pflege und Abgleich mit der Website als optionaler Baustein.",
  },
  {
    title: "Lokale Zielseiten nur bei echtem Leistungsbezug",
    text: "Keine austauschbaren Ortsseiten ohne eigenen Inhalt.",
  },
  {
    title: "Technische Grundlage und strukturierte Daten, wenn sinnvoll",
    text: "Gut crawlbare, mobil nutzbare Seiten mit passender Auszeichnung.",
  },
  {
    title: "Verständliche Kontakt- und Anfragewege",
    text: "Wer gefunden wird, soll ohne Umwege Kontakt aufnehmen können.",
  },
];

const steps = [
  {
    title: "Ziele und Ausgangslage klären",
    text: "Welche Leistungen sollen gefunden werden, für welche Region, und was ist bereits vorhanden?",
  },
  {
    title: "Website, Suchmarkt und bestehende Daten prüfen",
    text: "Struktur, Technik, Suchergebnisseiten und vorhandene Daten, etwa aus der Search Console, soweit zugänglich.",
  },
  {
    title: "Keyword-Map und Prioritäten entwickeln",
    text: "Suchbegriffe werden Seiten zugeordnet, Maßnahmen nach Reihenfolge und Aufwand sortiert.",
  },
  {
    title: "Ergebnisse besprechen und Umsetzung entscheiden",
    text: "Sie sehen die Ergebnisse, stellen Fragen und entscheiden, was als Nächstes passiert.",
  },
  {
    title: "Optional umsetzen, messen und weiterentwickeln",
    text: "Wenn vereinbart, setzt TigerFlow priorisierte Maßnahmen um und wertet aus, was sie bewirken.",
    optional: true,
  },
];

const included = [
  "Analyse der Ausgangslage",
  "Prüfung relevanter Suchbegriffe und Suchintentionen",
  "Betrachtung von Wettbewerb und Suchergebnisseiten (SERP)",
  "Keyword- und Seitenzuordnung",
  "Schriftliche Keyword-Map",
  "Schriftlicher, priorisierter Maßnahmenplan",
  "Verständliche Ergebnisbesprechung",
];

const notIncluded = [
  "Umsetzung sämtlicher Empfehlungen",
  "Unbegrenzt viele Seiten, Texte und neue Inhalte",
  "Laufende SEO-Betreuung",
  "Linkaufbau und Offpage-Maßnahmen",
  "Bezahlte Anzeigen",
  "Rechtsprüfung",
  "Arbeiten an nicht zugänglichen Fremdsystemen",
  "Garantie für Rankings, Traffic, Leads oder Umsatz",
];

const optional = [
  "Technische und inhaltliche Umsetzung priorisierter Maßnahmen",
  "Neue SEO-Zielseiten und Überarbeitung bestehender Seiten",
  "Local SEO und Google-Unternehmensprofil, wenn passend und vereinbart",
  "Monitoring und laufende Onpage-Betreuung",
  "Verbindung mit Website-Redesign oder Webdesign-Projekt",
  "Drittanbieter- und Toolkosten, transparent und separat ausgewiesen",
];

const measures = [
  {
    title: "Indexierung und technische Zugänglichkeit",
    text: "Kann die Seite gefunden und von Suchmaschinen verarbeitet werden?",
  },
  {
    title: "Sichtbarkeit für relevante Suchanfragen",
    text: "Erscheint sie bei den Suchanfragen, die zum Angebot passen?",
  },
  {
    title: "Qualifizierter organischer Traffic",
    text: "Kommen Besucher, die zum Angebot passen, statt nur viele Besucher?",
  },
  {
    title: "Anfragen und gewünschte Handlungen",
    text: "Nehmen Besucher Kontakt auf oder führen die gewünschte Handlung aus?",
  },
  {
    title: "Angebote, gewonnene Kunden und Umsatz, soweit messbar",
    text: "Wo Daten vorliegen, wird die Suche mit konkreten Aufträgen verbunden.",
  },
];

const faqs = [
  {
    question: "Was kostet SEO bei TigerFlow?",
    answer:
      "Der Einstieg, das SEO-Setup, beginnt bei 499 € netto zuzüglich Umsatzsteuer. Den individuellen Festpreis nennen wir nach einer Bedarfsklärung, weil Websiteumfang und Ausgangslage den Aufwand bestimmen. Umsetzung und laufende Betreuung sind darin nicht enthalten und werden separat vereinbart.",
  },
  {
    question: "Was ist im SEO-Setup enthalten?",
    answer:
      "Enthalten sind die Analyse der Ausgangslage, die Prüfung relevanter Suchbegriffe und Suchintentionen, die Betrachtung von Wettbewerb und Suchergebnisseiten, eine schriftliche Keyword-Map mit Seitenzuordnung, ein priorisierter Maßnahmenplan und eine verständliche Besprechung der Ergebnisse.",
  },
  {
    question: "Ist die Umsetzung im Preis enthalten?",
    answer:
      "Nein. Das SEO-Setup liefert die Entscheidungsgrundlage. Technische und inhaltliche Umsetzung, neue Zielseiten, die Überarbeitung bestehender Seiten sowie Local SEO und das Google-Unternehmensprofil sind optionale Erweiterungen, die separat vereinbart werden, wenn sie passen.",
  },
  {
    question: "Wie lange dauert SEO?",
    answer:
      "Das lässt sich nicht pauschal sagen. Der Zeitrahmen hängt unter anderem von Websiteumfang, Datenzugängen und Abstimmungen ab, und Veränderungen in Suchmaschinen zeigen sich nicht sofort. Deshalb nennen wir keine pauschalen Fristen oder Zusagen, sondern stimmen den Ablauf vor der Beauftragung ab.",
  },
  {
    question: "Kann TigerFlow eine bestehende Website optimieren?",
    answer:
      "Ja. Das SEO-Setup beginnt mit Ihrer vorhandenen Website: Struktur, Inhalte, Technik und interne Verlinkung werden geprüft. Daraus entsteht ein priorisierter Plan, den Sie selbst, mit Ihrem bisherigen Dienstleister oder, wenn vereinbart, mit TigerFlow umsetzen können.",
  },
  {
    question: "Ist ein Website-Neubau erforderlich?",
    answer:
      "Nicht automatisch. Wenn die bestehende Technik tragfähig ist, bauen wir darauf auf. Nur wenn die Analyse zeigt, dass Grundlage oder Struktur Sichtbarkeit und Anfragen dauerhaft bremsen, empfehlen wir eine Erneuerung, und die Entscheidung darüber liegt bei Ihnen.",
  },
  {
    question: "Was ist Local SEO?",
    answer:
      "Local SEO macht ein Unternehmen für Suchanfragen mit Ortsbezug auffindbar, etwa in Heide und Umgebung. Dazu gehören eine klare Zuordnung von Leistung und Standort auf der Website, konsistente Unternehmensdaten, bei Bedarf das Google-Unternehmensprofil und verständliche Kontaktwege. Das Profil ist ein Baustein, nicht das ganze Thema.",
  },
  {
    question: "Kann TigerFlow Platz 1 bei Google garantieren?",
    answer:
      "Nein. Niemand kann Platz 1 bei Google, bestimmte Rankings, Traffic, Anfragen oder Umsatz garantieren, weil Suchergebnisse von Suchmaschinen, Wettbewerb und vielen weiteren Faktoren abhängen. TigerFlow gibt keine solche Garantie, sondern macht Maßnahmen nachvollziehbar und ihre Wirkung messbar, soweit Daten vorliegen.",
  },
  {
    question: "Bietet TigerFlow laufende SEO-Betreuung an?",
    answer:
      "Ja, optional und getrennt vom SEO-Setup. Monitoring und laufende Onpage-Betreuung werden individuell kalkuliert. Soweit eine Betreuung vereinbart wird, gilt eine Mindestlaufzeit von sechs Monaten. Offpage-Leistungen wie Linkaufbau werden gesondert behandelt.",
  },
  {
    question: "Welche Zugänge und Daten werden benötigt?",
    answer:
      "Hilfreich sind der Zugang zu Ihrer Website beziehungsweise zum Content-Management, die Google Search Console und Webanalyse-Daten, soweit vorhanden, sowie bei gewünschtem Local SEO das Google-Unternehmensprofil. Arbeiten an Systemen, auf die kein Zugriff besteht, sind nicht Teil des Setups.",
  },
];

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
        { "@type": "ListItem", position: 2, name: "SEO Heide", item: PAGE_URL },
      ],
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "SEO-Setup",
      serviceType: "Suchmaschinenoptimierung",
      description:
        "Analyse der Ausgangslage, Suchbegriffe und Suchintention, Wettbewerb und Suchergebnisseiten, schriftliche Keyword-Map mit Seitenzuordnung, priorisierter Maßnahmenplan und Ergebnisbesprechung.",
      url: PAGE_URL,
      areaServed: { "@type": "City", name: "Heide" },
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

// Same mechanism as ServiceMegaMenu's "Projekt einordnen" trigger.
function openProjectCheck(event) {
  window.dispatchEvent(
    new CustomEvent("tigerflow:open-project-check", {
      detail: { trigger: event.currentTarget },
    })
  );
}

// Below-the-fold items start hidden and fade up once, only when JS can reveal
// them again; without JS, with reduced motion or in initial HTML they stay visible.
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
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const delay = Number(target.dataset.shOrder ?? 0) * 55;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.remove("sh-reveal-pending");
          // Drop the stagger delay afterwards so hover feedback stays instant.
          const timer = window.setTimeout(() => {
            target.style.removeProperty("transition-delay");
            timers.delete(timer);
          }, delay + 340);
          timers.add(timer);
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    page.querySelectorAll("[data-sh-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("sh-reveal-pending");
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return ref;
}

// Floating chrome appears once the hero CTA has scrolled away. The mobile bar also
// hides again at the closing CTA section, so there is never a duplicate CTA on screen.
function useScrollChrome(pageRef) {
  const [chrome, setChrome] = useState({ pastHero: false, reachedFinal: false });

  useEffect(() => {
    const page = pageRef.current;
    const heroCta = page?.querySelector(".sh-hero-actions");
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

const topbarLinks = [
  { id: "ablauf", label: "Ablauf" },
  { id: "preis", label: "Preis" },
  { id: "faq", label: "FAQ" },
];

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

function StickyHeader({ visible, active }) {
  return (
    <header className={`sh-topbar${visible ? " is-visible" : ""}`} inert={!visible}>
      <div className="sh-topbar-inner">
        <a className="sh-brand" href="/" aria-label="TigerFlow Startseite">
          <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
          <span>TigerFlow</span>
        </a>
        <nav className="sh-topbar-links" aria-label="Abschnitte">
          {topbarLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ProjectCheckButton className="sh-btn-sm">
          Projekt-Check <ArrowRight size={15} aria-hidden="true" />
        </ProjectCheckButton>
      </div>
    </header>
  );
}

function StickyCta({ visible }) {
  return (
    <div className={`sh-sticky${visible ? " is-visible" : ""}`} inert={!visible}>
      <div className="sh-sticky-price">
        <b>SEO-Setup ab 499 €</b>
        <span>netto zzgl. USt.</span>
      </div>
      <ProjectCheckButton>
        Projekt-Check <ArrowRight size={16} aria-hidden="true" />
      </ProjectCheckButton>
    </div>
  );
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`sh-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function PageHeader() {
  return (
    <header className="sh-nav">
      <a className="sh-brand" href="/" aria-label="TigerFlow Startseite">
        <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
        <span>TigerFlow</span>
      </a>
      <nav className="sh-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath="/seo-heide" />
        <a href="#ablauf">Ablauf</a>
        <a href="#preis">Preis</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button
        type="button"
        className="sh-nav-cta"
        data-project-check-cta
        aria-label="Projekt-Check starten"
        onClick={openProjectCheck}
      >
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}

function KeywordMapVisual() {
  return (
    <div className="sh-visual" aria-hidden="true">
      <div className="sh-map sh-surface">
        <div className="sh-map-head">
          <Search size={14} />
          <b>KEYWORD-MAP</b>
          <em>Beispielstruktur</em>
        </div>
        <div className="sh-map-cols">
          <span>Suchintention</span>
          <span />
          <span>Zielseite</span>
          <span>Reihenfolge</span>
        </div>
        {mapRows.map((row, index) => (
          <div className="sh-map-row" key={row.intent} style={{ "--sh-row": index }}>
            <span className="sh-chip">{row.intent}</span>
            <i className="sh-beam"><b /></i>
            <span className="sh-chip sh-chip-page">{row.page}</span>
            <span className={`sh-prio sh-prio-${index === 0 ? "first" : "later"}`}>
              {row.priority}
            </span>
          </div>
        ))}
        <p className="sh-map-foot">Aus Suchbegriffen wird eine Seitenarchitektur mit klarer Reihenfolge.</p>
      </div>
      <div className="sh-float sh-glass">
        <ListOrdered size={17} />
        <div><b>Maßnahmenplan</b><span>Reihenfolge statt Einzelmaßnahmen</span></div>
      </div>
      <div className="sh-visual-glow" />
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`sh-intro ${className}`.trim()} data-sh-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function ScopeList({ title, items, icon: Icon, tone }) {
  return (
    <article className={`sh-scope sh-scope-${tone}`} data-sh-reveal>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Icon size={15} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function SeoHeidePage() {
  const pageRef = useReveal();
  const { pastHero, reachedFinal } = useScrollChrome(pageRef);
  const activeSection = useActiveSection(pageRef);

  return (
    <div
      ref={pageRef}
      className="sh-page"
      style={{ background: C.pageBg, color: C.textPri }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="sh-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />

      <main id="inhalt" tabIndex={-1}>
        <section className="sh-hero">
          <div className="sh-grid-bg" aria-hidden="true" />
          <div className="sh-hero-copy">
            <span className="sh-eyebrow"><MapPin size={13} aria-hidden="true" /> SEO AUS HEIDE</span>
            <h1>SEO in Heide für Unternehmen, die gezielt gefunden werden wollen.</h1>
            <p className="sh-lead">
              TigerFlow analysiert Suchpotenziale, Seitenstruktur und technische Grundlagen und
              entwickelt daraus eine nachvollziehbare SEO-Roadmap für Ihre Website.
            </p>
            <div className="sh-price-line">
              <strong>SEO-Setup ab 499 € netto</strong>
              <span>zzgl. USt. · individueller Festpreis nach Bedarfsklärung</span>
              <p>
                Analyse, Keyword-Map und priorisierter Maßnahmenplan. Umsetzung und laufende
                Betreuung werden separat vereinbart.
              </p>
            </div>
            <div className="sh-hero-actions">
              <ProjectCheckButton>
                SEO-Ausgangslage klären <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="sh-text-link" href="#setup">Leistungsumfang ansehen</a>
            </div>
          </div>
          <KeywordMapVisual />
        </section>

        <section id="ausgangslagen" className="sh-section">
          <SectionIntro
            className="sh-intro-split"
            eyebrow="AUSGANGSLAGEN"
            title="Sichtbarkeit scheitert selten an nur einem einzelnen Problem."
            text="Damit eine Website bei Google besser auffindbar wird, müssen Suchbegriffe, Zielseiten, Technik und Anfrageweg zusammenpassen. Typisch sind vier Ausgangslagen, oft auch mehrere zugleich."
          />
          <div className="sh-situations">
            {situations.map((item, index) => (
              <article className="sh-card sh-situation" key={item.title} data-sh-reveal data-sh-order={index}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="sh-aside" data-sh-reveal>
            Ebenfalls häufig: Wettbewerber sind bei lokalen Suchanfragen sichtbarer, und
            Google-Unternehmensprofil und Website arbeiten nicht konsistent zusammen.
          </p>
        </section>

        <section id="setup" className="sh-section sh-band sh-setup">
          <div className="sh-setup-main">
            <SectionIntro
              eyebrow="SEO-SETUP"
              title="Am Ende steht kein loses Audit, sondern eine priorisierte Entscheidungsgrundlage."
              text="Suchmaschinenoptimierung beginnt bei TigerFlow mit einer schriftlichen Analyse. Das SEO-Setup ist der Einstieg in die SEO-Beratung für Unternehmen in Heide: klar abgegrenzt und mit greifbarem Ergebnis."
            />
            <ol className="sh-deliver" role="list">
              {deliverables.map((item, index) => (
                <li className="sh-card" key={item.title} data-sh-reveal data-sh-order={index}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="sh-result sh-surface" data-sh-reveal>
            <FileSearch size={22} aria-hidden="true" />
            <span>SICHTBARES ERGEBNIS</span>
            <h3>Schriftliche Keyword-Map und priorisierter Plan</h3>
            <p>
              Sie erhalten keine Datenwüste, sondern Unterlagen, mit denen Sie fundiert
              entscheiden können, ob und womit Sie weitermachen.
            </p>
          </aside>
        </section>

        <section id="local-seo" className="sh-section">
          <SectionIntro
            className="sh-intro-split"
            eyebrow="LOCAL SEO IN HEIDE"
            title="Lokale Sichtbarkeit braucht Website und Standortsignale."
            text="SEO für Unternehmen in Heide ist mehr als ein Eintrag bei Google. Das Google-Unternehmensprofil ist ein Baustein, wirksam wird lokale Suchmaschinenoptimierung erst, wenn Website, Unternehmensdaten und Anfrageweg zusammenpassen."
          />
          <div className="sh-local">
            <div className="sh-hub sh-surface" data-sh-reveal>
              <i className="sh-rings" aria-hidden="true" />
              <MapPin size={22} aria-hidden="true" />
              <b>Heide</b>
              <span>Standort und Website arbeiten zusammen</span>
            </div>
            {localSignals.map((item, index) => (
              <article
                className={`sh-card sh-signal sh-signal-${index + 1}`}
                key={item.title}
                data-sh-reveal
                data-sh-order={index}
              >
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="sh-aside" data-sh-reveal>
            TigerFlow sitzt in Heide. Ob wir uns digital oder persönlich abstimmen, legen wir
            passend zu Ihrem Projekt fest.
          </p>
        </section>

        <section id="ablauf" className="sh-section sh-band">
          <SectionIntro
            eyebrow="ABLAUF"
            title="So läuft das SEO-Setup ab und was danach optional folgt."
            text="Vier Schritte führen zur Entscheidung. Die Umsetzung ist ein eigener, optionaler fünfter Schritt."
          />
          <ol className="sh-steps" role="list">
            {steps.map((step, index) => (
              <li
                className={`sh-step${step.optional ? " sh-step-optional" : ""}`}
                key={step.title}
                data-sh-reveal
                data-sh-order={index}
              >
                {step.optional && <em>Optional, separat vereinbart</em>}
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="sh-aside" data-sh-reveal>
            Der Zeitrahmen hängt unter anderem von Websiteumfang, Datenzugängen und Abstimmungen
            ab. Eine pauschale Projektdauer nennen wir deshalb bewusst nicht.
          </p>
        </section>

        <section id="preis" className="sh-section">
          <div className="sh-price sh-surface" data-sh-reveal>
            <div className="sh-price-copy">
              <span>TRANSPARENTER EINSTIEG</span>
              <h2>Klarer Einstieg, klare Grenze zwischen Setup und Umsetzung.</h2>
              <p>
                Bei der Suche nach einer SEO-Agentur in Heide sollten Umfang und Preis des
                Einstiegs vorab klar sein. Der individuelle Festpreis entsteht nach der
                Bedarfsklärung; Fremd- und Toolkosten werden transparent separat ausgewiesen.
              </p>
            </div>
            <div className="sh-price-number">
              <small>SEO-Setup</small>
              <strong><em>ab</em> 499 €</strong>
              <span>netto zzgl. USt.</span>
              <ProjectCheckButton className="sh-btn-block">
                Umfang klären <ArrowRight size={16} aria-hidden="true" />
              </ProjectCheckButton>
            </div>
          </div>
          <div className="sh-scopes">
            <ScopeList title="Im SEO-Setup enthalten" items={included} icon={Check} tone="in" />
            <ScopeList title="Nicht automatisch enthalten" items={notIncluded} icon={Minus} tone="out" />
            <ScopeList title="Optional und separat" items={optional} icon={Plus} tone="opt" />
          </div>
          <p className="sh-aside" data-sh-reveal>
            Laufende SEO-Tarife werden individuell kalkuliert. Soweit eine Betreuung vereinbart
            wird, gilt eine Mindestlaufzeit von sechs Monaten. Offpage-Leistungen werden separat
            behandelt.
          </p>
        </section>

        <section id="webdesign" className="sh-section sh-band">
          <SectionIntro
            eyebrow="SEO UND WEBSITE"
            title="SEO kann eine bestehende Website verbessern – oder zeigen, dass die Grundlage zuerst erneuert werden muss."
            text="Beim Webdesign gehört die technische SEO-Basis dazu. Strategische Keywordarbeit, Local SEO und laufende Optimierung sind das Thema dieser Seite."
          />
          <div className="sh-paths">
            <article className="sh-card sh-path" data-sh-reveal>
              <Layers size={20} aria-hidden="true" />
              <h3>Die Grundlage trägt</h3>
              <p>
                Sind Technik und Struktur der bestehenden Website tragfähig, baut das SEO-Setup
                darauf auf. Es bleibt bei der Optimierung, ein Neubau wird nicht erzwungen.
              </p>
            </article>
            <article className="sh-card sh-path" data-sh-reveal data-sh-order="1">
              <Target size={20} aria-hidden="true" />
              <h3>Die Grundlage bremst</h3>
              <p>
                Zeigt die Analyse, dass Technik, Struktur oder Darstellung zuerst erneuert werden
                sollten, sagen wir das offen. Sie entscheiden, ob und wie es weitergeht.
              </p>
            </article>
          </div>
          <a className="sh-link-row" href="/webdesign-heide" data-sh-reveal>
            <Globe2 size={18} aria-hidden="true" />
            <span>Webdesign-Angebot aus Heide ansehen</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="erfolgsmessung" className="sh-section sh-measure-section">
          <SectionIntro
            className="sh-intro-split"
            eyebrow="ERFOLGSMESSUNG"
            title="Erfolg zeigt sich an der Anfrage, nicht nur im Ranking."
            text="SEO ist ein überprüfbarer Prozess aus Analyse, Priorisierung, Umsetzung und Messung. Fortschritt bewerten wir in dieser Reihenfolge, soweit Daten verfügbar sind."
          />
          <ol className="sh-measure" role="list">
            {measures.map((item, index) => (
              <li key={item.title} style={{ "--sh-step": index }} data-sh-reveal data-sh-order={index}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <p className="sh-aside" data-sh-reveal>
            Rankings sind ein Zwischensignal, kein alleiniger Geschäftserfolg. Weder Platz 1 bei
            Google noch Traffic, Anfragen oder Umsatz können zugesagt werden.
          </p>
        </section>

        <section id="faq" className="sh-section sh-band sh-faq-section">
          <SectionIntro eyebrow="FAQ" title="Häufige Fragen zu SEO in Heide" />
          <div className="sh-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="sh-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="sh-section sh-final">
          <div className="sh-final-card sh-surface" data-sh-reveal>
            <div className="sh-final-glow" aria-hidden="true" />
            <span><Compass size={14} aria-hidden="true" /> NÄCHSTER SCHRITT</span>
            <h2>Klären wir, welche SEO-Maßnahmen für Ihre Website wirklich sinnvoll sind.</h2>
            <p>
              Der Projekt-Check ordnet Ihr Anliegen in wenigen Schritten ein. Danach klären wir
              gemeinsam, ob und in welchem Umfang ein SEO-Setup für Ihre Website passt.
            </p>
            <ProjectCheckButton>
              Projekt-Check starten <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              In 2 Minuten zum passenden Einstieg · Lieber per E-Mail?{" "}
              <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="sh-home-link" href="/">
              <Building2 size={14} aria-hidden="true" /> Alle Leistungen von TigerFlow
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <StickyHeader visible={pastHero} active={activeSection} />
      <StickyCta visible={pastHero && !reachedFinal} />
    </div>
  );
}
