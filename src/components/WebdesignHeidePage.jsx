import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Globe2,
  LayoutTemplate,
  Mail,
  MapPin,
  MonitorSmartphone,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import "./WebdesignHeidePage.css";

const scopeItems = [
  "Bis zu fünf Inhaltsseiten",
  "Impressum und Datenschutz",
  "Responsive für Mobil, Tablet und Desktop",
  "Vereinbarte Texte und Bilder",
  "Technische SEO-Basis",
  "Einfacher E-Mail-Anfragefunnel auf Wunsch",
  "Vercel-Veröffentlichung",
  "Domain- und DNS-Anbindung",
];

const process = [
  {
    number: "01",
    title: "Bedarf und Umfang klären",
    text: "Wir erfassen Ziele, Zielgruppen, Seitenumfang, Funktionen und vorhandene Inhalte. Daraus entsteht ein nachvollziehbarer Projektrahmen.",
  },
  {
    number: "02",
    title: "Struktur und Gestaltung entwickeln",
    text: "Seitenaufbau, Nutzerführung, Texte und visuelle Richtung werden so verbunden, dass Besucher Angebot und nächsten Schritt schnell verstehen.",
  },
  {
    number: "03",
    title: "Umsetzen und abstimmen",
    text: "TigerFlow entwickelt die Website responsiv und arbeitet Korrekturen innerhalb des vereinbarten Leistungsumfangs ein.",
  },
  {
    number: "04",
    title: "Prüfen und veröffentlichen",
    text: "Nach Funktionstest und Freigabe folgen Veröffentlichung über Vercel sowie die vereinbarte Domain- und DNS-Anbindung.",
  },
];

const faqs = [
  {
    question: "Was kostet eine Website bei TigerFlow?",
    answer:
      "Der Einstieg beginnt bei 829 € netto zuzüglich Umsatzsteuer. Enthalten sind bis zu fünf Inhaltsseiten plus Impressum und Datenschutz im bestätigten Standardumfang. Nach der Bedarfsklärung erhalten Sie ein individuell kalkuliertes Festpreisangebot.",
  },
  {
    question: "Was ist im Einstiegspreis enthalten?",
    answer:
      "Dazu gehören die responsive Umsetzung, vereinbarte Texte und Bilder, die technische SEO-Basis, auf Wunsch ein einfacher E-Mail-Anfragefunnel, die Veröffentlichung über Vercel sowie die Domain- und DNS-Anbindung.",
  },
  {
    question: "Kann TigerFlow eine bestehende Website überarbeiten?",
    answer:
      "Ja. Vor einem Redesign prüfen wir die vorhandene Technik, Inhalte, Domain, Weiterleitungen und bestehende Systeme. Der verbindliche Umfang ergibt sich aus dieser Bestandsaufnahme.",
  },
  {
    question: "Wie lange dauert die Erstellung?",
    answer:
      "Keine pauschale Dauer: Der Zeitrahmen hängt von Seitenumfang, Funktionen, vorhandenen Inhalten, Freigaben und Ihrer Mitwirkung ab und wird vor der Beauftragung abgestimmt.",
  },
  {
    question: "Sind Texte und Bilder enthalten?",
    answer:
      "Vereinbarte Texte erstellen oder überarbeiten wir anhand Ihrer Informationen. Vorhandene und ausdrücklich vereinbarte, korrekt lizenzierte Bilder werden eingebunden und optimiert. Umfangreiche Zusatzinhalte und ein Fotoshooting sind nicht automatisch enthalten.",
  },
  {
    question: "Ist SEO bereits enthalten?",
    answer:
      "Eine technische SEO-Basis ist enthalten. Keywordstrategie, umfangreiche SEO-Inhalte, Local SEO und laufende Betreuung sind eigenständige Leistungen und werden bei Bedarf separat vereinbart.",
  },
  {
    question: "Welche laufenden Kosten entstehen?",
    answer:
      "Domain, Hosting, Lizenzen und weitere Fremdkosten trägt grundsätzlich der Kunde. Ohne Servicepaket wird die Website über ein Kundenkonto betrieben. Optionale Servicepakete bietet TigerFlow separat an.",
  },
  {
    question: "Unterstützt TigerFlow auch nach dem Launch?",
    answer:
      "Ja, optional mit Servicepaketen für technische Wartung, Betreuung des Hostings, E-Mail-Support und kleinere Änderungen im jeweiligen Monatskontingent.",
  },
];

function BrandMark() {
  return (
    <a className="wdh-brand" href="/" aria-label="TigerFlow Startseite">
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
    <header className="wdh-nav">
      <BrandMark />
      <nav className="wdh-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath="/webdesign-heide" />
        <a href="#ablauf">Ablauf</a>
        <a href="#preis">Preis</a>
        <a href="#faq">FAQ</a>
      </nav>
      <a className="wdh-nav-cta" href="#projektanfrage">
        Projekt anfragen <ArrowRight size={15} aria-hidden="true" />
      </a>
    </header>
  );
}

function WebsiteVisual() {
  return (
    <div className="wdh-visual" aria-hidden="true">
      <div className="wdh-browser">
        <div className="wdh-browser-bar">
          <span />
          <span />
          <span />
          <div>ihre-website.de</div>
        </div>
        <div className="wdh-browser-body">
          <div className="wdh-wire-nav">
            <b>UNTERNEHMEN</b>
            <span />
            <span />
            <i>ANFRAGEN</i>
          </div>
          <div className="wdh-wire-hero">
            <small>KLARER EINSTIEG</small>
            <strong>Ihr Angebot.<br />Verständlich auf den Punkt.</strong>
            <p>Eine moderne Website führt Besucher vom ersten Eindruck zum passenden nächsten Schritt.</p>
            <button type="button" tabIndex="-1">Projekt starten</button>
          </div>
          <div className="wdh-wire-cards"><span /><span /><span /></div>
        </div>
      </div>
      <div className="wdh-device-card wdh-device-mobile">
        <MonitorSmartphone size={17} />
        <div><b>Responsive</b><span>Auf jedem Gerät</span></div>
      </div>
      <div className="wdh-device-card wdh-device-search">
        <Search size={17} />
        <div><b>SEO-Basis</b><span>Technisch vorbereitet</span></div>
      </div>
      <div className="wdh-visual-glow" />
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="wdh-section-intro">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function WebdesignHeidePage() {
  return (
    <div className="wdh-page" style={{ background: C.pageBg, color: C.textPri }}>
      <PageHeader />

      <main>
        <section className="wdh-hero">
          <div className="wdh-grid-bg" aria-hidden="true" />
          <div className="wdh-hero-copy">
            <span className="wdh-eyebrow"><MapPin size={13} /> WEBDESIGN AUS HEIDE</span>
            <h1>Webdesign in Heide für Unternehmen, die online überzeugen wollen.</h1>
            <p className="wdh-lead">
              TigerFlow entwickelt moderne, responsive Unternehmenswebsites – mit klarer
              Struktur, technischer SEO-Basis und einem Anfrageweg, der zu Ihrem Betrieb passt.
            </p>
            <div className="wdh-price-line">
              <strong>Websites ab 829 € netto</strong>
              <span>Bis zu fünf Inhaltsseiten plus Impressum und Datenschutz</span>
            </div>
            <div className="wdh-hero-actions">
              <a className="wdh-primary-btn" href="#projektanfrage">
                Unverbindliche Projektanfrage starten <ArrowRight size={17} />
              </a>
              <a className="wdh-secondary-btn" href="#umfang">Leistungsumfang ansehen</a>
            </div>
          </div>
          <WebsiteVisual />
        </section>

        <section className="wdh-section wdh-problem-section">
          <SectionIntro
            eyebrow="DIGITALE GRUNDLAGE"
            title="Ihre Website sollte mehr leisten als nur vorhanden zu sein."
            text="Besucher müssen schnell verstehen, was Ihr Unternehmen anbietet, warum es relevant ist und wie der nächste Schritt aussieht."
          />
          <div className="wdh-three-grid">
            <article className="wdh-info-card">
              <LayoutTemplate size={22} />
              <h3>Klarer Aufbau</h3>
              <p>Angebot, Nutzen und Kontaktweg werden ohne Umwege verständlich.</p>
            </article>
            <article className="wdh-info-card">
              <MonitorSmartphone size={22} />
              <h3>Auf jedem Gerät</h3>
              <p>Die Website bleibt auf Smartphone, Tablet und Desktop lesbar und bedienbar.</p>
            </article>
            <article className="wdh-info-card">
              <Globe2 size={22} />
              <h3>Bereit für Sichtbarkeit</h3>
              <p>Eine saubere technische Grundlage schafft Raum für spätere SEO-Maßnahmen.</p>
            </article>
          </div>
        </section>

        <section id="umfang" className="wdh-section wdh-scope-section">
          <div className="wdh-scope-copy">
            <SectionIntro
              eyebrow="LEISTUNGSUMFANG"
              title="Was Ihre neue TigerFlow-Website mitbringt"
              text="Der Einstieg ist klar begrenzt und trotzdem vollständig genug für eine professionelle Unternehmenswebsite."
            />
            <div className="wdh-scope-list">
              {scopeItems.map((item) => (
                <div key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></div>
              ))}
            </div>
          </div>
          <aside className="wdh-scope-note">
            <FileText size={24} />
            <span>WICHTIG ZUM SCOPE</span>
            <h3>Transparenz vor Projektstart</h3>
            <p>
              Fotoshooting, umfangreiche Zusatzinhalte, formale Barrierefreiheitsprüfungen
              und strategische SEO-Leistungen gehören nicht automatisch zum Einstiegsscope.
            </p>
            <p>
              TigerFlow erstellt Rechtstextentwürfe anhand Ihrer Angaben, erbringt jedoch
              keine Rechtsberatung. Fremd-, Domain- und Lizenzkosten trägt grundsätzlich der Kunde.
            </p>
          </aside>
        </section>

        <section className="wdh-system-section">
          <div className="wdh-section">
            <SectionIntro
              eyebrow="AUSBAUFÄHIG"
              title="Heute eine starke Website. Morgen ein verbundenes System."
              text="Die Website funktioniert zunächst eigenständig. Wenn der Bedarf wächst, lässt sie sich gezielt erweitern – ohne alle Leistungen von Beginn an zu bündeln."
            />
            <div className="wdh-system-flow">
              <article className="is-active"><LayoutTemplate size={20} /><span>01</span><h3>Website</h3><p>Digitale Grundlage</p></article>
              <i aria-hidden="true" />
              <article><Search size={20} /><span>02</span><h3>SEO</h3><p>Sichtbarkeit ausbauen</p></article>
              <i aria-hidden="true" />
              <article><Mail size={20} /><span>03</span><h3>Follow-up</h3><p>Anfragen strukturieren</p></article>
              <i aria-hidden="true" />
              <article><Workflow size={20} /><span>04</span><h3>Automation</h3><p>Prozesse verbinden</p></article>
            </div>
            <p className="wdh-system-disclaimer">
              SEO, Terminbuchung, E-Mail-Follow-up, Website-KI und Automatisierungen sind optionale Leistungen und werden projektbezogen vereinbart.
            </p>
          </div>
        </section>

        <section id="ablauf" className="wdh-section">
          <SectionIntro
            eyebrow="ZUSAMMENARBEIT"
            title="So entsteht Ihre Website"
            text="Ein klarer Ablauf sorgt dafür, dass Entscheidungen, Scope und Freigaben nachvollziehbar bleiben."
          />
          <div className="wdh-process-grid">
            {process.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <p className="wdh-correction-note">
            Korrekturen innerhalb des vereinbarten Leistungsumfangs haben vor dem Launch keine feste Rundenzahl. Zusätzliche Seiten, neue Funktionen oder grundlegende Richtungswechsel werden separat kalkuliert.
          </p>
        </section>

        <section id="preis" className="wdh-section wdh-price-section">
          <div className="wdh-price-card">
            <div className="wdh-price-copy">
              <span>TRANSPARENTER EINSTIEG</span>
              <h2>Klarer Scope statt unklarer Paketpreise.</h2>
              <p>
                Nach der Bedarfsklärung erhalten Sie ein individuelles Festpreisangebot für den vereinbarten Umfang.
              </p>
              <div className="wdh-payment"><span>50 % bei Beauftragung</span><i /><span>50 % vor dem Launch</span></div>
            </div>
            <div className="wdh-price-number">
              <small>Website-Projekt</small>
              <strong><em>ab</em> 829 €</strong>
              <span>netto zzgl. USt.</span>
              <p>Bis zu fünf Inhaltsseiten<br />+ Impressum und Datenschutz</p>
              <a href="#projektanfrage">Projektumfang klären <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="wdh-section wdh-local-section">
          <div className="wdh-local-mark" aria-hidden="true">
            <img src="/tigerflow-mark.png" alt="" width="320" height="245" />
          </div>
          <div>
            <span className="wdh-eyebrow"><MapPin size={13} /> PERSÖNLICH ERREICHBAR</span>
            <h2>Webdesign direkt aus Heide</h2>
            <p>
              TigerFlow sitzt in Heide und entwickelt Websites für Unternehmen, die ihren digitalen Auftritt modernisieren oder neu aufbauen möchten. Die Abstimmung kann unkompliziert digital erfolgen; den konkreten Ablauf legen wir passend zu Ihrem Projekt fest.
            </p>
          </div>
          <aside>
            <b>Geeignet für</b>
            <ul>
              <li>kleine und mittlere Unternehmen</li>
              <li>lokale Dienstleister</li>
              <li>Handwerksbetriebe</li>
              <li>Neubau und Redesign</li>
            </ul>
          </aside>
        </section>

        <section id="faq" className="wdh-section wdh-faq-section">
          <SectionIntro eyebrow="FAQ" title="Häufige Fragen zu Webdesign in Heide" />
          <div className="wdh-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="projektanfrage" className="wdh-section wdh-final-cta">
          <div className="wdh-cta-glow" aria-hidden="true" />
          <span><Sparkles size={14} /> UNVERBINDLICHER ERSTER SCHRITT</span>
          <h2>Lassen Sie uns klären, was Ihre neue Website wirklich braucht.</h2>
          <p>
            Beschreiben Sie kurz Ihr Unternehmen, den aktuellen Stand und Ihr Ziel. Sie erhalten anschließend eine persönliche Rückmeldung zum sinnvollen Umfang und zum nächsten Schritt.
          </p>
          <a
            className="wdh-primary-btn"
            href="mailto:service@tigerflow.de?subject=Projektanfrage%20Webdesign%20Heide"
          >
            Unverbindliche Projektanfrage starten <ArrowRight size={17} />
          </a>
          <small>
            Per E-Mail an service@tigerflow.de · Kein Newsletter · Keine automatische Beauftragung
          </small>
        </section>
      </main>

      <Footer />
    </div>
  );
}
