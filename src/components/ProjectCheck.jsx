import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { ProjectCheckContact } from "./ProjectCheckContact.jsx";
import { QUESTIONS, buildInquiryHref } from "./projectCheckInquiry.js";
import "./ProjectCheck.css";

const RECOMMENDATIONS = {
  webdesign: {
    title: "Website mit technischer SEO-Basis",
    text: "Eine moderne Website ist für Ihre Auswahl der klarste Einstieg. Sie schafft die digitale Grundlage und kann später gezielt um SEO, Terminprozesse oder Automatisierungen erweitert werden.",
    href: "/webdesign-heide",
    linkLabel: "Webdesign in Heide ansehen",
  },
  seo: {
    title: "SEO-Setup und priorisierter Maßnahmenplan",
    text: "Der sinnvolle Einstieg ist eine Analyse von Suchintention, Wettbewerb und bestehender Website. Daraus entsteht eine belastbare Keyword-Map statt einzelner, unverbundener SEO-Maßnahmen.",
  },
  inquiries: {
    title: "Strukturierter Anfrageprozess",
    text: "Als Erstes sollte geprüft werden, über welche Kanäle Anfragen eingehen und wo Übergaben liegen bleiben. Danach lässt sich der passende Mix aus Website, TigerBot, Terminprozess oder CRM bestimmen.",
  },
  automation: {
    title: "Prozessanalyse vor der Automatisierung",
    text: "Vor einer technischen Lösung sollte der wiederkehrende Ablauf klar abgegrenzt werden. TigerFlow prüft Eingaben, Entscheidungen, Übergaben und das gewünschte Ergebnis projektbezogen.",
  },
};

export function ProjectCheck({ hideTrigger = false }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  const close = () => setOpen(false);
  const start = () => {
    setStep(0);
    setAnswers([]);
    setOpen(true);
  };

  useEffect(() => {
    const handleExternalOpen = (event) => {
      triggerRef.current = event.detail?.trigger ?? document.activeElement;
      setStep(0);
      setAnswers([]);
      setOpen(true);
    };
    window.addEventListener("tigerflow:open-project-check", handleExternalOpen);
    return () => window.removeEventListener("tigerflow:open-project-check", handleExternalOpen);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const appRoot = document.getElementById("root");
    const appRootWasInert = appRoot?.hasAttribute("inert") ?? false;
    document.body.style.overflow = "hidden";
    appRoot?.setAttribute("inert", "");
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (!appRootWasInert) appRoot?.removeAttribute("inert");
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const choose = (value) => {
    const nextAnswers = [...answers.slice(0, step), value];
    setAnswers(nextAnswers);
    setStep((current) => current + 1);
  };

  const goBack = () => setStep((current) => Math.max(0, current - 1));
  const finished = step >= QUESTIONS.length;
  const recommendation = RECOMMENDATIONS[answers[0]] ?? RECOMMENDATIONS.webdesign;

  return (
    <>
      {!hideTrigger && (
        <>
          <button ref={triggerRef} type="button" className="cta-btn cta-full project-check-trigger" onClick={start}>
            <span className="project-check-trigger-system" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="project-check-trigger-label">Projekt-Check starten</span>
            <span className="project-check-trigger-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </span>
          </button>
          <span className="project-check-microcopy">In 2 Minuten zum passenden Einstieg</span>
        </>
      )}

      {open &&
        createPortal(
          <div
            className="project-check-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <section
              ref={dialogRef}
              className="project-check-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-check-title"
            >
              <header className="project-check-header">
                <div className="project-check-brand">
                  <img src="/tigerflow-mark.png" alt="" aria-hidden="true" width="320" height="245" />
                  <div>
                    <span>TIGERFLOW</span>
                    <strong>Projekt-Check</strong>
                  </div>
                </div>
                <button ref={closeRef} type="button" onClick={close} aria-label="Projekt-Check schließen">
                  <X size={19} aria-hidden="true" />
                </button>
              </header>

              {!finished ? (
                <div className="project-check-content">
                  <div className="project-check-progress-row">
                    <span>Schritt {step + 1} von {QUESTIONS.length}</span>
                    <div className="project-check-progress" aria-hidden="true">
                      {QUESTIONS.map((question, index) => (
                        <i key={question.title} className={index <= step ? "is-active" : ""} />
                      ))}
                    </div>
                  </div>
                  <h2 id="project-check-title">{QUESTIONS[step].title}</h2>
                  <p>{QUESTIONS[step].hint}</p>
                  <div className="project-check-options">
                    {QUESTIONS[step].options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="project-check-option"
                        onClick={() => choose(option.value)}
                      >
                        <span>{option.label}</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <footer className="project-check-footer">
                    {step > 0 ? (
                      <button type="button" onClick={goBack}>
                        <ArrowLeft size={14} aria-hidden="true" /> Zurück
                      </button>
                    ) : (
                      <span>Keine Kontaktdaten erforderlich</span>
                    )}
                    <span>Unverbindliche Einordnung</span>
                  </footer>
                </div>
              ) : (
                <div className="project-check-result">
                  <span className="project-check-result-label"><Check size={15} /> Empfohlener Einstieg</span>
                  <h2 id="project-check-title">{recommendation.title}</h2>
                  <p>{recommendation.text}</p>

                  <div className="project-check-summary">
                    {answers.map((answer, index) => {
                      const option = QUESTIONS[index].options.find(({ value }) => value === answer);
                      return (
                        <div key={QUESTIONS[index].title}>
                          <span>{QUESTIONS[index].title}</span>
                          <strong>{option?.label}</strong>
                        </div>
                      );
                    })}
                  </div>

                  <div className="project-check-result-actions">
                    <a className="project-check-inquiry" href={buildInquiryHref(answers)}>
                      Unverbindliche Anfrage vorbereiten <ArrowRight size={16} />
                    </a>
                    {recommendation.href && (
                      <a className="project-check-detail-link" href={recommendation.href}>
                        {recommendation.linkLabel}
                      </a>
                    )}
                  </div>
                  <small>
                    Das Ergebnis ist eine erste Einordnung, kein automatisches Angebot.
                  </small>

                  <ProjectCheckContact answers={answers} />
                </div>
              )}
            </section>
          </div>,
          document.body
        )}
    </>
  );
}
