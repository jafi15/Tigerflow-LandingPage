import { C } from "../theme";
import { useReveal } from "../hooks";
import { Eyebrow } from "./Eyebrow";

export function Results() {
  const { ref, visible } = useReveal(0.06);
  const stats = [
    {
      value: "3×",
      label: "mehr qualifizierte Leads",
      note: "durch automatisierte Qualifizierung",
    },
    { value: "<2s", label: "Reaktionszeit", note: "KI-gestützte Erstantwort" },
    { value: "94%", label: "Qualifizierungsrate", note: "AI Chatbot Durchschnitt" },
    {
      value: "–60%",
      label: "manuelle Aufgaben",
      note: "durch Workflow-Automatisierung",
    },
  ];
  const cases = [
    {
      sector: "E-Commerce",
      result:
        "Bestellabbrüche um 34% reduziert durch automatisierten Chatbot mit Produkt-Empfehlungslogik und Re-Engagement-Sequenzen.",
    },
    {
      sector: "B2B Vertrieb",
      result:
        "Von 12 auf 58 qualifizierte Gespräche pro Monat durch Outbound Voice Agent und automatisierte Lead-Pipeline.",
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
                    fontSize: "12px",
                    color: C.textSec,
                    lineHeight: 1.45,
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
