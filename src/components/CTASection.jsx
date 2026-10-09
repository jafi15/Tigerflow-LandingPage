import { C } from "../theme";
import { useReveal } from "../hooks";
import { Eyebrow } from "./Eyebrow";
import { ArrowRight } from "lucide-react";

// Same mechanism as ServiceMegaMenu's "Projekt einordnen" trigger.
function openProjectCheck(event) {
  window.dispatchEvent(
    new CustomEvent("tigerflow:open-project-check", {
      detail: { trigger: event.currentTarget },
    })
  );
}

export function CTASection() {
  const { ref, visible } = useReveal(0.15);
  const contactEmail = "service@tigerflow.de";

  const fadeUp = (v, d = 0) => ({
    opacity: v ? 1 : 0,
    transform: v ? "translateY(0)" : "translateY(18px)",
    transition: `opacity .58s ease ${d}ms,transform .58s ease ${d}ms`,
  });

  return (
    <section
      id="kontakt"
      className="sec"
      style={{
        padding: "120px 48px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div ref={ref} style={{ textAlign: "center", ...fadeUp(visible) }}>
        <Eyebrow>Kostenloses Erstgespräch</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(28px,5vw,52px)",
            fontWeight: 500,
            letterSpacing: "-.03em",
            color: C.textPri,
            lineHeight: 1.08,
            marginBottom: "18px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Bereit, wenn
          <br />
          Sie es sind.
        </h2>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 300,
            color: C.textTer,
            lineHeight: 1.7,
            maxWidth: "440px",
            margin: "0 auto 48px",
          }}
        >
          Kein Pitch. Kein Overhead. Ein strukturiertes Gespräch über das, was in
          Ihrem Unternehmen möglich ist.
        </p>

        <button
          type="button"
          onClick={openProjectCheck}
          className="cta-btn"
          style={{
            background: C.accent,
            color: "#fff",
            border: "none",
            borderRadius: "100px",
            padding: "16px 28px",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "'Inter',sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            boxShadow: "0 4px 28px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.04) inset",
          }}
        >
          Projekt-Check starten <ArrowRight size={16} />
        </button>

        <p
          style={{
            fontSize: "11px",
            color: C.textDis,
            marginTop: "16px",
            letterSpacing: ".02em",
          }}
        >
          Kein Spam. Kein Newsletter. Nur eine erste Einordnung.
        </p>
        <p
          style={{
            fontSize: "13px",
            color: C.textTer,
            marginTop: "24px",
          }}
        >
          Oder direkt per E-Mail:{" "}
          <a
            href={`mailto:${contactEmail}`}
            style={{
              color: C.textSec,
              textDecoration: "none",
              borderBottom: `.5px solid ${C.borderEm}`,
              paddingBottom: "2px",
              transition: "color .15s,border-color .15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = C.accent;
              e.target.style.borderBottomColor = C.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = C.textSec;
              e.target.style.borderBottomColor = C.borderEm;
            }}
          >
            {contactEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
