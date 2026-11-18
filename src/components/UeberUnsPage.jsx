import { ArrowRight, Compass, Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { C } from "../theme";
import { Footer } from "./Footer";
import { ServiceMegaMenu } from "./ServiceMegaMenu";
import { ROUTES, SITE_URL } from "../routes.config";
import "./UeberUnsPage.css";

const PAGE_URL = `${SITE_URL}/ueber-uns`;
const route = ROUTES.find(({ path }) => path === "/ueber-uns");
const ORG_ID = `${SITE_URL}/#organization`;
const FOUNDER_ID = `${PAGE_URL}#founder`;

// Only confirmed data: organization, logo, e-mail and address match the Impressum and the
// homepage markup; the person is limited to the approved name and role.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: route.title,
      description: route.description,
      inLanguage: "de-DE",
      isPartOf: { "@type": "WebSite", name: "TigerFlow", url: `${SITE_URL}/` },
      mainEntity: { "@id": ORG_ID },
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "TigerFlow",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/tigerflow-mark.png`,
      email: "service@tigerflow.de",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rendsburger Straße 22",
        postalCode: "25746",
        addressLocality: "Heide",
        addressCountry: "DE",
      },
      founder: { "@id": FOUNDER_ID },
    },
    {
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: "Jafar Hamzeh",
      jobTitle: "Founder & CEO",
      worksFor: { "@id": ORG_ID },
    },
  ],
};

const buildingBlocks = [
  {
    title: "Website",
    text: "Eine klare, responsive Unternehmenswebsite schafft die technische und inhaltliche Grundlage. Struktur, Texte, Anfragewege und SEO-Basis werden auf das vereinbarte Projekt ausgerichtet.",
    links: [{ href: "/webdesign-heide", label: "Webdesign-Leistungen ansehen" }],
  },
  {
    title: "Sichtbarkeit",
    text: "SEO ordnet Suchintentionen, Seitenrollen und Inhalte. Ein einmaliges Setup schafft die Entscheidungsgrundlage; eine laufende Betreuung entwickelt priorisierte Maßnahmen weiter.",
    links: [
      { href: "/seo-schleswig-holstein", label: "SEO-Leistungen ansehen" },
      { href: "/seo-betreuung", label: "Laufende SEO-Betreuung" },
    ],
  },
  {
    title: "Prozesse und Automatisierung",
    text: "Terminbuchung, Follow-ups, TigerBot, TelefonBot oder weitere Automatisierungen können Anfragen und wiederkehrende Abläufe strukturieren. Funktionen, Integrationen und laufender Betrieb werden immer projektbezogen abgegrenzt.",
    projectCheck: "Projekt prüfen lassen",
  },
];

const steps = [
  {
    title: "Bedarf verstehen",
    text: "Zu Beginn werden Ziel, Ausgangslage, gewünschter Umfang und relevante Rahmenbedingungen eingeordnet.",
  },
  {
    title: "Umfang festlegen",
    text: "Leistungen, Funktionen, Inhalte, Fremdkosten und Abgrenzungen werden vor der Beauftragung nachvollziehbar festgehalten.",
  },
  {
    title: "Umsetzen und prüfen",
    text: "Die vereinbarte Lösung wird erstellt, getestet und abgestimmt. Änderungen innerhalb des vereinbarten Umfangs werden vor der Veröffentlichung eingearbeitet.",
  },
  {
    title: "Freigeben und weiterentwickeln",
    text: "Veröffentlicht oder produktiv geschaltet wird nach Freigabe. Betreuung, SEO und weitere Ausbaustufen können anschließend separat vereinbart werden.",
  },
];

const principles = [
  {
    title: "Bedarf vor Technologie",
    text: "Nicht das neueste Tool entscheidet, sondern der konkrete geschäftliche Bedarf. Technik wird nur eingesetzt, wenn sie zum Prozess und zum vereinbarten Ziel passt.",
  },
  {
    title: "Klare Leistungsgrenzen",
    text: "Was enthalten ist, was optional bleibt und welche Fremdkosten entstehen können, wird vor der Beauftragung abgegrenzt.",
  },
  {
    title: "Prüfung vor Veröffentlichung",
    text: "Websites und produktive Automatisierungen werden getestet und erst nach der vereinbarten Freigabe veröffentlicht beziehungsweise aktiviert.",
  },
  {
    title: "Keine künstlichen Erfolgsversprechen",
    text: "TigerFlow verspricht keine garantierten Rankings, Besucherzahlen, Leads oder Umsätze. Entscheidungen werden anhand realer Anforderungen und später anhand belastbarer Daten getroffen.",
  },
];

const regionLinks = [
  { href: "/webdesign-heide", label: "Webdesign in Heide" },
  { href: "/seo-heide", label: "SEO in Heide" },
  { href: "/webdesign-schleswig-holstein", label: "Webdesign für Schleswig-Holstein" },
  { href: "/seo-schleswig-holstein", label: "SEO für Schleswig-Holstein" },
];

const paths = [
  {
    href: "/webdesign-heide",
    title: "Webdesign in Heide",
    text: "Für Unternehmen vor Ort, die eine neue Website oder ein Redesign benötigen.",
    primary: true,
  },
  {
    href: "/webdesign-schleswig-holstein",
    title: "Webdesign in Schleswig-Holstein",
    text: "Für regional und landesweit ausgerichtete Website-Projekte.",
    primary: true,
  },
  {
    href: "/seo-schleswig-holstein",
    title: "SEO in Schleswig-Holstein",
    text: "Für eine strukturierte SEO-Grundlage und priorisierte Umsetzung.",
  },
  {
    href: "/seo-betreuung",
    title: "Laufende SEO-Betreuung",
    text: "Für wiederkehrende Analyse, Priorisierung, Umsetzung und Auswertung.",
  },
  {
    href: "/preise",
    title: "Preise und Leistungsumfang",
    text: "Für Einstiegspreise, enthaltene Leistungen und klare Abgrenzungen.",
  },
];

const facts = [
  ["Inhaber", "Jafar Hamzeh"],
  ["Sitz", "Heide, Schleswig-Holstein"],
  ["Schwerpunkt", "Webdesign, SEO und KI-Automatisierung"],
  ["Projektgebiet", "regional und bei passenden Projekten deutschlandweit"],
];

const heroWords = ["Webdesign,", "SEO", "und", "KI-Automatisierung", "aus", "Heide."];

const quoteLines = [
  "Erst die digitale Grundlage.",
  "Dann Sichtbarkeit.",
  "Danach die passenden nächsten Schritte.",
];

const statementPhrases = [
  "Ich möchte digitale Lösungen so planen,",
  "dass Unternehmen verstehen, was sie erhalten,",
  "warum es sinnvoll ist",
  "und welcher nächste Schritt wirklich gebraucht wird.",
];

// Same mechanism as ServiceMegaMenu's "Projekt einordnen" trigger.
function openProjectCheck(event) {
  window.dispatchEvent(
    new CustomEvent("tigerflow:open-project-check", {
      detail: { trigger: event.currentTarget },
    })
  );
}

// Below-the-fold blocks rise in once. They are only hidden after JavaScript has started
// observing them, so prerendered HTML, no-JS and reduced-motion visitors always see everything.
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
          // The stagger delay lives on .au-revealing only, so hover feedback stays instant.
          target.classList.add("au-revealing", "au-revealed");
          target.classList.remove("au-reveal-pending");
          const timer = window.setTimeout(() => {
            target.classList.remove("au-revealing");
            timers.delete(timer);
          }, 1100);
          timers.add(timer);
          observer.unobserve(target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    page.querySelectorAll("[data-au-reveal]").forEach((item) => {
      if (item.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
      item.classList.add("au-reveal-pending");
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return ref;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Fine pointers only: a warm light follows the cursor inside the service path cards and the
// hero visual tilts gently towards it. One delegated listener, one frame per update.
function usePointerLight(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!page || !finePointer || reduceMotion) return undefined;

    const hero = page.querySelector(".au-hero");
    const visual = page.querySelector(".au-visual");
    let frame = 0;
    let latest = null;

    const apply = () => {
      frame = 0;
      const { target, x, y } = latest;
      const card = target.closest?.(".au-path");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--au-mx", `${Math.round(x - rect.left)}px`);
        card.style.setProperty("--au-my", `${Math.round(y - rect.top)}px`);
      }
      if (hero && visual && target.closest?.(".au-hero")) {
        const rect = hero.getBoundingClientRect();
        visual.style.setProperty("--au-px", clamp(((x - rect.left) / rect.width) * 2 - 1, -1, 1).toFixed(3));
        visual.style.setProperty("--au-py", clamp(((y - rect.top) / rect.height) * 2 - 1, -1, 1).toFixed(3));
      }
    };
    const handleMove = (event) => {
      latest = { target: event.target, x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const handleLeave = () => {
      visual?.style.setProperty("--au-px", "0");
      visual?.style.setProperty("--au-py", "0");
    };

    page.addEventListener("pointermove", handleMove, { passive: true });
    hero?.addEventListener("pointerleave", handleLeave);
    return () => {
      page.removeEventListener("pointermove", handleMove);
      hero?.removeEventListener("pointerleave", handleLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pageRef]);
}

// Scroll-coupled: the hero glow drifts a few pixels and the process line fills up with the
// reading position. Without this hook (no JS, reduced motion) the line simply stays drawn.
function useScrollMotion(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!page || reduceMotion) return undefined;

    const glow = page.querySelector(".au-hero-glow");
    const steps = page.querySelector(".au-steps");
    const items = steps ? [...steps.querySelectorAll(".au-step")] : [];
    steps?.classList.add("au-scrollspy");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (glow) glow.style.transform = `translate3d(0, ${Math.round(clamp(window.scrollY, 0, 400) * 0.1)}px, 0)`;
      if (!steps) return;
      const middle = window.innerHeight * 0.5;
      const rect = steps.getBoundingClientRect();
      steps.style.setProperty("--au-progress", clamp((middle - rect.top) / rect.height, 0, 1).toFixed(3));
      let active = -1;
      items.forEach((item, index) => {
        const passed = item.getBoundingClientRect().top <= middle;
        item.classList.toggle("au-is-passed", passed);
        if (passed) active = index;
      });
      items.forEach((item, index) => item.classList.toggle("au-is-active", index === active));
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      steps?.classList.remove("au-scrollspy");
    };
  }, [pageRef]);
}

function ProjectCheckButton({ children, className = "" }) {
  return (
    <button
      type="button"
      className={`au-btn ${className}`.trim()}
      data-project-check-cta
      onClick={openProjectCheck}
    >
      {children}
    </button>
  );
}

function SectionIntro({ eyebrow, title, text, className = "" }) {
  return (
    <div className={`au-intro ${className}`.trim()} data-au-reveal>
      <span className="au-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function PageHeader() {
  return (
    <header className="au-nav">
      <a className="au-brand" href="/" aria-label="TigerFlow Startseite">
        <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
        <span>TigerFlow</span>
      </a>
      <nav className="au-nav-links" aria-label="Seitennavigation">
        <ServiceMegaMenu currentPath="/ueber-uns" />
        <a href="/ueber-uns" aria-current="page">Über uns</a>
        <a href="#arbeitsweise">Arbeitsweise</a>
      </nav>
      <ProjectCheckButton className="au-nav-cta">
        <span>Projekt-Check</span> <ArrowRight size={15} aria-hidden="true" />
      </ProjectCheckButton>
    </header>
  );
}

// Silent 25 s film, self-hosted. It starts muted once JavaScript runs (not with reduced motion)
// and plays once. Whenever it is not running (ended, paused, autoplay blocked) the whole frame
// becomes one large click target; while it runs, a small pause button sits in the corner. A second
// button opens the film in full screen. Controls stay hidden until their state is known, so there
// is no flash and no dead button without JavaScript.
function HeroVideo() {
  const videoRef = useRef(null);
  const wantsAutoplay = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  const start = (video) => {
    video.muted = true;
    video.setAttribute("muted", "");
    try {
      video.play()?.catch?.(() => setReady(true));
    } catch {
      setReady(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    setCanFullscreen(
      Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled || video.webkitEnterFullscreen)
    );
    // Native controls only while the film is full screen; the page controls take over afterwards.
    const syncControls = () => {
      const current = document.fullscreenElement || document.webkitFullscreenElement;
      video.controls = current === video;
    };
    const leaveControls = () => { video.controls = false; };
    document.addEventListener("fullscreenchange", syncControls);
    document.addEventListener("webkitfullscreenchange", syncControls);
    video.addEventListener("webkitendfullscreen", leaveControls);

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
    } else {
      wantsAutoplay.current = true;
      // Already running (a very fast start) or still loading: playing is picked up in onPlay
      // and onCanPlay below.
      if (video.paused) start(video);
      else setPlaying(true);
    }
    // Fallback when the browser blocks autoplay: the first click, tap or key press anywhere
    // on the page starts the film once. A press on the film itself is handled by its own controls.
    const kickoff = (event) => {
      if (!wantsAutoplay.current || !video.paused) return;
      if (event.target?.closest?.(".au-visual")) return;
      start(video);
    };
    const gestures = ["pointerdown", "touchend", "keydown"];
    gestures.forEach((name) => document.addEventListener(name, kickoff, { passive: true }));
    return () => {
      gestures.forEach((name) => document.removeEventListener(name, kickoff));
      document.removeEventListener("fullscreenchange", syncControls);
      document.removeEventListener("webkitfullscreenchange", syncControls);
      video.removeEventListener("webkitendfullscreen", leaveControls);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    wantsAutoplay.current = false;
    if (playing) {
      video.pause();
      return;
    }
    if (ended) video.currentTime = 0;
    start(video);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    wantsAutoplay.current = false;
    const request = video.requestFullscreen?.bind(video) ?? video.webkitRequestFullscreen?.bind(video);
    try {
      if (request) request()?.catch?.(() => {});
      else video.webkitEnterFullscreen?.();
    } catch {
      // Full screen refused: the film still plays in place.
    }
    if (ended) video.currentTime = 0;
    start(video);
  };

  const label = ended ? "Video erneut abspielen" : playing ? "Video pausieren" : "Video abspielen";
  const visibleLabel = ended ? "Erneut ansehen" : "Video abspielen";
  const Icon = ended ? RotateCcw : playing ? Pause : Play;
  const mode = !ready ? "au-video-pending" : playing ? "" : "au-video-cover";

  return (
    <div className="au-visual">
      <video
        ref={videoRef}
        className="au-video"
        width="1920"
        height="1080"
        muted
        suppressHydrationWarning
        playsInline
        preload="auto"
        poster="/video/tigerflow-ueber-uns-poster.jpg"
        aria-label="Kurzfilm ohne Ton: Von der Website zum System, das arbeitet"
        onClick={toggle}
        onCanPlay={() => {
          if (wantsAutoplay.current && videoRef.current?.paused) start(videoRef.current);
        }}
        onPlay={() => { wantsAutoplay.current = false; setReady(true); setPlaying(true); setEnded(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); }}
      >
        <source src="/video/tigerflow-ueber-uns.mp4" type="video/mp4" />
        <source src="/video/tigerflow-ueber-uns.webm" type="video/webm" />
      </video>
      <button
        type="button"
        className={`au-video-toggle ${mode}`.trim()}
        aria-label={label}
        onClick={toggle}
      >
        <span className="au-video-icon"><Icon size={mode ? 24 : 18} aria-hidden="true" /></span>
        <span className="au-video-label" aria-hidden="true">{visibleLabel}</span>
      </button>
      <button
        type="button"
        className={`au-video-fullscreen${canFullscreen ? "" : " au-video-pending"}`}
        aria-label="Video im Vollbild ansehen"
        onClick={enterFullscreen}
      >
        <Maximize size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function UeberUnsPage() {
  const pageRef = useReveal();
  usePointerLight(pageRef);
  useScrollMotion(pageRef);

  return (
    <div ref={pageRef} className="au-page" style={{ background: C.pageBg, color: C.textPri }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="au-skip" href="#inhalt">Zum Inhalt springen</a>
      <PageHeader />

      <main id="inhalt" tabIndex={-1}>
        <section className="au-hero">
          <div className="au-hero-glow" aria-hidden="true" />
          <div className="au-hero-copy">
            <span className="au-eyebrow">ÜBER TIGERFLOW</span>
            <h1>
              {heroWords.map((word, index) => (
                <span key={word}>
                  <span className="au-word" style={{ "--au-w": index }}>{word}</span>{" "}
                </span>
              ))}
            </h1>
            <p className="au-lead">
              TigerFlow entwickelt digitale Grundlagen und Prozesse für Unternehmen: von der
              Website über organische Sichtbarkeit bis zur strukturierten Bearbeitung von Anfragen.
            </p>
            <p className="au-hero-note">
              Hinter TigerFlow steht Jafar Hamzeh. Der regionale Schwerpunkt liegt auf Heide,
              Dithmarschen und Schleswig-Holstein. Spezialisierte Projekte setzen wir auch
              deutschlandweit um.
            </p>
            <div className="au-hero-actions">
              <ProjectCheckButton>
                Projekt unverbindlich einordnen <ArrowRight size={17} aria-hidden="true" />
              </ProjectCheckButton>
              <a className="au-text-link" href="#leistungen">Leistungen ansehen</a>
            </div>
          </div>
          <HeroVideo />
        </section>

        <section id="unternehmen" className="au-section au-company">
          <SectionIntro
            eyebrow="DAS UNTERNEHMEN"
            title="Eine klare Verantwortung statt anonymer Agenturkulisse."
          />
          <div className="au-company-body">
            <div className="au-prose" data-au-reveal>
              <p>
                TigerFlow ist das Einzelunternehmen von Jafar Hamzeh mit Sitz in Heide. Der Ansatz
                verbindet drei Bereiche, die in der Praxis aufeinander aufbauen: eine belastbare
                Website, auffindbare Inhalte und sinnvoll automatisierte Abläufe.
              </p>
              <p>
                Dabei muss nicht jedes Unternehmen sofort das vollständige System umsetzen. Der
                Einstieg richtet sich nach dem tatsächlichen Bedarf – häufig beginnt er mit einer
                Website oder einer klaren SEO-Grundlage.
              </p>
            </div>
            <dl className="au-facts" data-au-reveal>
              {facts.map(([label, value], index) => (
                <div key={label} style={{ "--au-i": index }}>
                  <dt>{label}</dt>{" "}
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="ansatz" className="au-section au-band au-approach">
          <SectionIntro
            eyebrow="DER ANSATZ"
            title="Eine Website ist der Anfang – nicht der gesamte Prozess."
          />
          <div className="au-approach-body" data-au-reveal>
            <div className="au-prose">
              <p>
                Eine moderne Website kann Vertrauen schaffen und Anfragen ermöglichen. Damit daraus
                ein belastbarer digitaler Prozess entsteht, müssen Unternehmen aber auch gefunden
                werden und eingehende Kontakte zuverlässig weiterbearbeiten können.
              </p>
              <p>
                Deshalb betrachtet TigerFlow Webdesign, SEO und Automatisierung nicht als beliebige
                Einzelleistungen. Die Bereiche werden dort verbunden, wo die Verbindung für das
                Unternehmen sinnvoll und wirtschaftlich nachvollziehbar ist.
              </p>
            </div>
            <p className="au-pullquote" data-au-reveal>
              {quoteLines.map((line, index) => (
                <span key={line}>
                  <span className="au-quote-line" style={{ "--au-i": index }}>{line}</span>{" "}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section id="system" className="au-section au-system">
          <SectionIntro
            eyebrow="DAS TIGERFLOW-SYSTEM"
            title="Drei Bausteine, abgestimmt auf den tatsächlichen Bedarf."
          />
          <ol className="au-flow" data-au-reveal>
            {buildingBlocks.map(({ title, text, links, projectCheck }, index) => (
              <li className="au-flow-item" key={title} style={{ "--au-i": index }}>
                <span className="au-flow-node" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="au-flow-links">
                  {links?.map(({ href, label }) => (
                    <a className="au-link" key={href} href={href}>
                      {label} <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  ))}
                  {projectCheck && (
                    <ProjectCheckButton className="au-btn-quiet">
                      {projectCheck} <ArrowRight size={14} aria-hidden="true" />
                    </ProjectCheckButton>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="arbeitsweise" className="au-section au-band au-process">
          <SectionIntro
            eyebrow="SO ARBEITET TIGERFLOW"
            title="Vom Bedarf bis zur freigegebenen Lösung."
            text="Der Ablauf hängt vom Projekt ab. Die grundlegende Logik bleibt nachvollziehbar: zuerst verstehen und abgrenzen, dann umsetzen, prüfen und erst nach Freigabe veröffentlichen."
          />
          <ol className="au-steps" data-au-reveal>
            {steps.map(({ title, text }, index) => (
              <li className="au-step" key={title} style={{ "--au-i": index }}>
                <span className="au-step-no" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="grundsaetze" className="au-section au-principles-section">
          <SectionIntro
            eyebrow="WORAUF ES ANKOMMT"
            title="Klarer Umfang, ehrliche Aussagen und nachvollziehbare Entscheidungen."
          />
          <ul className="au-principles" data-au-reveal>
            {principles.map(({ title, text }) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="region" className="au-section au-band au-region">
          <SectionIntro eyebrow="AUS HEIDE" title="Regional verwurzelt, digital projektfähig." />
          <div className="au-region-body" data-au-reveal>
            <div className="au-prose">
              <p>
                TigerFlow sitzt in Heide und begleitet vor allem Unternehmen in Dithmarschen und
                Schleswig-Holstein. Die regionale Nähe erleichtert die Einordnung lokaler Märkte
                und persönlicher Abstimmungen.
              </p>
              <p>
                Spezialisierte Web-, SEO- und KI-Projekte können auch deutschlandweit umgesetzt
                werden. Entscheidend sind nicht Entfernung oder ein möglichst breites Versprechen,
                sondern ein klarer Bedarf und ein sinnvoll abgegrenzter Projektumfang.
              </p>
            </div>
            <ul className="au-region-links" aria-label="Regionale Leistungsseiten">
              {regionLinks.map(({ href, label }) => (
                <li key={href}>
                  <a className="au-link" href={href}>
                    {label} <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="founder" className="au-section au-founder">
          <div className="au-founder-motif" aria-hidden="true" data-au-reveal>
            <img src="/tigerflow-mark.png" alt="" width="320" height="245" />
            <span className="au-signature">Jafar Hamzeh</span>
          </div>
          <div className="au-founder-copy" data-au-reveal>
            <span className="au-eyebrow">FOUNDER &amp; CEO</span>
            <h2>Jafar Hamzeh</h2>
            <p className="au-role">Founder &amp; CEO · TigerFlow</p>
            <p>
              Jafar Hamzeh ist Founder &amp; CEO von TigerFlow und Inhaber des dahinterstehenden
              Einzelunternehmens. Er verantwortet die Ausrichtung des Angebots. TigerFlow verbindet
              Webdesign als digitalen Einstieg mit SEO und projektbezogenen Automatisierungen.
            </p>
            <blockquote className="au-statement" data-au-reveal>
              <p>
                {statementPhrases.map((phrase, index) => (
                  <span key={phrase}>
                    <span className="au-phrase" style={{ "--au-i": index }}>{phrase}</span>{" "}
                  </span>
                ))}
              </p>
            </blockquote>
          </div>
        </section>

        <section id="leistungen" className="au-section au-band au-paths-section">
          <SectionIntro
            eyebrow="PASSENDER EINSTIEG"
            title="Wo möchten Sie beginnen?"
            text="Je nach Ausgangslage ist der nächste sinnvolle Schritt unterschiedlich. Die folgenden Seiten erklären Umfang, Ablauf und Abgrenzung der jeweiligen Leistung."
          />
          <ul className="au-paths" data-au-reveal>
            {paths.map(({ href, title, text, primary }, index) => (
              <li className={primary ? "au-path-primary" : undefined} key={href} style={{ "--au-i": index }}>
                <a className="au-path" href={href}>
                  <span className="au-path-copy">
                    <h3>{title}</h3>
                    <span>{text}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="projektanfrage" className="au-section au-final">
          <div className="au-final-card" data-au-reveal>
            <span className="au-eyebrow"><Compass size={14} aria-hidden="true" /> NÄCHSTER SCHRITT</span>
            <h2>Welcher Einstieg passt zu Ihrem Vorhaben?</h2>
            <p>
              Im Projekt-Check ordnen Sie Bedarf, gewünschte Leistung und Rahmenbedingungen
              unverbindlich ein. Danach lässt sich der sinnvolle nächste Schritt klarer bestimmen.
            </p>
            <ProjectCheckButton>
              Projekt-Check starten <ArrowRight size={17} aria-hidden="true" />
            </ProjectCheckButton>
            <small>
              Lieber per E-Mail?{" "}
              <a href="mailto:service@tigerflow.de">service@tigerflow.de</a>
            </small>
            <p className="au-trust">Unverbindliche erste Einordnung. Keine automatische Beauftragung.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
