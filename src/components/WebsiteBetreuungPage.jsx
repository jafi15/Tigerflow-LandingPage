import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Compass,
  FileCheck2,
  GitBranch,
  Globe2,
  Mail,
  Minus,
  PencilLine,
  Plus,
  Search,
  Wrench,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./WebsiteBetreuungPage.css";

const PATH = "/website-betreuung";
const PAGE_URL = `${SITE_URL}${PATH}`;
const route = ROUTES.find(({ path }) => path === PATH);

// Exactly the seven confirmed monthly checks; the hero visual uses the short labels.
const maintenanceChecks = [
  {
    title: "Prüfung der Erreichbarkeit",
    short: "Erreichbarkeit",
    text: "Ist die Website unter ihrer Domain aufrufbar?",
  },
  {
    title: "Kontrolle von Build und Deployment",
    short: "Build & Deployment",
    text: "Läuft der Build fehlerfrei, und ist der veröffentlichte Stand der erwartete?",
  },
  {
    title: "Funktionstest vorhandener Formulare",
    short: "Formulare",
    text: "Vorhandene Formulare werden einmal monatlich auf ihre grundlegende Funktion geprüft. Eine produktive Testübermittlung wird nicht pauschal zugesagt.",
  },
  {
    title: "Prüfung wichtiger interner und externer Links",
    short: "Links",
    text: "Wichtige Verweise innerhalb der Website und nach außen werden kontrolliert.",
  },
  {
    title: "Kontrolle von Domain und SSL-Zertifikat",
    short: "Domain & SSL",
    text: "Domain-Anbindung und Zertifikat werden auf Auffälligkeiten geprüft.",
  },
  {
    title: "Prüfung relevanter Abhängigkeiten und bekannter Sicherheitsprobleme",
    short: "Abhängigkeiten",
    text: "Verwendete Pakete werden auf bekannte Probleme und nötige Aktualisierungen geprüft.",
  },
  {
    title: "Nachvollziehbare Versionierung ausgeführter Änderungen über GitHub",
    short: "Versionierung",
    text: "Jede ausgeführte Änderung bleibt im Verlauf nachvollziehbar.",
  },
];

const serviceLayers = [
  {
    icon: Wrench,
    tone: "tech",
    label: "Wartung",
    title: "Technik",
    text: "Technische Wartung einmal monatlich – entlang einer festen Prüfroutine.",
  },
  {
    icon: PencilLine,
    tone: "change",
    label: "Pflege",
    title: "Änderungen",
    text: "Ein tarifabhängiges Kontingent für kleinere Änderungen innerhalb der bestehenden Website.",
  },
  {
    icon: Mail,
    tone: "support",
    label: "Betreuung",
    title: "Hosting und Support",
    text: "Betreuung des Hostings im vereinbarten System und Support per E-Mail während üblicher Geschäftszeiten.",
  },
];

const sharedScope = [
  "Technische Wartung einmal monatlich",
  "Betreuung des Hostings im vereinbarten System",
  "Support per E-Mail während üblicher Geschäftszeiten",
];

// Quota on a common scale: 2 hours fill the bar, so the depth difference is visible.
const servicePlans = [
  {
    name: "Website-Service Basis",
    price: "49 €",
    quota: "30 Minuten Änderungskontingent pro Monat",
    quotaShare: 0.25,
    items: [],
    excluded: ["Keine Analytics-Leistung"],
    fit: "Für Unternehmen mit Websites, die selten kleinere Inhaltsänderungen benötigen und regelmäßig technisch geprüft werden sollen.",
  },
  {
    name: "Website-Service Wachstum",
    price: "99 €",
    quota: "1 Stunde Änderungskontingent pro Monat",
    quotaShare: 0.5,
    items: ["Einrichtung von Analytics", "Zugang zu einem Analytics-Dashboard"],
    fit: "Für Websites mit regelmäßigem Bedarf an kleineren Aktualisierungen und grundlegenden Nutzungsdaten über ein vereinbartes Analytics-System.",
  },
  {
    name: "Website-Service Premium",
    price: "199 €",
    quota: "2 Stunden Änderungskontingent pro Monat",
    quotaShare: 1,
    items: [
      "Einrichtung von Analytics",
      "Zugang zu einem Analytics-Dashboard",
      "Kurzer monatlicher Bericht mit relevanten Kennzahlen, Einordnung und konkreten Handlungsempfehlungen",
    ],
    fit: "Für Unternehmen mit häufigerem Änderungsbedarf, die die Website-Nutzung regelmäßig eingeordnet erhalten möchten.",
  },
];

const conditions = [
  { term: "Laufzeit", value: "drei Monate Mindestlaufzeit, danach monatlich mit einem Monat Frist kündbar" },
  { term: "Kontingent", value: "Nicht genutztes Änderungskontingent verfällt am Monatsende" },
  { term: "Mehrarbeit", value: "99 € netto pro Stunde zzgl. USt., abgerechnet in 15-Minuten-Einheiten" },
  { term: "Freigabe", value: "Mehrarbeit erfolgt nur nach vorheriger Freigabe" },
  { term: "Support", value: "Keine garantierte Reaktions- oder Behebungszeit" },
  {
    term: "Fremdkosten",
    value: "Hosting-, Plattform-, Domain-, Lizenz- und sonstige Fremdkosten sind nicht im Paketpreis enthalten und werden projektbezogen vor Beauftragung ausgewiesen",
  },
  { term: "SEO", value: "Strategische oder laufende SEO-Leistungen nur bei ausdrücklicher Zusatzvereinbarung" },
  { term: "Projekte", value: "Zusätzliche Seiten, neue Funktionen, größere Umgestaltungen und eigenständige Projekte werden separat angeboten" },
];

const smallChanges = [
  "Texte korrigieren",
  "Vorhandene Bilder austauschen",
  "Kontaktangaben oder Öffnungszeiten aktualisieren",
  "Links anpassen",
  "Bestehende Inhalte in kleinerem Umfang aktualisieren",
];

const separateProjects = [
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
];

const reviewCases = [
  "Komplexe Shops",
  "Portale und individuelle Webanwendungen",
  "Nicht dokumentierte Altsysteme",
  "Systeme ohne notwendige Zugänge",
  "Akute Sicherheitsvorfälle oder Wiederherstellungsprojekte",
  "24/7-Bereitschaft",
  "Systeme, deren technische oder rechtliche Risiken TigerFlow nicht vertretbar übernehmen kann",
];

const excludedServices = [
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
];

const faqs = [
  {
    question: "Was ist der Unterschied zwischen Website-Wartung, Pflege und Betreuung?",
    answer:
      "Wartung ist die monatliche technische Prüfroutine. Pflege meint kleinere Änderungen an Inhalten im vereinbarten Kontingent. Betreuung verbindet beides mit der Begleitung des Hostings im vereinbarten System und Support per E-Mail während üblicher Geschäftszeiten.",
  },
  {
    question: "Was kostet die Website-Betreuung bei TigerFlow?",
    answer:
      "Website-Service Basis kostet 49 €, Website-Service Wachstum 99 € und Website-Service Premium 199 € netto pro Monat, jeweils zuzüglich Umsatzsteuer. Die Pakete unterscheiden sich im monatlichen Änderungskontingent und in den Analytics-Leistungen. Fremdkosten sind nicht im Paketpreis enthalten.",
  },
  {
    question: "Was wird einmal monatlich technisch geprüft?",
    answer:
      "TigerFlow prüft die Erreichbarkeit, kontrolliert Build und Deployment, testet vorhandene Formulare, prüft wichtige interne und externe Links, kontrolliert Domain und SSL-Zertifikat, prüft relevante Abhängigkeiten und bekannte Sicherheitsprobleme und versioniert ausgeführte Änderungen nachvollziehbar über GitHub. Das ist kein permanentes Monitoring.",
  },
  {
    question: "Welche Änderungen zählen zum Kontingent?",
    answer:
      "Zum Änderungskontingent können – abhängig von Website und Aufwand – zum Beispiel Textkorrekturen, der Austausch vorhandener Bilder, Anpassungen von Kontaktdaten oder Öffnungszeiten, Linkänderungen und kleinere Aktualisierungen innerhalb bestehender Seiten gehören. Die bestehende Seitenstruktur und Funktion bleiben dabei grundsätzlich erhalten.",
  },
  {
    question: "Was passiert, wenn das Änderungskontingent nicht ausreicht?",
    answer:
      "Passt eine Anfrage voraussichtlich nicht in das vorhandene Kontingent, holen wir vorher Ihre Freigabe ein. Mehrarbeit kostet 99 € netto pro Stunde zuzüglich Umsatzsteuer und wird in 15-Minuten-Einheiten abgerechnet. Neue Seiten, Funktionen oder größere Umgestaltungen werden separat angeboten.",
  },
  {
    question: "Wird ungenutzte Zeit in den nächsten Monat übertragen?",
    answer:
      "Nein. Nicht genutztes Änderungskontingent verfällt am Monatsende und wird nicht in den Folgemonat übertragen.",
  },
  {
    question: "Wie lange läuft ein Servicepaket?",
    answer:
      "Jedes Website-Servicepaket hat eine Mindestlaufzeit von drei Monaten. Danach ist es monatlich mit einem Monat Frist kündbar.",
  },
  {
    question: "Ist SEO in der Website-Betreuung enthalten?",
    answer:
      "Nein. Strategische und laufende SEO-Leistungen sind nicht automatisch enthalten und werden bei Bedarf separat vereinbart. Auch die Analytics-Leistungen der Pakete Wachstum und Premium sind keine SEO-Betreuung.",
  },
  {
    question: "Sind Hosting, Domain und andere Fremdkosten enthalten?",
    answer:
      "Nein. Hosting-, Plattform-, Domain-, Lizenz- und sonstige Fremdkosten sind nicht im Paketpreis enthalten. Sie werden projektbezogen vor Beauftragung ausgewiesen.",
  },
  {
    question: "Sind Backups und Wiederherstellung enthalten?",
    answer:
      "Änderungen am Website-Code werden über GitHub nachvollziehbar versioniert. Eine technische Wiederherstellung richtet sich nach dem jeweils vereinbarten System. Klassische oder tägliche Backups, eine vollständige Wiederherstellung aller externen Daten sowie eine Sicherheits- oder Wiederherstellungsgarantie sind nicht pauschal Bestandteil der Servicepakete.",
  },
  {
    question: "Gibt es garantierte Reaktions- oder Behebungszeiten?",
    answer:
      "Nein. Melden Sie Änderungen oder technische Auffälligkeiten per E-Mail. TigerFlow prüft die Anfrage innerhalb des vereinbarten Service-Rahmens. Eine feste Reaktions- oder Behebungszeit und ein 24/7-Notdienst sind nicht Bestandteil der Standardpakete.",
  },
  {
    question: "Betreut TigerFlow auch Websites anderer Anbieter?",
    answer:
      "Von TigerFlow erstellte Websites können direkt betreut werden. Bei bestehenden Websites anderer Anbieter prüfen wir zuerst Technik, Zugänge und Umfang. Danach erhalten Sie ein individuelles Angebot; eine Übernahme jedes Systems wird nicht pauschal zugesagt.",
  },
  {
    question: "Muss ich beim Websitekauf ein Servicepaket buchen?",
    answer:
      "Nein. Ein monatliches Servicepaket ist keine Voraussetzung für den Kauf einer TigerFlow-Website. Ohne Paket wird die Website nach dem vereinbarten Projektabschluss über die vorgesehene Kundenstruktur betrieben; laufende Fremdkosten trägt der Kunde. Spätere Prüfungen, Änderungen oder Unterstützung werden dann nur nach separater Anfrage und Vereinbarung übernommen.",
  },
  {
    question: "Was geschieht bei einer Kündigung?",
    answer:
      "Ein Servicepaket läuft mindestens drei Monate. Danach können Sie es monatlich mit einer Frist von einem Monat kündigen. Maßgeblich bleibt Ihr individuelles Angebot beziehungsweise Ihr Vertrag.",
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
      mainEntity: { "@id": `${PAGE_URL}#service` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Website-Betreuung", item: PAGE_URL },
      ],
    },
    {
      // Deliberately without Offer markup: 49 € is an entry price per month, not a universal price.
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "Website-Betreuung",
      serviceType: "Website-Wartung und Website-Betreuung",
      description:
        "Monatliche technische Prüfroutine, kleinere Änderungen im vereinbarten Kontingent und Support per E-Mail während üblicher Geschäftszeiten.",
      provider: { "@type": "Organization", name: "TigerFlow", url: `${SITE_URL}/` },
      url: PAGE_URL,
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
// without JS, with reduced motion or in the initial HTML everything stays visible.
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const page = ref.current;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!page || reduceMotion || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          target.style.transitionDelay = `${Number(target.dataset.wbOrder ?? 0) * 60}ms`;
          target.classList.remove("wb-reveal-pending");
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    page.querySelectorAll("[data-wb-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("wb-reveal-pending");
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`wb-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function PageHeader() {
  return (
    <header className="wb-nav">
      <a className="wb-brand" href="/" aria-label="TigerFlow Startseite">
        <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
        <span>TigerFlow</span>
      </a>
      <nav className="wb-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath={PATH} />
        <a href="#pruefroutine">Prüfroutine</a>
        <a href="#pakete">Pakete</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button
        type="button"
        className="wb-nav-cta"
        data-project-check-cta
        aria-label="Projekt-Check starten"
        onClick={openProjectCheck}
      >
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}

// "Eine Website als laufendes System mit nachvollziehbarem monatlichem Prüfpfad": the
// website/deployment layer in the centre, seven calm check stations on one monthly cycle,
// and the three service layers it rests on. Decorative; the content is in the sections below.
function CycleVisual() {
  return (
    <div className="wb-visual" aria-hidden="true">
      <div className="wb-cycle">
        <div className="wb-ring" />
        <ol className="wb-stations">
          {maintenanceChecks.map(({ short }, index) => (
            <li className="wb-station" key={short} style={{ "--wb-i": index }}>
              <i>{index + 1}</i>
              <span>{short}</span>
            </li>
          ))}
        </ol>
        <div className="wb-core wb-glass">
          <span className="wb-core-label">Monatlicher Prüfpfad</span>
          <b>Ihre Website</b>
          <span className="wb-core-meta">
            <GitBranch size={13} /> Produktion · versioniert
          </span>
        </div>
        <div className="wb-cycle-glow" />
      </div>
      <div className="wb-strata">
        {serviceLayers.map(({ tone, title }) => (
          <span className={`wb-stratum wb-stratum-${tone}`} key={tone}>{title}</span>
        ))}
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`wb-intro ${className}`.trim()} data-wb-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function IconList({ items, icon: Icon, className = "" }) {
  return (
    <ul className={`wb-list ${className}`.trim()}>
      {items.map((item) => (
        <li key={item}>
          <Icon size={15} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LinkRow({ href, icon: Icon, children }) {
  return (
    <a className="wb-link-row" href={href}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
      <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
}

export function WebsiteBetreuungPage() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef} className="wb-page" style={{ background: C.pageBg, color: C.textPri }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="wb-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />

      <main id="inhalt" tabIndex={-1}>
        <section className="wb-hero">
          <div className="wb-grid-bg" aria-hidden="true" />
          <div className="wb-hero-copy">
            <span className="wb-eyebrow">WEBSITE-BETREUUNG NACH DEM LAUNCH</span>
            <h1>Website-Betreuung mit klaren Leistungen und Grenzen</h1>
            <p className="wb-lead">
              Monatliche technische Prüfung, kleinere Änderungen und E-Mail-Support ab 49 € netto.
              Transparent geregelt – ohne pauschale Sicherheits- oder Reaktionszeitversprechen.
            </p>
            <div className="wb-hero-actions">
              <ProjectCheckButton>
                Projekt unverbindlich einordnen <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="wb-text-link" href="#pakete">Pakete und Leistungen ansehen</a>
            </div>
          </div>
          <CycleVisual />
        </section>

        <section id="leistung" className="wb-section">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="BETREUUNG, WARTUNG, PFLEGE"
            title="Drei Aufgaben, ein klarer Service-Rahmen"
            text="Website-Betreuung bedeutet bei TigerFlow nicht „alles unbegrenzt“. Sie verbindet eine feste monatliche Prüfroutine mit einem klaren Änderungskontingent und einem Ansprechpartner für die bestehende Website."
          />
          <ol className="wb-layers" role="list">
            {serviceLayers.map(({ icon: Icon, tone, label, title, text }, index) => (
              <li className={`wb-layer wb-layer-${tone}`} key={tone} data-wb-reveal data-wb-order={index}>
                <Icon size={20} aria-hidden="true" />
                <em>{label}</em>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="wb-aside" data-wb-reveal>
            Alle drei Pakete enthalten technische Wartung einmal monatlich, Betreuung des Hostings
            im vereinbarten System, Support per E-Mail während üblicher Geschäftszeiten und ein
            tarifabhängiges Kontingent für kleinere Änderungen innerhalb der bestehenden Website.
          </p>
        </section>

        <section id="pruefroutine" className="wb-section wb-band wb-sidebar-section">
          <div className="wb-sidebar">
            <SectionIntro
              eyebrow="MONATLICHE PRÜFROUTINE"
              title="Was TigerFlow einmal monatlich technisch prüft"
              text="Sieben feste Prüfpunkte, einmal im Monat in derselben Reihenfolge. Das ist eine regelmäßige Kontrolle, kein permanentes Monitoring."
            />
            <p className="wb-notice" data-wb-reveal>
              Die Prüfung reduziert keine technischen Risiken auf null und ersetzt keine gesondert
              vereinbarte Notfall-, Sicherheits- oder Backup-Lösung.
            </p>
          </div>
          <ol className="wb-checks" role="list">
            {maintenanceChecks.map(({ title, text }, index) => (
              <li className="wb-check" key={title} data-wb-reveal data-wb-order={index}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pakete" className="wb-section">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="WEBSITE-SERVICEPAKETE"
            title="Drei Website-Servicepakete"
            text="Die Pakete unterscheiden sich in der Service-Tiefe: im monatlichen Änderungskontingent und in den Analytics-Leistungen. Die technische Basis ist in allen gleich."
          />
          <div className="wb-shared" data-wb-reveal>
            <h3>In allen drei Paketen enthalten</h3>
            <IconList items={sharedScope} icon={Check} />
          </div>
          <ol className="wb-plans" role="list">
            {servicePlans.map((plan, index) => (
              <li className="wb-plan" key={plan.name} data-wb-reveal data-wb-order={index}>
                <div className="wb-plan-head">
                  <h3>{plan.name}</h3>
                  <p className="wb-plan-price">
                    <strong>{plan.price}</strong> <span>netto pro Monat zzgl. USt.</span>
                  </p>
                </div>
                <div className="wb-quota">
                  <span className="wb-quota-bar" style={{ "--wb-share": plan.quotaShare }}><i /></span>
                  <b>{plan.quota}</b>
                </div>
                <IconList items={["Gemeinsame technische Basis", ...plan.items]} icon={Check} />
                {plan.excluded && (
                  <IconList items={plan.excluded} icon={Minus} className="wb-list-muted" />
                )}
                <p className="wb-plan-fit">{plan.fit}</p>
              </li>
            ))}
          </ol>
          <p className="wb-aside" data-wb-reveal>
            Das Analytics-System wird projektbezogen ausgewählt. Datenschutz-, Consent-,
            Konfigurations- und Fremdkostenfragen werden vor der Einrichtung geklärt. Analytics ist
            keine laufende SEO-Betreuung und keine Erfolgszusage.
          </p>
        </section>

        <section id="aenderungen" className="wb-section wb-band">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="ÄNDERUNGSRAHMEN"
            title="Kleine Aktualisierung oder eigenes Projekt?"
            text="Die bestehende Seitenstruktur und Funktion bleiben grundsätzlich erhalten. Der tatsächliche Zeitaufwand entscheidet, ob eine Anfrage in das Kontingent passt."
          />
          <div className="wb-scope">
            <div className="wb-scope-in" data-wb-reveal>
              <em>Bestehende Website</em>
              <h3>Im Kontingent möglich, abhängig vom Aufwand</h3>
              <IconList items={smallChanges} icon={Check} />
            </div>
            <div className="wb-scope-edge" aria-hidden="true"><span>Grenze</span></div>
            <div className="wb-scope-out" data-wb-negative data-wb-reveal data-wb-order="1">
              <em>Eigenes Projekt</em>
              <h3>Separat kalkuliert</h3>
              <IconList items={separateProjects} icon={Plus} className="wb-list-muted" />
            </div>
          </div>
          <p className="wb-note" data-wb-reveal>
            <FileCheck2 size={16} aria-hidden="true" />
            <span>
              Passt eine Anfrage voraussichtlich nicht in das vorhandene Kontingent, erfolgt
              Mehrarbeit erst nach Ihrer Freigabe.
            </span>
          </p>
        </section>

        <section id="konditionen" className="wb-section">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="KONDITIONEN"
            title="Konditionen auf einen Blick"
            text="Diese Bedingungen gelten für alle drei Website-Servicepakete."
          />
          <dl className="wb-terms" data-wb-reveal>
            {conditions.map(({ term, value }) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="wb-aside" data-wb-reveal>
            Abrechnungsrhythmus und weitere Vertragsdetails stehen im Angebot. Maßgeblich bleibt das
            individuelle Angebot beziehungsweise der Vertrag.
          </p>
        </section>

        <section id="bestehende-websites" className="wb-section wb-band">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="NEU ODER BEREITS VORHANDEN"
            title="Betreuung für neue und bestehende Websites"
            text="Von TigerFlow erstellte Websites können direkt in einen passenden Service übergehen. Bei Websites anderer Anbieter prüfen wir zuerst Technik, Zugänge und bestehenden Zustand. Erst danach lässt sich verbindlich sagen, ob und in welchem Umfang TigerFlow die Betreuung übernimmt."
          />
          <div className="wb-origin">
            <article className="wb-origin-card wb-origin-direct" data-wb-reveal>
              <em>Von TigerFlow erstellt</em>
              <h3>Direkter Übergang</h3>
              <p>
                Technik, Zugänge und Aufbau sind bekannt. Die Website kann nach dem Launch direkt in
                das passende Website-Servicepaket übergehen.
              </p>
            </article>
            <article className="wb-origin-card" data-wb-reveal data-wb-order="1">
              <em>Website eines anderen Anbieters</em>
              <h3>Erst prüfen, dann anbieten</h3>
              <ol className="wb-path" role="list">
                <li>Technische Prüfung von Technik, Zugängen und Zustand</li>
                <li>Individuelles Angebot</li>
              </ol>
              <p>
                Danach erhalten Sie ein individuelles Angebot; eine Übernahme jedes Systems wird
                nicht pauschal zugesagt.
              </p>
              <ProjectCheckButton className="wb-btn-quiet">
                Website-Projekt einordnen <ArrowRight size={16} aria-hidden="true" />
              </ProjectCheckButton>
            </article>
          </div>
          <div className="wb-review" data-wb-negative data-wb-reveal>
            <h3>Nicht automatisch im Standardumfang – auf Anfrage gesondert geprüft und kalkuliert</h3>
            <IconList items={reviewCases} icon={Minus} className="wb-list-muted wb-list-cols" />
          </div>
          <p className="wb-region" data-wb-reveal>
            TigerFlow arbeitet aus Heide mit Schwerpunkt Schleswig-Holstein. Geeignete Web- und
            Betreuungsprojekte können auch deutschlandweit umgesetzt werden.
          </p>
        </section>

        <section id="transparenz" className="wb-section">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="VERSIONIERUNG, FREMDKOSTEN, GRENZEN"
            title="Was die Betreuung leistet – und was nicht"
            text="Offen benannte Grenzen sind Teil des Service-Rahmens, kein Kleingedrucktes."
          />
          <div className="wb-modules">
            <article className="wb-module" data-wb-reveal>
              <div className="wb-history" aria-hidden="true">
                <i /><i /><i /><i />
              </div>
              <h3>GitHub-Versionierung statt pauschalem Backup-Versprechen</h3>
              <p>
                Änderungen am Website-Code werden über GitHub nachvollziehbar versioniert. Eine
                technische Wiederherstellung richtet sich nach dem jeweils vereinbarten System.
                Klassische oder tägliche Backups, eine vollständige Wiederherstellung aller externen
                Daten sowie eine Sicherheits- oder Wiederherstellungsgarantie sind nicht pauschal
                Bestandteil der Servicepakete.
              </p>
            </article>
            <article className="wb-module" data-wb-reveal data-wb-order="1">
              <Globe2 size={20} aria-hidden="true" />
              <h3>Fremdkosten projektbezogen ausgewiesen</h3>
              <p>
                Hosting-, Plattform-, Domain- und Lizenzkosten sind nicht im Paketpreis enthalten.
                Sie werden vor Beauftragung projektbezogen ausgewiesen.
              </p>
            </article>
            <article className="wb-module" data-wb-reveal data-wb-order="2">
              <Mail size={20} aria-hidden="true" />
              <h3>Keine Sicherheits-, Verfügbarkeits- oder Reaktionszeitgarantie</h3>
              <p>
                Melden Sie Änderungen oder technische Auffälligkeiten per E-Mail. TigerFlow prüft
                die Anfrage innerhalb des vereinbarten Service-Rahmens. Eine feste Reaktions- oder
                Behebungszeit und ein 24/7-Notdienst sind nicht Bestandteil der Standardpakete.
              </p>
            </article>
          </div>
          <div className="wb-excluded" data-wb-negative data-wb-reveal>
            <h3>Nicht in den Servicepaketen enthalten</h3>
            <IconList items={excludedServices} icon={Minus} className="wb-list-muted wb-list-cols" />
          </div>
        </section>

        <section id="optional" className="wb-section wb-band">
          <SectionIntro
            className="wb-intro-split"
            eyebrow="OPTIONAL"
            title="Betreuung ist eine Option – keine Kaufbedingung"
            text="Eine TigerFlow-Website kann auch ohne monatliches Servicepaket beauftragt werden. Das Paket ergänzt den Projektabschluss um regelmäßige Prüfungen, kleinere Änderungen und Support. Ohne Paket werden spätere Leistungen separat vereinbart."
          />
          <div className="wb-optional">
            <p className="wb-aside" data-wb-reveal>
              Ein monatliches Servicepaket ist keine Voraussetzung für den Kauf einer
              TigerFlow-Website. Ohne Paket wird die Website nach dem vereinbarten Projektabschluss
              über die vorgesehene Kundenstruktur betrieben; laufende Fremdkosten trägt der Kunde.
              Spätere Prüfungen, Änderungen oder Unterstützung werden dann nur nach separater
              Anfrage und Vereinbarung übernommen.
            </p>
            <div className="wb-links" data-wb-reveal>
              <LinkRow href="/preise" icon={FileCheck2}>Website-Preise und enthaltene Leistungen ansehen</LinkRow>
              <LinkRow href="/webdesign-schleswig-holstein" icon={Globe2}>Website erstellen oder überarbeiten lassen</LinkRow>
              <LinkRow href="/seo-heide" icon={Search}>SEO-Setup und laufende SEO-Leistungen</LinkRow>
            </div>
          </div>
        </section>

        <section id="faq" className="wb-section wb-sidebar-section">
          <div className="wb-sidebar">
            <SectionIntro eyebrow="FAQ" title="Häufige Fragen zur Website-Betreuung" />
          </div>
          <div className="wb-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="wb-faq-answer"><p>{faq.answer}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="wb-section wb-final">
          <div className="wb-final-card" data-wb-reveal>
            <div className="wb-final-glow" aria-hidden="true" />
            <span><Compass size={14} aria-hidden="true" /> NÄCHSTER SCHRITT</span>
            <h2>Welcher nächste Schritt passt zu Ihrer Website?</h2>
            <p>
              Im Projekt-Check ordnen Sie Ihr aktuelles Ziel und Ihre Ausgangslage unverbindlich
              ein. Ob TigerFlow eine bestehende Fremdwebsite betreuen kann, wird anschließend vor
              einem Angebot technisch geprüft.
            </p>
            <ProjectCheckButton>
              Projekt-Check starten <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail?{" "}
              <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <a className="wb-home-link" href="/">
              <Building2 size={14} aria-hidden="true" /> Alle Leistungen von TigerFlow
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
