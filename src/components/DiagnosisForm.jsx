import { ArrowRight } from "lucide-react";
import { C } from "../theme";
import { Eyebrow } from "./Eyebrow";

// Opens the real Projekt-Check (same mechanism as ServiceMegaMenu's
// "Projekt einordnen") instead of the previous multi-step quiz that only
// simulated a result locally and never actually submitted anything.
function openProjectCheck(event) {
  window.dispatchEvent(
    new CustomEvent("tigerflow:open-project-check", {
      detail: { trigger: event.currentTarget },
    })
  );
}

export function DiagnosisForm() {
  return (
    <section className="sec" style={{ padding: "96px 48px", background: C.surface, borderTop: `.5px solid ${C.border}`, borderBottom: `.5px solid ${C.border}` }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>Automation Health Check</Eyebrow>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: C.textPri, marginBottom: "20px" }}>
          Wie viel Potenzial<br />steckt in Ihrem Business?
        </h2>
        <p style={{ color: C.textSec, fontSize: "15px", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 40px" }}>
          Vier kurze Fragen, ein passender Einstieg – unverbindlich und ohne Kontaktdaten.
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
          }}
        >
          Projekt-Check starten <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
