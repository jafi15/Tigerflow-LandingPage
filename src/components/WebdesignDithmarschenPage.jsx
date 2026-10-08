import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Globe2,
  Mail,
  MapPin,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { createFaqCloseController } from "./faqMotion";
import { Footer } from "./Footer";
import { setupScrollReveal } from "./scrollReveal";
import "./WebdesignDithmarschenPage.css";

const projectMailto = `mailto:service@tigerflow.de?subject=${encodeURIComponent(
  "Projektanfrage Webdesign Dithmarschen"
)}&body=${encodeURIComponent(
  "Unternehmen:\n\nAktueller Stand:\n\nZiel der Website:\n\nWeitere Hinweise:"
)}`;

const regionalNeeds = [
  {
    number: "01",
    title: "Leistungsgebiet und Erreichbarkeit klar zeigen",
    text: "Besucher sollen ohne Rückfrage erkennen, welches Gebiet im Kreis Sie bedienen und wie sie Sie erreichen.",
  },
  {
    number: "02",
    title: "Direkten Kontaktweg auf dem Smartphone bieten",
    text: "Anfragen entstehen zunehmend mobil und sollen ohne Umwege zu einer Nachricht oder einem Anruf führen.",
  },
  {
    number: "03",
    title: "Unterschiedliche Leistungen verständlich strukturieren",
    text: "Angebote, Zielgruppen und Rahmenbedingungen unterscheiden sich von Betrieb zu Betrieb im Kreis.",
  },
  {
    number: "04",
    title: "Aktuelle Informationen leicht auffindbar halten",
    text: "Besonders bei saisonalen oder touristischen Angeboten sollten Besucher aktuelle Hinweise schnell finden.",
  },
];

const situations = [
  {
    icon: Wrench,
    number: "01",
    title: "Leistungen und Einsatzgebiet",
    audience: "Geeignet für Handwerk und lokale Dienstleistungen",
    text: "Besucher müssen Angebot, Region und Kontaktweg innerhalb von Sekunden erkennen können.",
  },
  {
    icon: Stethoscope,
    number: "02",
    title: "Angebote, Termine oder Anfragen",
    audience: "Geeignet für Gastgeber, Praxen und beratende Unternehmen",
    text: "Vorhandene Abläufe werden verständlich abgebildet; ein Buchungssystem ist dabei optional und kein Standard.",
  },
  {
    icon: Building2,
    number: "03",
    title: "Unternehmen und Kompetenz",
    audience: "Geeignet für Zulieferer, Gewerbe und erklärungsbedürftige B2B-Leistungen",
    text: "Leistungen, Ansprechpartner und der Weg zur Projektanfrage werden übersichtlich dargestellt.",
  },
  {
    icon: RefreshCw,
    number: "04",
    title: "Bestehenden Auftritt modernisieren",
    audience: "Geeignet für branchenunabhängige Redesign-Projekte",
    text: "Bestand, Inhalte, Domain und Weiterleitungen werden zunächst geprüft, bevor der Umfang feststeht.",
  },
];

const scopeItems = [
  "Bis zu fünf Inhaltsseiten",
  "Impressum und Datenschutz",
  "Responsive für Mobil, Tablet und Desktop",
  "Erstellung oder Überarbeitung vereinbarter Texte",
  "Einbindung und Optimierung vorhandener und vereinbarter lizenzierter Bilder",
  "Verlinkung vorhandener Social-Media-Profile",
  "Technische SEO-Basis",
  "Technisch sinnvolle Barrierefreiheits-Basis",
  "Einfacher E-Mail-Anfragefunnel auf Wunsch",
  "Vercel-Veröffentlichung",
  "Domain- und DNS-Anbindung",
  "Launchbereite, öffentlich erreichbare Website",
];

const processSteps = [
  { number: "01", title: "Ausgangslage und Ziel klären" },
  { number: "02", title: "Struktur, Inhalte und Gestaltung entwickeln" },
  { number: "03", title: "Responsive Website umsetzen und abstimmen" },
  { number: "04", title: "Prüfen, freigeben und veröffentlichen" },
];

const growthPath = [
  "SEO-Setup und laufende SEO-Betreuung",
  "Terminbuchung",
  "E-Mail-Follow-up",
  "Website-KI",
  "Projektbezogene CRM- und Automatisierungsprozesse",
];

const faqs = [
  {
    question: "Arbeitet TigerFlow mit Unternehmen im gesamten Kreis Dithmarschen?",
    answer:
      "Ja. TigerFlow sitzt in Heide und entwickelt Websites für Unternehmen im gesamten Kreis Dithmarschen, etwa in Meldorf, Brunsbüttel, Büsum oder Marne. Die Zusammenarbeit erfolgt überwiegend digital; ein persönlicher Termin wird bei Bedarf projektbezogen abgestimmt.",
  },
  {
    question: "Was kostet eine Unternehmenswebsite?",
    answer:
      "Der Einstieg beginnt bei 829 € netto zuzüglich Umsatzsteuer für bis zu fünf Inhaltsseiten plus Impressum und Datenschutz. Nach der Bedarfsklärung erhalten Sie ein individuelles Festpreisangebot.",
  },
  {
    question: "Was ist im Einstiegspreis enthalten?",
    answer:
      "Dazu gehören die responsive Umsetzung, vereinbarte Texte und Bilder, die technische SEO-Basis, auf Wunsch ein einfacher E-Mail-Anfragefunnel, die Veröffentlichung über Vercel sowie die Domain- und DNS-Anbindung.",
  },
  {
    question: "Kann eine bestehende Website überarbeitet werden?",
    answer:
      "Ja. Vor einem Redesign prüfen wir vorhandene Technik, Inhalte, Domain und Weiterleitungen. Der verbindliche Umfang ergibt sich aus dieser Bestandsaufnahme.",
  },
  {
    question: "Erfolgt die Zusammenarbeit digital oder auch persönlich?",
    answer:
      "Abstimmungen, Freigaben und Projektfortschritte lassen sich effizient digital organisieren. Ob und wann ein persönlicher Termin sinnvoll ist, klären wir passend zum Projekt.",
  },
  {
    question: "Ist lokale Suchmaschinenoptimierung enthalten?",
    answer:
      "Eine technische SEO-Basis ist enthalten. Local SEO und laufende SEO-Betreuung sind eigenständige Leistungen und werden bei Bedarf separat vereinbart.",
  },
  {
    question: "Können Buchung, Anfragewege oder Automatisierungen ergänzt werden?",
    answer:
      "Ja, auf Wunsch als projektbezogene Erweiterung, etwa Terminbuchung, E-Mail-Follow-up oder Automatisierungsprozesse. Diese Leistungen sind nicht automatisch im Einstiegsscope enthalten.",
  },
  {
    question: "Welche laufenden Kosten entstehen nach dem Launch?",
    answer:
      "Domain, Hosting, Lizenzen und weitere Fremdkosten trägt grundsätzlich der Kunde. Optionale Servicepakete für Wartung und Betreuung bietet TigerFlow separat an.",
  },
];

function useScrollReveal() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    return setupScrollReveal(page, window);
  }, []);

  return pageRef;
}

function BrandMark() {
  return (
    <a className="wdd-brand" href="/" aria-label="TigerFlow Startseite">
      <img
        src="/tigerflow-mark.png"
        alt=""
        aria-hidden="true"
        width="320"
        height="245"
      />
      <span>TigerFlow</span>
    </a>
  );
}

function PageHeader() {
  return (
    <header className="wdd-nav">
      <BrandMark />
      <nav className="wdd-nav-links" aria-label="Seitennavigation">
        <a href="#situationen">Unternehmen</a>
        <a href="#leistungen">Leistungen</a>
        <a href="#preis">Preis</a>
        <a href="#faq">FAQ</a>
      </nav>
      <a className="wdd-nav-cta" href="#projektanfrage">
        Projekt anfragen <ArrowRight size={15} aria-hidden="true" />
      </a>
    </header>
  );
}

function RegionNetworkVisual() {
  const nodes = [
    { icon: Wrench, label: "Handwerk" },
    { icon: Stethoscope, label: "Gastgeber & Praxis" },
    { icon: Building2, label: "Gewerbe" },
    { icon: RefreshCw, label: "Redesign" },
  ];
  return (
    <div className="wdd-visual" aria-hidden="true">
      <div className="wdd-network">
        <div className="wdd-network-hub">
          <Globe2 size={20} />
          <span>Ihre Website</span>
        </div>
        <div className="wdd-network-nodes">
          {nodes.map(({ icon: Icon, label }, index) => (
            <div
              className="wdd-network-node"
              key={label}
              style={{ "--wdd-node-order": index }}
            >
              <i className="wdd-network-line" />
              <div className="wdd-network-node-card">
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wdd-device-card wdd-device-reach">
        <Compass size={17} />
        <div><b>Kreisweit</b><span>Statt nur eine Stadt</span></div>
      </div>
      <div className="wdd-device-card wdd-device-digital">
        <Mail size={17} />
        <div><b>Digital abgestimmt</b><span>Erreichbar ohne Vor-Ort-Zwang</span></div>
      </div>
      <div className="wdd-visual-glow" />
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="wdd-section-intro" data-wdd-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      <i className="wdd-section-rule" aria-hidden="true" />
    </div>
  );
}

function AnimatedFaq({ faq, index }) {
  const detailsRef = useRef(null);
  const controllerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    controllerRef.current = createFaqCloseController({
      getDetails: () => detailsRef.current,
      motionWindow: window,
      onClosingChange: setIsClosing,
    });

    return () => {
      controllerRef.current?.cleanup();
      controllerRef.current = null;
    };
  }, []);

  const handleFaqSummaryClick = (event) => {
    controllerRef.current?.handleSummaryClick(event);
  };

  return (
    <details
      ref={detailsRef}
      className={isClosing ? "is-closing" : undefined}
      data-wdd-reveal
      style={{ "--wdd-order": index }}
    >
      <summary onClick={handleFaqSummaryClick}>
        {faq.question}<ChevronDown size={18} aria-hidden="true" />
      </summary>
      <div className="wdd-faq-answer">
        <div><p>{faq.answer}</p></div>
      </div>
    </details>
  );
}

export function WebdesignDithmarschenPage() {
  const pageRef = useScrollReveal();

  return (
    <div
      ref={pageRef}
      className="wdd-page"
      style={{ background: C.pageBg, color: C.textPri }}
    >
      <PageHeader />

      <main>
        <section className="wdd-hero">
          <div className="wdd-grid-bg" aria-hidden="true" />
          <div className="wdd-hero-copy">
            <span className="wdd-eyebrow"><MapPin size={13} aria-hidden="true" /> WEBDESIGN FÜR DITHMARSCHEN</span>
            <h1>Webdesign für Unternehmen in Dithmarschen, die digital klar auftreten wollen.</h1>
            <p className="wdd-lead">
              TigerFlow aus Heide entwickelt moderne, responsive Unternehmenswebsites für Betriebe
              im Kreis Dithmarschen – mit verständlicher Struktur, technischer SEO-Basis und einem
              klaren Weg zur Anfrage.
            </p>
            <div className="wdd-price-line">
              <strong>Websites ab 829 € netto</strong>
              <span>
                Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz im bestätigten
                Einstiegsscope. Nach der Bedarfsklärung erhalten Sie ein individuelles
                Festpreisangebot.
              </span>
            </div>
            <div className="wdd-hero-actions">
              <a className="wdd-primary-btn" href="#projektanfrage">
                Projektumfang unverbindlich klären <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="wdd-secondary-btn" href="#leistungen">Leistungsumfang ansehen</a>
            </div>
          </div>
          <RegionNetworkVisual />
        </section>

        <section id="situationen" className="wdd-section wdd-need-section">
          <SectionIntro
            eyebrow="REGIONALER BEDARF"
            title="Ein Kreis. Unterschiedliche Unternehmen. Eine Website muss trotzdem schnell verständlich sein."
            text="Ob Küstenort, Mittelzentrum oder Gewerbestandort: Besucher erwarten in wenigen Sekunden eine Antwort auf dieselben Fragen."
          />
          <div className="wdd-need-list">
            {regionalNeeds.map((need, index) => (
              <div
                className="wdd-need-row"
                key={need.number}
                data-wdd-reveal
                style={{ "--wdd-order": index }}
              >
                <span className="wdd-need-number">{need.number}</span>
                <div>
                  <h3>{need.title}</h3>
                  <p>{need.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wdd-section wdd-situation-section">
          <SectionIntro
            eyebrow="UNTERNEHMENSSITUATIONEN"
            title="Was Unternehmen in Dithmarschen online konkret zeigen müssen"
            text="Vier typische Situationen zeigen, worauf es bei der Struktur ankommt. Es sind keine Branchenreferenzen von TigerFlow."
          />
          <div className="wdd-situation-grid">
            {situations.map(({ icon: Icon, number, title, audience, text }, index) => (
              <article
                className="wdd-situation-card"
                key={number}
                data-wdd-reveal
                style={{ "--wdd-order": index }}
              >
                <div className="wdd-situation-head">
                  <Icon size={20} aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p className="wdd-situation-audience">{audience}</p>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="leistungen" className="wdd-section wdd-scope-section">
          <SectionIntro
            eyebrow="LEISTUNGSUMFANG"
            title="Was Ihre neue TigerFlow-Website mitbringt"
            text="Der bestätigte Einstiegsscope ist bewusst begrenzt. Ob er zu Ihrem Projekt passt, klären wir anhand Ihrer konkreten Anforderungen."
          />
          <div className="wdd-scope-ledger">
            {scopeItems.map((item, index) => (
              <div
                className="wdd-scope-row"
                key={item}
                data-wdd-reveal
                style={{ "--wdd-order": index }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="wdd-scope-note">
            <Check size={18} aria-hidden="true" />
            <p>
              Fotoshooting, umfangreiche Zusatzinhalte, formale Barrierefreiheitsprüfungen und
              strategische SEO-Leistungen gehören nicht automatisch zum Einstiegsscope.
              Impressum und Datenschutz werden als Entwürfe vorbereitet. Keine Rechtsberatung oder
              Rechtssicherheitsgarantie. Fremd-, Domain- und Lizenzkosten trägt grundsätzlich der
              Kunde.
            </p>
          </div>
        </section>

        <section className="wdd-section wdd-collab-section" data-wdd-reveal>
          <div>
            <span className="wdd-eyebrow"><MapPin size={13} aria-hidden="true" /> ZUSAMMENARBEIT IM KREIS</span>
            <h2>Regional erreichbar. Digital effizient abgestimmt.</h2>
            <p>
              <a href="/webdesign-heide">TigerFlow sitzt in Heide</a> und arbeitet mit Unternehmen
              im gesamten Kreis Dithmarschen zusammen. Abstimmungen, Freigaben und
              Projektfortschritte lassen sich effizient digital organisieren, ob für einen Betrieb
              in Heide, Meldorf, Brunsbüttel, Büsum oder Marne. Ob und wann ein persönlicher Termin
              sinnvoll ist, klären wir passend zum Projekt.
            </p>
          </div>
          <aside>
            <b>Arbeitsweise</b>
            <ul>
              <li>Abstimmung per E-Mail, Telefon oder Videocall</li>
              <li>Freigaben und Projektfortschritte digital organisiert</li>
              <li>Persönlicher Termin bei Bedarf projektbezogen</li>
            </ul>
          </aside>
        </section>

        <section id="ablauf" className="wdd-section wdd-process-section">
          <SectionIntro
            eyebrow="PROJEKTABLAUF"
            title="Von der ersten Klärung bis zur veröffentlichten Website"
          />
          <div className="wdd-timeline" data-wdd-reveal>
            <i className="wdd-timeline-progress" aria-hidden="true" />
            {processSteps.map((step, index) => (
              <div
                className="wdd-timeline-step"
                key={step.number}
                data-wdd-reveal
                style={{ "--wdd-order": index }}
              >
                <span className="wdd-timeline-dot">{step.number}</span>
                <h3>{step.title}</h3>
              </div>
            ))}
          </div>
          <p className="wdd-timeline-disclaimer">
            Eine pauschale Projektdauer nennen wir nicht. Der Zeitrahmen richtet sich nach Umfang,
            Funktionen, Inhalten, Freigaben und Ihrer Mitwirkung.
          </p>
        </section>

        <section id="preis" className="wdd-section wdd-price-section">
          <div className="wdd-price-card" data-wdd-reveal>
            <span>TRANSPARENTER EINSTIEG</span>
            <h2>Klarer Einstieg für Ihr Website-Projekt</h2>
            <div className="wdd-price-number">
              <em>ab</em> 829 € <small>netto · zuzüglich gesetzlicher Umsatzsteuer</small>
            </div>
            <p className="wdd-price-scope">
              Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz. Individueller Festpreis
              nach Bedarfsklärung. Zusatzumfang wird separat kalkuliert.
            </p>
            <div className="wdd-payment-row">
              <div><strong>50 %</strong><span>bei Beauftragung</span></div>
              <i aria-hidden="true" />
              <div><strong>50 %</strong><span>vor dem Launch</span></div>
            </div>
            <a className="wdd-secondary-btn" href="#projektanfrage">
              Projektumfang klären <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="wdd-section wdd-growth-section">
          <SectionIntro
            eyebrow="AUSBAUPFAD"
            title="Die Website funktioniert zuerst. Erweiterungen kommen bei Bedarf."
          />
          <div className="wdd-growth-tags" data-wdd-reveal>
            {growthPath.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="wdd-growth-disclaimer">
            Diese Leistungen sind optional und nicht automatisch im Einstiegsscope enthalten.
          </p>
        </section>

        <section id="faq" className="wdd-section wdd-faq-section">
          <SectionIntro eyebrow="FAQ" title="Häufige Fragen zu Webdesign in Dithmarschen" />
          <div className="wdd-faq-list">
            {faqs.map((faq, index) => (
              <AnimatedFaq
                key={faq.question}
                faq={faq}
                index={index}
              />
            ))}
          </div>
        </section>

        <section
          id="projektanfrage"
          className="wdd-section wdd-final-cta"
          data-wdd-reveal
        >
          <div className="wdd-cta-glow" aria-hidden="true" />
          <span><Sparkles size={14} aria-hidden="true" /> UNVERBINDLICHER ERSTER SCHRITT</span>
          <h2>Lassen Sie uns klären, was Ihr Unternehmen online wirklich braucht.</h2>
          <p>
            Beschreiben Sie kurz Ihr Unternehmen, den aktuellen Stand und das Ziel der neuen
            Website. Sie erhalten eine persönliche Rückmeldung zum sinnvollen Umfang und zum
            nächsten Schritt.
          </p>
          <a
            className="wdd-primary-btn"
            href={projectMailto}
          >
            Projektumfang unverbindlich klären <ArrowRight size={17} aria-hidden="true" />
          </a>
          <small>
            Dieser Button öffnet nur einen vorausgefüllten E-Mail-Entwurf in Ihrem
            E-Mail-Programm an service@tigerflow.de. Es wird kein Formular versendet und nichts
            automatisch übertragen oder gespeichert.
          </small>
        </section>
      </main>

      <Footer />
    </div>
  );
}
