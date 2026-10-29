import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  Compass,
  Dot,
  FileCheck2,
  Globe2,
  Mail,
  Minus,
  Plus,
  Puzzle,
  Rocket,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./PreisePage.css";

const PAGE_URL = `${SITE_URL}/preise`;
const route = ROUTES.find(({ path }) => path === "/preise");

// Hero visual: the included core, optional modules outside it, and the written fixed price.
const coreModules = [
  { icon: Globe2, title: "Website", text: "bis zu fünf Inhaltsseiten" },
  { icon: Rocket, title: "Launch", text: "Vercel, Domain und DNS" },
  { icon: Search, title: "SEO-Basis", text: "Titel, Sitemap, Canonicals" },
];

const optionalModules = ["Betreuung", "SEO-Setup", "Terminbuchung", "E-Mail-Follow-up"];

const included = [
  "Bis zu fünf Inhaltsseiten",
  "Impressum und Datenschutz zusätzlich zu den Inhaltsseiten",
  "Responsive Darstellung für Mobilgeräte, Tablets und Desktop",
  "Erstellung und Überarbeitung der vereinbarten Seitentexte anhand Ihrer Informationen",
  "Einbindung und Optimierung vorhandener Kundenbilder sowie weiterer ausdrücklich vereinbarter und korrekt lizenzierter Bilder",
  "Verlinkung vorhandener Social-Media-Profile",
  "Technische SEO-Basis",
  "Technisch sinnvolle Barrierefreiheits-Basis",
  "Auf Wunsch ein einfacher E-Mail-Anfragefunnel",
  "Impressums- und Datenschutzentwürfe anhand Ihrer Angaben, erstellt und integriert",
  "Veröffentlichung der freigegebenen Website über Vercel",
  "Domain- und DNS-Anbindung",
  "Launchbereite, öffentlich erreichbare Website",
];

const seoBase = [
  "Seitentitel",
  "Meta-Descriptions",
  "Sinnvolle Überschriftenstruktur",
  "Indexierbarkeit",
  "Sitemap",
  "robots.txt",
  "Canonicals",
];

const factors = [
  {
    title: "Seiten und Inhaltsumfang",
    text: "Wie viele Inhaltsseiten braucht die Website, und wie umfangreich sind sie?",
  },
  {
    title: "Funktionen und Integrationen",
    text: "Terminbuchung, Automatisierungen oder Schnittstellen erweitern den Standardumfang.",
  },
  {
    title: "Vorhandene oder neu zu erstellende Inhalte",
    text: "Liegen Texte und Bilder bereits vor, oder müssen umfangreiche Inhalte neu entstehen?",
  },
  {
    title: "Design- und Änderungsumfang",
    text: "Besondere Gestaltungswünsche und grundlegende Richtungswechsel verändern den Aufwand.",
  },
  {
    title: "Externe Dienste und laufende Kosten",
    text: "Software, Lizenzen, Domain oder Hosting können zusätzliche Kosten verursachen.",
  },
];

const splitGroups = [
  {
    title: "Im Website-Einstieg enthalten",
    tone: "in",
    icon: Check,
    items: [
      "Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz",
      "Seitentexte, Bildeinbindung und Social-Media-Verlinkung",
      "Technische SEO-Basis und Barrierefreiheits-Basis",
      "Auf Wunsch ein einfacher E-Mail-Anfragefunnel",
      "Rechtstextentwürfe anhand Ihrer Angaben",
      "Veröffentlichung über Vercel mit Domain- und DNS-Anbindung",
    ],
  },
  {
    title: "Optional durch TigerFlow",
    tone: "opt",
    icon: Plus,
    items: [
      "Fotoshooting",
      "Zusätzliche Inhaltsseiten",
      "Umfangreiche zusätzliche Inhalte",
      "Shops, Portale und individuelle Webanwendungen",
      "Komplexe Schnittstellen",
      "Strategische oder laufende SEO-Leistungen",
      "Analytics und Conversion-Messung",
      "Formale Barrierefreiheitsprüfung oder Konformitätszusage",
      "Terminbuchungssysteme",
      "Automatisierte E-Mail-Follow-ups",
      "TigerBot, TelefonBot und andere KI-Integrationen",
      "Monatliche Wartung und Betreuung",
    ],
  },
  {
    title: "Extern und laufend",
    tone: "ext",
    icon: Minus,
    items: [
      "Domain- und Hostingkosten",
      "Software- und Lizenzkosten",
      "Medienkosten, etwa für lizenzierte Bilder",
      "Nutzungskosten externer Dienste",
      "Andere Fremdkosten, sofern sie nicht ausdrücklich im individuellen Angebot enthalten sind",
    ],
  },
];

const plans = [
  {
    name: "Basis",
    price: "49 €",
    items: [
      "Technische Wartung",
      "Betreuung des Hostings",
      "Support per E-Mail während üblicher Geschäftszeiten",
      "30 Minuten Änderungskontingent pro Monat",
    ],
    excluded: ["Keine Analytics-Leistung"],
  },
  {
    name: "Wachstum",
    price: "99 €",
    items: [
      "Leistungen aus Basis",
      "1 Stunde Änderungskontingent pro Monat",
      "Einrichtung von Analytics",
      "Zugang zu einem Analytics-Dashboard",
    ],
  },
  {
    name: "Premium",
    price: "199 €",
    items: [
      "Leistungen aus Wachstum",
      "2 Stunden Änderungskontingent pro Monat",
      "Kurzer monatlicher Bericht mit Kennzahlen, Einordnung und Handlungsempfehlungen",
    ],
  },
];

const planTerms = [
  "Für alle Pakete gelten drei Monate Mindestlaufzeit, danach monatlich kündbar.",
  "Nicht genutztes Änderungskontingent verfällt am Monatsende.",
  "Mehrarbeit wird mit 99 € netto pro Stunde in 15-Minuten-Einheiten berechnet.",
  "Es gilt keine feste Reaktionszeit.",
  "Zusätzliche Seiten, Funktionen, größere Umgestaltungen und eigenständige Projekte werden separat kalkuliert.",
  "Fremdkosten sind nicht enthalten.",
  "SEO nur bei ausdrücklicher Zusatzvereinbarung.",
];

const seoSetupIncluded = [
  "Keyword-, Wettbewerbs- und Suchintentionsanalyse",
  "Schriftliche Analyse der Ausgangslage",
  "Keyword-Map",
  "Priorisierter Maßnahmenplan",
];

const seoSetupExcluded = [
  "Technische Umsetzung",
  "Redaktionelle Umsetzung",
  "Neue Zielseiten",
  "Laufende Betreuung",
  "Keine Garantie für Rankings, Besucherzahlen, Leads oder Umsätze",
];

const addons = [
  {
    icon: CalendarCheck,
    title: "Terminbuchung",
    price: "ab 149 €",
    note: "netto zzgl. USt.",
    included: [
      "Standard-Buchungssystem",
      "Ein Buchungstyp",
      "Verbindung mit einem vereinbarten Kalender",
      "Einrichtung der Bestätigung",
      "Technischer Funktionstest",
    ],
    excludedTitle: "Separat",
    excluded: [
      "Weitere Buchungstypen",
      "Mehrere Mitarbeiter oder Standorte",
      "Individuelle Buchungslogik",
      "Software-, Lizenz- und andere Fremdkosten",
    ],
  },
  {
    icon: Mail,
    title: "E-Mail-Follow-up",
    price: "ab 399 €",
    note: "netto zzgl. USt.",
    included: [
      "Ein einfacher automatisierter Ablauf nach einer Websiteanfrage",
      "Bis zu drei automatisierte E-Mails",
      "Technische Einrichtung",
      "Funktionstest",
    ],
    excludedTitle: "Abgrenzung",
    excluded: [
      "Sie liefern und genehmigen die finalen E-Mail-Texte",
      "Keine Rechtsprüfung durch TigerFlow",
      "Segmentierungen, weitere Sequenzen, CRM-Logik und komplexe Bedingungen separat",
      "Versand-, Software-, Lizenz- und andere Fremdkosten tragen Sie",
    ],
  },
  {
    icon: Sparkles,
    title: "Website-KI: TigerBot und TelefonBot",
    price: "Individuell",
    note: "kein öffentlicher Richtpreis",
    conditions: true,
    included: [
      "Einrichtung und laufender Betrieb werden individuell kalkuliert",
      "Produktive Bots benötigen eine laufende Betriebs- und Betreuungskomponente",
      "Nutzungs- und Fremdkosten werden im individuellen Angebot ausgewiesen",
      "Funktionen und Integrationen werden projektbezogen abgegrenzt",
      "Kein Produktivstart ohne Tests und Ihre Freigabe",
    ],
  },
  {
    icon: Puzzle,
    title: "Weitere Funktionen",
    price: "Nach Prüfung",
    note: "im Festpreisangebot ausgewiesen",
    conditions: true,
    included: [
      "Funktionen, Schnittstellen oder Erweiterungen über den Standardumfang hinaus",
      "Einordnung im Projekt-Check und gemeinsame Abgrenzung",
      "Kalkulation als Teil des schriftlichen Festpreisangebots",
    ],
  },
];

const steps = [
  { title: "Projekt-Check", text: "Sie ordnen Website, Funktionen und Zeitrahmen unverbindlich ein." },
  {
    title: "Bedarf und Umfang klären",
    text: "Seiten, Inhalte, Funktionen und externe Dienste werden gemeinsam abgegrenzt.",
  },
  {
    title: "Schriftliches Festpreisangebot",
    text: "Mit festgehaltenem Umfang und ausgewiesenen Fremdkosten.",
  },
  {
    title: "Beauftragung und 50-%-Startzahlung",
    text: "Mit der Beauftragung wird die erste Hälfte des Festpreises fällig.",
    payment: true,
  },
  {
    title: "Umsetzung und Abstimmung",
    text: "Korrekturen innerhalb des vereinbarten Umfangs ohne feste Rundenzahl.",
  },
  {
    title: "Restzahlung vor Launch",
    text: "Die zweite Hälfte wird vor der Veröffentlichung fällig.",
    payment: true,
  },
  {
    title: "Veröffentlichung nach Freigabe",
    text: "Die Website geht nach Ihrer Freigabe live, angebunden an Ihre Domain.",
  },
];

const faqs = [
  {
    question: "Was kostet eine Website bei TigerFlow?",
    answer:
      "Eine kompakte Unternehmenswebsite beginnt bei 829 € netto zuzüglich Umsatzsteuer. Dieser Einstiegspreis gilt für bis zu fünf Inhaltsseiten plus Impressum und Datenschutz. Den verbindlichen Preis erhalten Sie nach der Bedarfsklärung als individuelles Festpreisangebot mit festgehaltenem Umfang.",
  },
  {
    question: "Was ist im Einstiegspreis von 829 € enthalten?",
    answer:
      "Enthalten sind bis zu fünf Inhaltsseiten, Impressum und Datenschutz, eine responsive Darstellung, die Erstellung und Überarbeitung der vereinbarten Seitentexte, die Einbindung vorhandener Bilder, die Verlinkung Ihrer Social-Media-Profile, die technische SEO-Basis, eine technisch sinnvolle Barrierefreiheits-Basis, auf Wunsch ein einfacher E-Mail-Anfragefunnel sowie die Veröffentlichung über Vercel mit Domain- und DNS-Anbindung.",
  },
  {
    question: "Ist der Ab-Preis bereits ein verbindlicher Festpreis?",
    answer:
      "Nein. 829 € netto ist der Einstiegspreis für den beschriebenen Standardumfang. Nach der Bedarfsklärung erhalten Sie ein individuell kalkuliertes Festpreisangebot, in dem der vereinbarte Umfang schriftlich festgehalten ist.",
  },
  {
    question: "Wie wird die Website bezahlt?",
    answer:
      "50 % des vereinbarten Festpreises werden bei Beauftragung fällig, die übrigen 50 % vor dem Launch. Veröffentlicht wird die Website nach Ihrer Freigabe.",
  },
  {
    question: "Wie viele Korrekturen sind möglich?",
    answer:
      "Korrekturen innerhalb des vereinbarten Leistungsumfangs haben vor dem Launch keine feste Rundenzahl. Zusätzliche Seiten, neue Funktionen oder ein grundlegender Richtungswechsel sind Erweiterungen des Umfangs und werden separat kalkuliert.",
  },
  {
    question: "Welche laufenden Kosten können nach dem Launch entstehen?",
    answer:
      "Je nach Projekt können Kosten für Domain, Hosting, Software, Lizenzen oder Medien entstehen. Fremdkosten werden vor Beauftragung ausgewiesen, soweit sie nicht im individuellen Angebot enthalten sind. Optional kommt ein monatliches Servicepaket ab 49 € netto hinzu.",
  },
  {
    question: "Ist SEO im Websitepreis enthalten?",
    answer:
      "Enthalten ist die technische SEO-Basis mit Seitentiteln, Meta-Descriptions, sinnvoller Überschriftenstruktur, Indexierbarkeit, Sitemap, robots.txt und Canonicals. Strategische und laufende SEO-Leistungen sind separat. Das SEO-Setup mit Analyse, Keyword-Map und Maßnahmenplan beginnt bei 499 € netto.",
  },
  {
    question: "Muss ich ein monatliches Servicepaket buchen?",
    answer:
      "Nein. Die Servicepakete sind optional und keine Voraussetzung für den Websitekauf. Wenn Sie Wartung, Hosting-Betreuung und ein monatliches Änderungskontingent wünschen, wählen Sie Basis, Wachstum oder Premium mit drei Monaten Mindestlaufzeit, danach monatlich kündbar.",
  },
  {
    question: "Sind Impressum und Datenschutz enthalten?",
    answer:
      "Ja. TigerFlow erstellt Entwürfe für Impressum und Datenschutzerklärung anhand Ihrer Angaben und bindet sie ein. Das ist keine Rechtsberatung, und eine rechtliche Konformität wird nicht garantiert. Eine verbindliche Prüfung erfolgt bei Bedarf durch eine qualifizierte Stelle.",
  },
  {
    question: "Was kosten zusätzliche Seiten oder Funktionen?",
    answer:
      "Zusätzliche Inhaltsseiten, Funktionen und Integrationen werden nach Umfang separat kalkuliert und im Festpreisangebot ausgewiesen. Für einige Erweiterungen gibt es Einstiegspreise, etwa die Terminbuchung ab 149 € netto oder das E-Mail-Follow-up ab 399 € netto.",
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
        { "@type": "ListItem", position: 2, name: "Preise", item: PAGE_URL },
      ],
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
          const delay = Number(target.dataset.prOrder ?? 0) * 70;
          // Cards pop in via a keyframe; intros and notes keep the calm rise transition.
          if (target.dataset.prReveal === "pop") {
            target.style.animationDelay = `${delay}ms`;
            target.classList.add("pr-revealed");
          } else {
            target.style.transitionDelay = `${delay}ms`;
          }
          target.classList.remove("pr-reveal-pending");
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

    page.querySelectorAll("[data-pr-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("pr-reveal-pending");
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return ref;
}

// Fine pointers only: the glass light follows the cursor inside a hovered card and the
// hero visual shifts gently towards it. One delegated listener, one frame per update.
function usePointerLight(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!page || !finePointer || reduceMotion) return undefined;

    const visual = page.querySelector(".pr-visual");
    const clamp = (value) => Math.max(-1, Math.min(1, value));
    let frame = 0;
    let latest = null;

    const apply = () => {
      frame = 0;
      const { target, x, y } = latest;
      const card = target.closest?.("[data-pr-glass]");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--pr-mx", `${Math.round(x - rect.left)}px`);
        card.style.setProperty("--pr-my", `${Math.round(y - rect.top)}px`);
      }
      const hero = target.closest?.(".pr-hero");
      if (hero && visual) {
        const rect = hero.getBoundingClientRect();
        visual.style.setProperty("--pr-px", clamp(((x - rect.left) / rect.width) * 2 - 1).toFixed(3));
        visual.style.setProperty("--pr-py", clamp(((y - rect.top) / rect.height) * 2 - 1).toFixed(3));
      }
    };
    const handleMove = (event) => {
      latest = { target: event.target, x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const hero = page.querySelector(".pr-hero");
    const handleHeroLeave = () => {
      visual?.style.setProperty("--pr-px", "0");
      visual?.style.setProperty("--pr-py", "0");
    };

    page.addEventListener("pointermove", handleMove, { passive: true });
    hero?.addEventListener("pointerleave", handleHeroLeave);
    return () => {
      page.removeEventListener("pointermove", handleMove);
      hero?.removeEventListener("pointerleave", handleHeroLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pageRef]);
}

// Floating chrome appears once the hero CTA has scrolled away. The mobile bar also
// hides again at the closing CTA section, so there is never a duplicate CTA on screen.
function useScrollChrome(pageRef) {
  const [chrome, setChrome] = useState({ pastHero: false, reachedFinal: false });

  useEffect(() => {
    const page = pageRef.current;
    const heroCta = page?.querySelector(".pr-hero-actions");
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
  { id: "website-einstieg", label: "Website" },
  { id: "betreuung", label: "Betreuung" },
  { id: "seo", label: "SEO" },
  { id: "add-ons", label: "Add-ons" },
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

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`pr-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function StickyHeader({ visible, active }) {
  return (
    <div className={`pr-topbar${visible ? " is-visible" : ""}`} inert={!visible}>
      <div className="pr-topbar-inner">
        <a className="pr-brand" href="/" aria-label="TigerFlow Startseite">
          <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
          <span>TigerFlow</span>
        </a>
        <nav className="pr-topbar-links" aria-label="Abschnitte">
          {topbarLinks.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ProjectCheckButton className="pr-btn-sm">
          Projekt-Check <ArrowRight size={15} aria-hidden="true" />
        </ProjectCheckButton>
      </div>
    </div>
  );
}

function StickyCta({ visible }) {
  return (
    <div className={`pr-sticky${visible ? " is-visible" : ""}`} inert={!visible}>
      <div className="pr-sticky-price">
        <b>Website ab 829 €</b>
        <span>netto zzgl. USt.</span>
      </div>
      <ProjectCheckButton>
        Projekt-Check <ArrowRight size={16} aria-hidden="true" />
      </ProjectCheckButton>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="pr-nav">
      <a className="pr-brand" href="/" aria-label="TigerFlow Startseite">
        <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
        <span>TigerFlow</span>
      </a>
      <nav className="pr-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath="/preise" />
        <a href="#website-einstieg">Website</a>
        <a href="#betreuung">Betreuung</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button
        type="button"
        className="pr-nav-cta"
        data-project-check-cta
        aria-label="Projekt-Check starten"
        onClick={openProjectCheck}
      >
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}

// "Vom Einstiegspreis zum klar abgegrenzten Projektumfang": the included core carries
// the price, optional modules sit visibly outside it, and a calm connector leads to
// the written fixed-price offer.
function ScopeVisual() {
  return (
    <div className="pr-visual" aria-hidden="true">
      <div className="pr-core pr-surface">
        <div className="pr-core-head">
          <b>ENTHALTENER KERN</b>
          <em>Website-Einstieg</em>
        </div>
        <div className="pr-core-price">
          <small>ab</small>
          <strong>829 €</strong>
          <span>netto zzgl. USt.</span>
        </div>
        <div className="pr-core-modules">
          {coreModules.map(({ icon: Icon, title, text }, index) => (
            <div className="pr-module" key={title} style={{ "--pr-i": index }}>
              <Icon size={16} />
              <b>{title}</b>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pr-orbit">
        <span className="pr-orbit-label">Optional, separat</span>
        <div className="pr-orbit-chips">
          {optionalModules.map((label, index) => (
            <span className="pr-chip" key={label} style={{ "--pr-i": index }}>
              <Plus size={12} /> {label}
            </span>
          ))}
        </div>
      </div>
      <div className="pr-connector"><i /></div>
      <div className="pr-offer pr-glass">
        <FileCheck2 size={18} />
        <div><b>Schriftliches Festpreisangebot</b><span>nach Bedarfsklärung, Umfang festgehalten</span></div>
      </div>
      <div className="pr-visual-glow" />
    </div>
  );
}

// Decorative glass layer of a card; it only becomes visible while the card is hovered.
const Sheen = () => <span className="pr-sheen" aria-hidden="true" />;

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`pr-intro ${className}`.trim()} data-pr-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function IconList({ items, icon: Icon, className = "" }) {
  return (
    <ul className={`pr-list ${className}`.trim()}>
      {items.map((item) => (
        <li key={item}>
          <Icon size={15} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PreisePage() {
  const pageRef = useReveal();
  const { pastHero, reachedFinal } = useScrollChrome(pageRef);
  const activeSection = useActiveSection(pageRef);
  usePointerLight(pageRef);

  return (
    <div ref={pageRef} className="pr-page" style={{ background: C.pageBg, color: C.textPri }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="pr-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />

      <main id="inhalt" tabIndex={-1}>
        <section className="pr-hero">
          <div className="pr-grid-bg" aria-hidden="true" />
          <div className="pr-hero-copy">
            <span className="pr-eyebrow">PREISE & LEISTUNGSUMFANG</span>
            <h1>Was kostet eine Website bei TigerFlow?</h1>
            <p className="pr-lead">
              Der Einstieg beginnt bei 829 € netto. Vor dem Projekt erhalten Sie ein
              Festpreisangebot mit klar definiertem Umfang – inklusive Website-Basis, Launch und
              technischer SEO-Grundlage.
            </p>
            <div className="pr-hero-actions">
              <ProjectCheckButton>
                Projekt unverbindlich einordnen <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="pr-text-link" href="#website-einstieg">Leistungen und Preise ansehen</a>
            </div>
          </div>
          <ScopeVisual />
        </section>

        <section id="website-einstieg" className="pr-section pr-entry-section">
          <SectionIntro
            className="pr-intro-split"
            eyebrow="DER WEBSITE-EINSTIEG"
            title="Eine kompakte Unternehmenswebsite mit klar definiertem Umfang."
            text="Der Standardumfang ist vollständig aufgeführt. Was darüber hinausgeht, steht im individuellen Festpreisangebot."
          />
          <div className="pr-entry">
            <aside className="pr-entry-price pr-surface" data-pr-reveal>
              <small>Website-Einstieg</small>
              <strong><em>ab</em> 829 €</strong>
              <span className="pr-entry-vat">netto zzgl. USt.</span>
              <dl className="pr-facts">
                <div><dt>Umfang</dt><dd>bis zu fünf Inhaltsseiten</dd></div>
                <div><dt>Rechtstexte</dt><dd>Impressum und Datenschutz zusätzlich</dd></div>
                <div><dt>Preisform</dt><dd>individueller Festpreis nach Bedarfsklärung</dd></div>
              </dl>
              <div className="pr-pay">
                <span className="pr-pay-label">Zahlungsplan</span>
                <div className="pr-pay-bar">
                  <div><b>50 %</b> <span>bei Beauftragung</span></div>
                  <div><b>50 %</b> <span>vor dem Launch</span></div>
                </div>
              </div>
              <p>
                Der öffentliche Preis ist ein Einstiegspreis, kein pauschaler Endpreis für jedes
                Projekt. Nach der Bedarfsklärung erhalten Sie ein individuell kalkuliertes
                Festpreisangebot mit festgehaltenem Umfang.
              </p>
              <ProjectCheckButton className="pr-btn-block">
                Umfang einordnen <ArrowRight size={16} aria-hidden="true" />
              </ProjectCheckButton>
            </aside>
            <div className="pr-entry-scope">
              <article className="pr-card" data-pr-reveal="pop" data-pr-glass>
                <Sheen />
                <h3>Im Einstiegspreis enthalten</h3>
                <ul className="pr-included">
                  {included.map((item) => (
                    <li key={item}>
                      <Check size={15} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="pr-card pr-seo-base" data-pr-reveal="pop" data-pr-order="1" data-pr-glass>
                <Sheen />
                <h3>Die technische SEO-Basis umfasst</h3>
                <ul className="pr-tags">
                  {seoBase.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <p className="pr-aside" data-pr-reveal>
                Korrekturen innerhalb des vereinbarten Leistungsumfangs haben vor dem Launch keine
                feste Rundenzahl. Zusätzliche Seiten, neue Funktionen, grundlegende Richtungswechsel
                und sonstige Erweiterungen werden separat kalkuliert.
              </p>
              <a className="pr-link-row" href="/webdesign-schleswig-holstein" data-pr-reveal>
                <Globe2 size={18} aria-hidden="true" />
                <span>Webdesign-Leistung für Schleswig-Holstein im Detail</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="preisfaktoren" className="pr-section pr-band">
          <SectionIntro
            eyebrow="PREISFAKTOREN"
            title="Was den endgültigen Preis verändert."
            text="Fünf Faktoren erklären, warum ein konkretes Angebot vom Einstiegspreis abweichen kann."
          />
          <ol className="pr-factors" role="list">
            {factors.map((item, index) => (
              <li
                className="pr-card pr-factor"
                key={item.title}
                data-pr-reveal="pop"
                data-pr-order={index}
                data-pr-glass
              >
                <Sheen />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <p className="pr-aside" data-pr-reveal>
            Komplexe Shops, umfangreiche Webanwendungen, Portale, Mitgliederbereiche oder Projekte
            mit vielen individuellen Schnittstellen können Sie ebenfalls anfragen. Sie werden
            individuell geprüft und kalkuliert.
          </p>
        </section>

        <section id="leistungen" className="pr-section">
          <SectionIntro
            className="pr-intro-split"
            eyebrow="ENTHALTEN, OPTIONAL, EXTERN"
            title="Drei Kostenarten, sichtbar getrennt."
            text="Was im Einstieg enthalten ist, was TigerFlow optional übernimmt und welche Kosten bei Dritten entstehen können."
          />
          <div className="pr-split">
            {splitGroups.map(({ title, tone, icon, items }, index) => (
              <article
                className={`pr-group pr-group-${tone}`}
                key={title}
                data-pr-reveal="pop"
                data-pr-order={index}
                data-pr-glass
              >
                <Sheen />
                <h3>{title}</h3>
                <IconList items={items} icon={icon} />
              </article>
            ))}
          </div>
          <p className="pr-note" data-pr-reveal>
            <FileCheck2 size={16} aria-hidden="true" />
            <span>Fremdkosten werden vor Beauftragung ausgewiesen.</span>
          </p>
          <div className="pr-legal" data-pr-reveal>
            <h3>Rechtstexte und Barrierefreiheit</h3>
            <p>
              TigerFlow erstellt Rechtstextentwürfe anhand der von Ihnen bereitgestellten
              Informationen. Das ist keine Rechtsberatung, und eine rechtliche Konformität wird
              nicht garantiert. Eine verbindliche rechtliche Prüfung erfolgt bei Bedarf durch eine
              qualifizierte Stelle. Die Barrierefreiheits-Basis ist keine formale WCAG- oder
              BFSG-Prüfung und keine Konformitätszusage.
            </p>
          </div>
        </section>

        <section id="betreuung" className="pr-section pr-band">
          <SectionIntro
            className="pr-intro-split"
            eyebrow="BETREUUNG NACH DEM LAUNCH"
            title="Optionale Servicepakete für Wartung und Änderungen."
            text="Die Servicepakete sind optional und keine Voraussetzung für den Websitekauf. Auch ohne Paket wird Ihre Website fertig und veröffentlicht übergeben; spätere Arbeiten werden dann bei Bedarf gesondert vereinbart."
          />
          <ol className="pr-plans" role="list">
            {plans.map((plan, index) => (
              <li
                className="pr-plan"
                key={plan.name}
                data-pr-reveal="pop"
                data-pr-order={index}
                data-pr-glass
              >
                <Sheen />
                <div className="pr-plan-head">
                  <h3>{plan.name}</h3>
                  <p><strong>{plan.price}</strong> <span>netto pro Monat</span></p>
                </div>
                <IconList items={plan.items} icon={Check} />
                {plan.excluded && (
                  <IconList items={plan.excluded} icon={Minus} className="pr-list-muted pr-list-tight" />
                )}
              </li>
            ))}
          </ol>
          <ul className="pr-terms" data-pr-reveal>
            {planTerms.map((term) => <li key={term}>{term}</li>)}
          </ul>
        </section>

        <section id="seo" className="pr-section">
          <SectionIntro
            className="pr-intro-split"
            eyebrow="SEO UND SICHTBARKEIT"
            title="Technische SEO-Basis enthalten, strategische SEO separat."
            text="Die Stufen bauen aufeinander auf. So bleibt klar, dass die SEO-Basis der Website keine SEO-Strategie und keine laufende Optimierung ersetzt."
          />
          <ol className="pr-seo-steps" role="list">
            <li className="pr-seo-step pr-seo-step-in" data-pr-reveal="pop" data-pr-glass>
              <Sheen />
              <em>Im Website-Einstieg enthalten</em>
              <h3>Technische SEO-Basis</h3>
              <p>Seitentitel, Meta-Descriptions, Überschriftenstruktur, Indexierbarkeit, Sitemap, robots.txt und Canonicals.</p>
            </li>
            <li className="pr-seo-step pr-seo-step-key" data-pr-reveal="pop" data-pr-order="1" data-pr-glass>
              <Sheen />
              <em>Separat · einmalig</em>
              <h3>SEO-Setup <strong>ab 499 €</strong> <span>netto zzgl. USt.</span></h3>
              <div className="pr-seo-lists">
                <div>
                  <h4>Enthalten</h4>
                  <IconList items={seoSetupIncluded} icon={Check} />
                </div>
                <div>
                  <h4>Nicht enthalten</h4>
                  <IconList items={seoSetupExcluded} icon={Minus} className="pr-list-muted" />
                </div>
              </div>
              <p>Der konkrete Festpreis richtet sich nach Umfang, Websitegröße, Markt und Wettbewerb.</p>
            </li>
            <li className="pr-seo-step" data-pr-reveal="pop" data-pr-order="2" data-pr-glass>
              <Sheen />
              <em>Separat</em>
              <h3>Umsetzung</h3>
              <p>Technische und redaktionelle Umsetzung der Maßnahmen sowie neue Zielseiten werden nach Vereinbarung kalkuliert.</p>
            </li>
            <li className="pr-seo-step pr-seo-ongoing" data-pr-reveal="pop" data-pr-order="3" data-pr-glass>
              <Sheen />
              <em>Individuell</em>
              <h3>Laufende SEO-Betreuung</h3>
              <p>
                Wird individuell kalkuliert und setzt das SEO-Setup oder eine gleichwertige
                vorhandene Analyse voraus. Es gelten sechs Monate Mindestlaufzeit, danach monatlich
                kündbar. Keine Ranking-, Traffic-, Lead- oder Umsatzgarantie; Offpage-Maßnahmen und
                Fremdkosten nur nach separater Vereinbarung.
              </p>
            </li>
          </ol>
          <a className="pr-link-row" href="/seo-heide" data-pr-reveal>
            <Search size={18} aria-hidden="true" />
            <span>SEO-Setup und Vorgehen im Detail ansehen</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="add-ons" className="pr-section pr-band">
          <SectionIntro
            eyebrow="ADD-ONS"
            title="Erweiterungen mit klar begrenztem Umfang."
            text="Jede Erweiterung ist so beschrieben, wie sie angeboten wird – nicht größer."
          />
          <div className="pr-addons">
            {addons.map(({ icon: Icon, title, price, note, conditions, included: items, excludedTitle, excluded }, index) => (
              <article
                className="pr-card pr-addon"
                key={title}
                data-pr-reveal="pop"
                data-pr-order={index}
                data-pr-glass
              >
                <Sheen />
                <Icon size={20} aria-hidden="true" />
                <h3>{title}</h3>
                <p className="pr-addon-price"><strong>{price}</strong> <span>{note}</span></p>
                {conditions ? (
                  <IconList items={items} icon={Dot} className="pr-list-muted" />
                ) : (
                  <IconList items={items} icon={Check} />
                )}
                {excluded && (
                  <>
                    <h4>{excludedTitle}</h4>
                    <IconList items={excluded} icon={Minus} className="pr-list-muted" />
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="ablauf" className="pr-section pr-sidebar-section">
          <SectionIntro
            eyebrow="ABLAUF"
            title="In sieben Schritten zum schriftlichen Festpreis."
            text="Gezahlt wird in zwei Hälften: bei Beauftragung und vor dem Launch."
          />
          <div>
            <ol className="pr-steps" role="list">
              {steps.map((step, index) => (
                <li
                  className={`pr-step${step.payment ? " pr-step-pay" : ""}`}
                  key={step.title}
                  data-pr-reveal
                  data-pr-order={index}
                >
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="pr-aside" data-pr-reveal>
              Eine pauschale Projektdauer nennen wir bewusst nicht, weil sie von Umfang, Inhalten
              und Abstimmungen abhängt.
            </p>
          </div>
        </section>

        <section id="faq" className="pr-section pr-band pr-sidebar-section">
          <SectionIntro eyebrow="FAQ" title="Häufige Fragen zu Preisen und Leistungsumfang" />
          <div className="pr-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="pr-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="pr-section pr-final">
          <div className="pr-final-card pr-surface" data-pr-reveal>
            <div className="pr-final-glow" aria-hidden="true" />
            <span><Compass size={14} aria-hidden="true" /> NÄCHSTER SCHRITT</span>
            <h2>Welcher Umfang passt zu Ihrem Projekt?</h2>
            <p>
              Im Projekt-Check ordnen Sie Website, gewünschte Funktionen und Zeitrahmen
              unverbindlich ein. Danach lässt sich der tatsächliche Umfang sauber kalkulieren.
            </p>
            <ProjectCheckButton>
              Projekt-Check starten <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail?{" "}
              <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="pr-home-link" href="/">
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
