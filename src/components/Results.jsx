import { C } from "../theme";
import { useReveal } from "../hooks";
import { Eyebrow } from "./Eyebrow";

export function Results() {
  const { ref, visible } = useReveal(0.06);
  const stats = [
    {
      value: "3×",
      tag: "Potenzial",
      label: "mehr qualifizierte Leads",
      note: "durch strukturierte Vorqualifizierung",
    },
    { value: "<2s", tag: "Zielwert", label: "Reaktionszeit", note: "automatisierte Erstantwort" },
    { value: "94%", tag: "System-Effekt", label: "Antwortabdeckung", note: "bei klar definierten FAQ- und Lead-Flows" },
    {
      value: "-60%",
      tag: "Potenzial",
      label: "manuelle Aufgaben",
      note: "durch CRM- und Workflow-Automation",
    },
  ];
  const cases = [
    {
      sector: "B2B Vertrieb",
      result:
        "Von manueller Nachverfolgung zu automatischer Qualifizierung, CRM-Übergabe und Terminbuchung für warme Leads.",
    },
    {
      sector: "Lokale Dienstleister",
      result:
        "Von verpassten Anrufen und verstreuten Website-Anfragen zu einem klaren Prozess für Rückruf, Angebot und Follow-up.",
    },
  ];

  const fadeUp = (v, d = 0) => ({
    opacity: v ? 1 : 0,
    transform: v ? "translateY(0)" : "translateY(18px)",
    transition: `opacity .58s ease ${d}ms,transform .58s ease ${d}ms`,
  });

  return (
    <section
      id="ergebnisse"
      ref={ref}
      style={{
        background: C.surface,
        borderTop: `.5px solid ${C.border}`,
        borderBottom: `.5px solid ${C.border}`,
      }}
    >
      <div
        className="sec"
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "96px 48px" }}
      >
        <div style={fadeUp(visible)}>
          <Eyebrow>Ergebnisse</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 500,
              letterSpacing: "-.025em",
              color: C.textPri,
              lineHeight: 1.1,
              marginBottom: "56px",
              maxWidth: "480px",
            }}
          >
            Zahlen, die
            <br />
            für sich sprechen.
          </h2>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 300,
              color: C.textSec,
              lineHeight: 1.7,
              maxWidth: "520px",
              marginTop: "-36px",
              marginBottom: "44px",
            }}
          >
            Beispielhafte Potenziale aus automatisierten Lead- und Vertriebsprozessen.
            Die konkrete Wirkung hängt von Traffic, Angebot und bestehender Pipeline ab.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "10px",
              marginBottom: "48px",
            }}
            className="stats-grid"
          >
            {stats.map(({ value, label, note }, i) => (
              <div
                key={value}
                className="stat-card"
                style={{
                  background: C.pageBg,
                  border: `.5px solid ${C.border}`,
                  borderRadius: "10px",
                  padding: "24px 22px",
                  position: "relative",
                  overflow: "hidden",
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10px",
                    right: "10px",
                    height: ".5px",
                    background:
                      "linear-gradient(to right,transparent,rgba(255,255,255,0.06),transparent)",
                  }}
                />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 8px",
                    borderRadius: "100px",
                    background: C.accentTint,
                    border: `.5px solid ${C.accentMid}`,
                    color: C.accentLt,
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  {stats[i].tag}
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 500,
                    letterSpacing: "-.03em",
                    color: C.textPri,
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: C.textSec,
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "'Courier New',monospace",
                    fontSize: "10px",
                    color: C.textTer,
                    letterSpacing: ".03em",
                  }}
                >
                  {note}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
            className="grid-2"
          >
            {cases.map(({ sector, result }, i) => (
              <div
                key={sector}
                className="card-hover"
                style={{
                  background: C.pageBg,
                  border: `.5px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "28px",
                  position: "relative",
                  overflow: "hidden",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "16px",
                    right: "16px",
                    height: ".5px",
                    background:
                      "linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)",
                  }}
                />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: C.accentLt,
                    background: C.accentTint,
                    border: `.5px solid ${C.accentMid}`,
                    borderRadius: "100px",
                    padding: "3px 10px",
                    marginBottom: "14px",
                  }}
                >
                  {sector}
                </div>
                <div style={{ fontSize: "11px", color: C.textDis, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px" }}>
                  Beispielszenario
                </div>
                <p style={{ fontSize: "14px", color: C.textSec, lineHeight: 1.7 }}>
                  {result}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
