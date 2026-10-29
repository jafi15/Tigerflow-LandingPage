import {
  ArrowRight,
  Blocks,
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  Handshake,
  LayoutTemplate,
  MapPin,
  Minus,
  PanelsTopLeft,
  RefreshCw,
  Send,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./WebdesignSchleswigHolsteinPage.css";

const PATH = "/webdesign-schleswig-holstein";
const PAGE_URL = `${SITE_URL}${PATH}`;
const route = ROUTES.find(({ path }) => path === PATH);

const layers = [
  {
    icon: LayoutTemplate,
    title: "Positionierung und Struktur",
    text: "Besucher verstehen schnell, was das Unternehmen anbietet und für wen.",
  },
  {
    icon: FileText,
    title: "Inhalte und Vertrauen",
    text: "Leistungen, Rahmenbedingungen und Kontaktmöglichkeiten sind verständlich formuliert.",
  },
  {
    icon: Smartphone,
    title: "Mobile Nutzung und Technik",
    text: "Die Website funktioniert auf Mobilgeräten, lädt ihre Kerninhalte zuverlässig und ist technisch indexierbar.",
  },
  {
    icon: Send,
    title: "Anfrage und Weiterentwicklung",
    text: "Der Weg zur Kontaktaufnahme ist klar; spätere Erweiterungen bleiben möglich.",
  },
];

const situations = [
  {
    icon: PanelsTopLeft,
    title: "Erster professioneller Webauftritt",
    text: "Für Unternehmen, deren Leistungen bisher online kaum oder nur über Verzeichnisse sichtbar sind.",
  },
  {
    icon: RefreshCw,
    title: "Bestehende Website modernisieren",
    text: "Für veraltete Technik, unklare Inhalte oder eine mobile Darstellung, die nicht mehr zum Betrieb passt.",
  },
  {
    icon: GitBranch,
    title: "Mehrere Leistungen oder Einzugsgebiete ordnen",
    text: "Für Unternehmen, die verschiedene Zielgruppen, Leistungen oder regionale Einsatzgebiete verständlich abbilden müssen.",
  },
  {
    icon: Blocks,
    title: "Grundlage für weiteres Wachstum schaffen",
    text: "Für Unternehmen, die später SEO, Buchung, Follow-up oder Automatisierungen ergänzen möchten.",
  },
];

const scopeItems = [
  "Bis zu fünf Inhaltsseiten",
  "Impressum und Datenschutz als Entwürfe",
  "Responsive Umsetzung für Mobil, Tablet und Desktop",
  "Erstellung oder Überarbeitung vereinbarter Texte",
  "Einbindung und Optimierung vorhandener beziehungsweise vereinbarter lizenzierter Bilder",
  "Verlinkung vorhandener Social-Media-Profile",
  "Technische SEO-Basis",
  "Technisch sinnvolle Barrierefreiheits-Basis",
  "Einfacher Anfragefunnel",
  "Veröffentlichung über Vercel",
  "Domain- und DNS-Anbindung",
];

const optionalItems = [
  "Zusätzliche Seiten und umfangreiche Zusatzinhalte",
  "Fotoshooting oder externe Medienproduktion",
  "Formale Barrierefreiheitsprüfung oder pauschale Compliance-Zusage",
  "SEO-Setup und laufende SEO-Betreuung",
  "Local SEO und Arbeit am Google-Unternehmensprofil",
  "Terminbuchung",
  "E-Mail-Follow-up",
  "Website-KI",
  "CRM- und Automatisierungsprozesse",
  "Individuelle Schnittstellen oder Webanwendungen",
  "Laufende Betreuung und Wartung",
];

const scopeNotes = [
  "Impressum und Datenschutz sind Entwürfe – keine Rechtsberatung und keine Rechtssicherheitsgarantie.",
  "Eine formale Barrierefreiheitsprüfung ist nicht automatisch enthalten.",
  "Fremd-, Domain- und Lizenzkosten trägt grundsätzlich der Kunde.",
  "Zusatzleistungen werden separat vereinbart.",
];

const handover = [
  { title: "Briefing", text: "Ausgangslage, Ziele und Material digital klären." },
  { title: "Strukturabstimmung", text: "Seitenaufbau und Inhalte gemeinsam festlegen." },
  { title: "Designfreigabe", text: "Gestaltung online ansehen und freigeben." },
  { title: "Korrekturen", text: "Rückmeldungen digital sammeln und einarbeiten." },
];

const priceFacts = [
  "Bis zu fünf Inhaltsseiten",
  "Impressum und Datenschutz zusätzlich",
  "Der individuelle Festpreis entsteht nach der Bedarfsklärung",
  "Zusatzumfang wird separat kalkuliert",
];

const steps = [
  {
    title: "Bedarf, Zielgruppen und Umfang klären",
    text: "Die Grundlage für das individuelle Festpreisangebot.",
  },
  {
    title: "Seitenstruktur, Inhalte und Design entwickeln",
    text: "Struktur, Texte und Gestaltung werden aufeinander abgestimmt.",
  },
  {
    title: "Responsive Website umsetzen und gemeinsam prüfen",
    text: "Umsetzung für Mobil, Tablet und Desktop, mit Ihren Rückmeldungen.",
  },
  {
    title: "Freigeben, Domain anbinden und veröffentlichen",
    text: "Nach Ihrer Freigabe folgen Domain- und DNS-Anbindung und die Veröffentlichung über Vercel.",
  },
];

const growth = [
  {
    title: "Laufende Website-Betreuung",
    text: "Pflege und Anpassungen nach dem Launch über optionale Servicepakete.",
  },
  {
    title: "SEO-Setup und laufende SEO-Betreuung",
    text: "Strategische Suchmaschinenoptimierung über die technische Basis hinaus.",
  },
  {
    title: "Terminbuchung",
    text: "Buchbare Termine als Ergänzung zum Anfrageweg.",
  },
  {
    title: "E-Mail-Follow-up",
    text: "Automatisierte E-Mails nach einer Anfrage.",
  },
  {
    title: "Website-KI",
    text: "KI-gestützte Funktionen auf der Website, projektbezogen definiert.",
  },
  {
    title: "Projektbezogene CRM- und Automatisierungsprozesse",
    text: "Anfragen werden an Ihre internen Abläufe angebunden.",
  },
];

const faqs = [
  {
    question: "Was kostet eine Website bei TigerFlow?",
    answer:
      "Der Einstieg beginnt bei 829 € netto zuzüglich gesetzlicher Umsatzsteuer für bis zu fünf Inhaltsseiten plus Impressum und Datenschutz. Bezahlt wird in zwei Teilen: 50 % bei Beauftragung und 50 % vor beziehungsweise zum Launch. Nach der Bedarfsklärung erhalten Sie ein individuelles Festpreisangebot; zusätzlicher Umfang wird separat kalkuliert.",
  },
  {
    question: "Was ist im Einstiegspreis enthalten?",
    answer:
      "Enthalten sind die responsive Umsetzung für Mobil, Tablet und Desktop, vereinbarte Texte, vorhandene beziehungsweise vereinbarte lizenzierte Bilder, die Verlinkung vorhandener Social-Media-Profile, eine technische SEO-Basis, eine technisch sinnvolle Barrierefreiheits-Basis, ein einfacher Anfragefunnel, die Veröffentlichung über Vercel sowie die Domain- und DNS-Anbindung. Impressum und Datenschutz werden als Entwürfe vorbereitet.",
  },
  {
    question: "Arbeitet TigerFlow mit Unternehmen in ganz Schleswig-Holstein?",
    answer:
      "Ja. TigerFlow sitzt in Heide; Unternehmen in ganz Schleswig-Holstein können betreut werden. Ob Sie nach einem Webdesigner oder einer Webdesign-Agentur in Schleswig-Holstein suchen: Briefing, Abstimmung und Freigaben lassen sich digital organisieren, ohne dass ein Vor-Ort-Termin zur Voraussetzung wird.",
  },
  {
    question: "Wie läuft die Zusammenarbeit über größere Entfernungen ab?",
    answer:
      "Briefing, Strukturabstimmung, Designfreigabe und Korrekturen können digital erfolgen, etwa per E-Mail, Telefon oder Videocall. Persönliche Termine sind kein pauschal zugesagter Standard und werden bei Bedarf projektbezogen abgestimmt. Digitale Zusammenarbeit ist ein Organisationsvorteil, aber kein Ersatz für klare Kommunikation.",
  },
  {
    question: "Kann eine bestehende Website überarbeitet werden?",
    answer:
      "Ja. Vor einem Relaunch klären wir, was am Bestand tragfähig ist: Inhalte, Technik und Domain. Der verbindliche Umfang ergibt sich aus der Bedarfsklärung und wird im individuellen Festpreisangebot festgehalten.",
  },
  {
    question: "Wie lange dauert ein Website-Projekt?",
    answer:
      "Eine pauschale Dauer nennen wir nicht. Der Zeitraum hängt von Umfang, vorhandenem Material, Rückmeldungen und gewünschten Zusatzfunktionen ab. Einen realistischen Ablauf stimmen wir nach der Bedarfsklärung mit Ihnen ab.",
  },
  {
    question: "Ist Suchmaschinenoptimierung enthalten?",
    answer:
      "Eine technische SEO-Basis ist enthalten. Strategische Suchmaschinenoptimierung, Local SEO, die Arbeit am Google-Unternehmensprofil und laufende SEO-Betreuung sind eigenständige Leistungen und werden separat vereinbart. Bestimmte Rankings oder Besucherzahlen lassen sich nicht zusagen.",
  },
  {
    question: "Kann ich die Website später erweitern lassen?",
    answer:
      "Ja. Zusätzliche Seiten, SEO, Terminbuchung, E-Mail-Follow-up, Website-KI sowie CRM- und Automatisierungsprozesse können bei Bedarf ergänzt werden. Diese Leistungen sind nicht automatisch im Einstiegspreis enthalten und werden separat vereinbart.",
  },
  {
    question: "Welche laufenden Kosten entstehen nach dem Launch?",
    answer:
      "Domain-, Hosting-, Lizenz- und weitere Fremdkosten hängen von Ihrer Auswahl ab; sie trägt grundsätzlich der Kunde. Optional bietet TigerFlow Servicepakete für Wartung und Betreuung an: 49 € netto pro Monat (bis zu 30 Minuten), 99 € netto pro Monat (bis zu eine Stunde plus Analytics) oder 199 € netto pro Monat (bis zu zwei Stunden plus Monatsauswertung), jeweils zuzüglich gesetzlicher Umsatzsteuer und mit einer Mindestlaufzeit von drei Monaten. Zusätzliche Arbeit kostet 99 € netto pro Stunde.",
  },
  {
    question: "Sind Impressum und Datenschutz rechtssicher enthalten?",
    answer:
      "Impressum und Datenschutz werden als Entwürfe vorbereitet. Das ist keine Rechtsberatung und keine Rechtssicherheitsgarantie; eine rechtliche Prüfung bleibt Ihnen vorbehalten.",
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
        { "@type": "ListItem", position: 2, name: "Webdesign Schleswig-Holstein", item: PAGE_URL },
      ],
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "Webdesign für Unternehmen",
      serviceType: "Webdesign",
      description:
        "Responsive Unternehmenswebsite mit bis zu fünf Inhaltsseiten plus Impressum und Datenschutz als Entwürfe, vereinbarten Texten, technischer SEO-Basis, einfachem Anfragefunnel, Veröffentlichung über Vercel sowie Domain- und DNS-Anbindung.",
      url: PAGE_URL,
      areaServed: { "@type": "State", name: "Schleswig-Holstein" },
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
          minPrice: 829,
          priceCurrency: "EUR",
          valueAddedTaxIncluded: false,
          description:
            "Ab 829 € netto zuzüglich gesetzlicher Umsatzsteuer; individuelles Festpreisangebot nach der Bedarfsklärung.",
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
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const delay = Number(target.dataset.wshOrder ?? 0) * 60;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.remove("wsh-reveal-pending");
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

    page.querySelectorAll("[data-wsh-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("wsh-reveal-pending");
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return ref;
}

// The floating top bar appears once the hero actions have scrolled out of view.
function usePastHero(pageRef) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const target = pageRef.current?.querySelector(".wsh-hero-actions");
    if (!target || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pageRef]);

  return pastHero;
}

// The mobile CTA bar steps aside once the closing CTA section is on screen.
function useReachedFinal(pageRef) {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const target = pageRef.current?.querySelector("#projektanfrage");
    if (!target || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pageRef]);

  return reached;
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
  { id: "leistungen", label: "Leistungen" },
  { id: "preis", label: "Preis" },
  { id: "ablauf", label: "Ablauf" },
  { id: "faq", label: "FAQ" },
];

function BrandLink() {
  return (
    <a className="wsh-brand" href="/" aria-label="TigerFlow Startseite">
      <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
      <span>TigerFlow</span>
    </a>
  );
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`wsh-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function PageHeader({ inactive = false }) {
  return (
    <header
      className="wsh-nav"
      inert={inactive ? true : undefined}
      aria-hidden={inactive || undefined}
    >
      <BrandLink />
      <nav className="wsh-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath={PATH} />
        {navLinks
          .filter(({ id }) => id !== "leistungen")
          .map(({ id, label }) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
      </nav>
      <button
        type="button"
        className="wsh-nav-cta"
        data-project-check-cta
        aria-label="Projekt-Check starten"
        onClick={openProjectCheck}
      >
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}

function FloatingBar({ visible, active }) {
  return (
    <div
      className={`wsh-bar wsh-glass${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="wsh-bar-inner">
        <BrandLink />
        <nav className="wsh-bar-links" aria-label="Abschnitte">
          {navLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ProjectCheckButton className="wsh-btn-sm">
          Projekt-Check <ArrowRight size={15} aria-hidden="true" />
        </ProjectCheckButton>
      </div>
    </div>
  );
}

function MobileBar({ visible }) {
  return (
    <div
      className={`wsh-mobile-bar${visible ? " is-visible" : ""}`}
      inert={visible ? undefined : true}
      aria-hidden={!visible || undefined}
    >
      <div className="wsh-mobile-bar-price">
        <b>Websites ab 829{"\u00a0"}€</b>
        <span>netto zzgl. USt.</span>
      </div>
      <ProjectCheckButton>
        Projekt-Check <ArrowRight size={16} aria-hidden="true" />
      </ProjectCheckButton>
    </div>
  );
}

// Decorative "Das Website-System": four connected layers around one website canvas.
function WebsiteSystemVisual() {
  return (
    <div className="wsh-system-visual" aria-hidden="true">
      <div className="wsh-stage">
        <div className="wsh-plate" data-wsh-layer="structure">
          <span className="wsh-layer-label"><b>01</b> Struktur</span>
          <div className="wsh-sitemap">
            <i className="wsh-sitemap-root" />
            <div className="wsh-sitemap-pages"><i /><i /><i /><i /><i /></div>
          </div>
        </div>
        <i className="wsh-wire wsh-wire-down"><b /></i>

        <div className="wsh-canvas">
          <div className="wsh-canvas-bar"><i /><i /><i /><span>ihre-website.de</span></div>
          <div className="wsh-canvas-page">
            <div className="wsh-cv-nav"><i className="wsh-cv-logo" /><i /><i /><i /></div>
            <div className="wsh-cv-hero" data-wsh-layer="content">
              <span className="wsh-layer-label"><b>02</b> Inhalt</span>
              <i className="wsh-cv-line wsh-cv-title" />
              <i className="wsh-cv-line wsh-cv-title wsh-cv-short" />
              <i className="wsh-cv-line wsh-cv-text" />
              <i className="wsh-cv-line wsh-cv-text wsh-cv-short" />
              <i className="wsh-cv-action" />
            </div>
            <div className="wsh-cv-cards"><i /><i /><i /></div>
          </div>
        </div>
        <i className="wsh-wire wsh-wire-across"><b /></i>

        <div className="wsh-phone" data-wsh-layer="mobile">
          <span className="wsh-layer-label"><b>03</b> Mobil</span>
          <div className="wsh-phone-screen">
            <i className="wsh-cv-line wsh-cv-title" />
            <i className="wsh-cv-line wsh-cv-text" />
            <i className="wsh-cv-line wsh-cv-text wsh-cv-short" />
            <i className="wsh-cv-action" />
          </div>
        </div>

        <div className="wsh-inquiry wsh-glass" data-wsh-layer="inquiry">
          <Send size={16} />
          <div>
            <span className="wsh-layer-label"><b>04</b> Anfrage</span>
            <strong>Der Weg zur Kontaktaufnahme</strong>
          </div>
        </div>
      </div>
      <div className="wsh-origin">
        <i />
        <span>aus Heide · für Schleswig-Holstein</span>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`wsh-intro ${className}`.trim()} data-wsh-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function WebdesignSchleswigHolsteinPage() {
  const pageRef = useReveal();
  const pastHero = usePastHero(pageRef);
  const activeSection = useActiveSection(pageRef);
  const reachedFinal = useReachedFinal(pageRef);

  return (
    <div
      ref={pageRef}
      className="wsh-page"
      style={{ background: C.pageBg, color: C.textPri }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="wsh-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader inactive={pastHero} />
      <FloatingBar visible={pastHero} active={activeSection} />

      <main id="inhalt" tabIndex={-1}>
        <section className="wsh-hero">
          <div className="wsh-grid-bg" aria-hidden="true" />
          <div className="wsh-hero-copy">
            <span className="wsh-eyebrow">
              <MapPin size={13} aria-hidden="true" /> WEBDESIGN FÜR SCHLESWIG-HOLSTEIN
            </span>
            <h1>Webdesign in Schleswig-Holstein, das Marke, Inhalte und Anfrageweg zusammenführt.</h1>
            <p className="wsh-lead">
              TigerFlow aus Heide entwickelt moderne Unternehmenswebsites für Betriebe in ganz
              Schleswig-Holstein – responsive, verständlich aufgebaut und mit einer technischen
              Grundlage, die sich weiterentwickeln lässt.
            </p>
            <div className="wsh-price-line">
              <strong>Websites ab 829 € netto</strong>
              <span>zuzüglich gesetzlicher Umsatzsteuer</span>
              <p>
                Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz im bestätigten
                Einstiegsscope. Nach der Bedarfsklärung erhalten Sie ein individuelles
                Festpreisangebot.
              </p>
            </div>
            <div className="wsh-hero-actions">
              <ProjectCheckButton>
                Website-Projekt unverbindlich prüfen <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="wsh-text-link" href="#leistungen">Leistungsumfang ansehen</a>
            </div>
          </div>
          <WebsiteSystemVisual />
        </section>

        <section id="system" className="wsh-section">
          <SectionIntro
            eyebrow="WEBSITE ALS SYSTEM"
            title="Gestaltung, Inhalte, Technik und Anfrageweg müssen zusammenarbeiten."
            text="Professionelles Webdesign endet nicht bei der Optik. Eine Unternehmenswebsite überzeugt erst, wenn diese vier Ebenen ineinandergreifen."
          />
          <ol className="wsh-layers" role="list">
            {layers.map(({ icon: Icon, title, text }, index) => (
              <li className="wsh-layer" key={title} data-wsh-reveal data-wsh-order={index}>
                <span className="wsh-layer-node" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon size={20} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="wsh-aside" data-wsh-reveal>
            Nicht jeder Betrieb braucht dieselbe Struktur. Die vier Ebenen werden an Leistungen,
            Zielgruppen und vorhandenes Material angepasst.
          </p>
        </section>

        <section id="ausgangslagen" className="wsh-section wsh-band wsh-situations">
          <SectionIntro
            eyebrow="AUSGANGSLAGEN"
            title="Unterschiedliche Unternehmen brauchen keine Schablone, sondern eine passende Webstruktur."
            text="Wer eine Website erstellen lassen oder neu aufsetzen möchte, startet selten bei null. Diese vier Ausgangslagen kommen besonders häufig vor – oft treffen auch mehrere zu."
          />
          <div className="wsh-situations-body">
            <ol role="list">
              {situations.map(({ icon: Icon, title, text }, index) => (
                <li key={title} data-wsh-reveal data-wsh-order={index}>
                  <span className="wsh-icon-tile"><Icon size={20} aria-hidden="true" /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="wsh-note" data-wsh-reveal>
              Typische Projektsituationen – keine Fallstudien oder Referenzbehauptungen.
            </p>
          </div>
        </section>

        <section id="leistungen" className="wsh-section">
          <SectionIntro
            eyebrow="EINSTIEGSSCOPE"
            title="Was Ihre neue TigerFlow-Website im Einstieg mitbringt."
            text="Der Einstieg ist bewusst klar umrissen. Ob er zu Ihrem Projekt passt, klären wir anhand Ihrer Anforderungen."
          />
          <div className="wsh-scope">
            <div className="wsh-scope-main wsh-card" data-wsh-reveal>
              <h3>Im Einstieg enthalten</h3>
              <ul role="list">
                {scopeItems.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="wsh-terms">
                <b>Konditionen</b>
                <span>50 % bei Beauftragung</span>
                <span>50 % vor beziehungsweise zum Launch</span>
                <span>individuelles Festpreisangebot nach der Bedarfsklärung</span>
              </p>
            </div>
            <aside className="wsh-scope-side wsh-card" data-wsh-reveal data-wsh-order="1">
              <h3>Nicht automatisch im Einstiegspreis enthalten</h3>
              <ul role="list">
                {optionalItems.map((item) => (
                  <li key={item}>
                    <Minus size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
          <ul className="wsh-scope-notes" role="list" data-wsh-reveal>
            {scopeNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section id="zusammenarbeit" className="wsh-section wsh-band wsh-collab">
          <div className="wsh-collab-copy" data-wsh-reveal>
            <span className="wsh-label"><MapPin size={13} aria-hidden="true" /> AUS HEIDE · FÜR SCHLESWIG-HOLSTEIN</span>
            <h2>Regional erreichbar. Digital ohne unnötige Wege organisiert.</h2>
            <p>
              TigerFlow sitzt in Heide. Unternehmen in ganz Schleswig-Holstein können betreut
              werden.
            </p>
            <p>
              Briefing, Strukturabstimmung, Designfreigabe und Korrekturen können digital
              erfolgen.
            </p>
            <p>
              Persönliche Termine sind kein pauschal zugesagter Standard; sie werden bei Bedarf
              projektbezogen abgestimmt.
            </p>
            <p>
              Digitale Zusammenarbeit ist ein Organisationsvorteil und kein Ersatz für klare
              Kommunikation.
            </p>
            <div className="wsh-link-rows">
              <a href="/webdesign-heide">
                <span>Webdesign Heide: die Seite für Betriebe direkt vor Ort</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="/webdesign-dithmarschen">
                <span>Webdesign Dithmarschen: die Seite für Betriebe im Kreis</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="wsh-handover wsh-card" data-wsh-reveal data-wsh-order="1">
            <h3><Handshake size={18} aria-hidden="true" /> So läuft die Abstimmung</h3>
            <ol role="list">
              {handover.map(({ title, text }) => (
                <li key={title}>
                  <b>{title}</b>
                  <span>{text}</span>
                </li>
              ))}
              <li className="wsh-handover-optional">
                <b>Persönlicher Termin</b>
                <span>Bei Bedarf, projektbezogen abgestimmt.</span>
              </li>
            </ol>
          </div>
        </section>

        <section id="preis" className="wsh-section">
          <div className="wsh-price wsh-card" data-wsh-reveal>
            <div className="wsh-price-copy">
              <span className="wsh-label">TRANSPARENTER EINSTIEG</span>
              <h2>Ab 829 € netto für eine klar definierte Unternehmenswebsite.</h2>
              <p>
                Wer eine Webagentur in Schleswig-Holstein vergleicht, sollte Umfang und Preis des
                Einstiegs vorab kennen. Der Preis gilt zuzüglich gesetzlicher Umsatzsteuer.
              </p>
              <ul role="list">
                {priceFacts.map((fact) => (
                  <li key={fact}>
                    <Check size={16} aria-hidden="true" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="wsh-price-panel">
              <small>Website-Einstieg</small>
              <strong><em>ab</em> 829 € <span>netto</span></strong>
              <span className="wsh-vat">zuzüglich gesetzlicher Umsatzsteuer</span>
              <div className="wsh-split">
                <div><b>50 %</b><span>bei Beauftragung</span></div>
                <div><b>50 %</b><span>vor beziehungsweise zum Launch</span></div>
              </div>
              <ProjectCheckButton className="wsh-btn-block">
                Projektumfang klären <ArrowRight size={16} aria-hidden="true" />
              </ProjectCheckButton>
            </div>
          </div>
        </section>

        <section id="ablauf" className="wsh-section wsh-band">
          <SectionIntro
            eyebrow="PROJEKTABLAUF"
            title="Vier klare Schritte von der Ausgangslage bis zum Launch."
          />
          <ol className="wsh-steps" role="list">
            {steps.map(({ title, text }, index) => (
              <li key={title} data-wsh-reveal data-wsh-order={index}>
                <span className="wsh-step-node" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="wsh-aside" data-wsh-reveal>
            Eine pauschale Projektlaufzeit nennen wir bewusst nicht. Der Zeitraum hängt von
            Umfang, Material, Rückmeldungen und Zusatzfunktionen ab.
          </p>
        </section>

        <section id="ausbau" className="wsh-section">
          <SectionIntro
            eyebrow="AUSBAU STATT NEUSTART"
            title="Die Website kann mit dem tatsächlichen Bedarf weiterwachsen."
            text="Der Einstieg ist die belastbare Grundlage. Was darauf folgt, richtet sich nach Ihrem Bedarf."
          />
          <ul className="wsh-growth" role="list">
            {growth.map(({ title, text }, index) => (
              <li key={title} data-wsh-reveal data-wsh-order={index % 3}>
                <em>Optional</em>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <p className="wsh-aside" data-wsh-reveal>
            Diese Leistungen sind nicht automatisch im Website-Einstieg enthalten und werden
            separat vereinbart.
          </p>
          <a className="wsh-link-row" href="/seo-heide" data-wsh-reveal>
            <span>SEO aus Heide: Analyse, Keyword-Map und priorisierter Maßnahmenplan</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="faq" className="wsh-section wsh-band wsh-faq-section">
          <SectionIntro
            eyebrow="FAQ"
            title={<>Häufige Fragen zu Webdesign in <span className="wsh-nowrap">Schleswig-Holstein</span></>}
          />
          <div className="wsh-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="wsh-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="wsh-section wsh-final">
          <div className="wsh-final-card wsh-card" data-wsh-reveal>
            <div className="wsh-final-glow" aria-hidden="true" />
            <span className="wsh-label">PROJEKTANFRAGE</span>
            <h2>Klären wir, welche Website zu Ihrem Unternehmen und Ihrem nächsten Schritt passt.</h2>
            <p>
              Im unverbindlichen Projekt-Check ordnen wir Ausgangslage, benötigte Inhalte und
              sinnvolle Erweiterungen ein. Eine Anfrage löst noch keine Beauftragung aus.
            </p>
            <ProjectCheckButton>
              Website-Projekt prüfen <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail? <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="wsh-home-link" href="/">Alle Leistungen von TigerFlow</a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBar visible={pastHero && !reachedFinal} />
    </div>
  );
}
