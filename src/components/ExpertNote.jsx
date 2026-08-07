import { motion } from "framer-motion";
import { ArrowRight, Bot, CalendarCheck, Database, Globe2, PhoneCall, Radar, Workflow, Zap } from "lucide-react";
import { C } from "../theme";

const flowSteps = [
  { icon: Globe2, title: "Website", meta: "Besucher kommt rein" },
  { icon: Bot, title: "TigerBot", meta: "Lead wird qualifiziert" },
  { icon: PhoneCall, title: "Voice Agent", meta: "Rückruf vorbereitet" },
  { icon: Database, title: "CRM", meta: "Pipeline wird sauber" },
];

const proofCards = [
  { icon: Zap, title: "Antwortet sofort", detail: "Keine Anfrage bleibt kalt." },
  { icon: Radar, title: "Erkennt Absicht", detail: "Interesse wird strukturiert." },
  { icon: CalendarCheck, title: "Bereitet Termine vor", detail: "Ihr Team spricht mit besseren Leads." },
];

export function ExpertNote() {
  return (
    <section
      className="sec"
      style={{
        padding: "120px 48px 108px",
        background: C.pageBg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(255,122,0,0.032) 1px, transparent 1px),
            linear-gradient(rgba(255,122,0,0.024) 1px, transparent 1px),
            radial-gradient(ellipse 55% 42% at 22% 46%, rgba(255,122,0,0.10), transparent 66%),
            radial-gradient(ellipse 56% 44% at 80% 34%, rgba(255,176,0,0.08), transparent 70%)
          `,
          backgroundSize: "86px 86px, 86px 86px, auto, auto",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 620,
          height: 460,
          transform: "translate(-50%, -50%) rotate(-8deg)",
          background: "radial-gradient(ellipse, rgba(255,122,0,0.10), transparent 66%)",
          filter: "blur(12px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1180px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(255,122,0,0.18)",
            background: "linear-gradient(145deg, rgba(12,7,2,0.98), rgba(7,7,7,0.98) 58%, rgba(18,8,0,0.96))",
            boxShadow: "0 34px 110px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,122,0,0.05) inset",
          }}
          className="manifesto-shell"
        >
          <img
            src="/tigerflow-mark.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "-72px",
              top: "-78px",
              width: "430px",
              height: "330px",
              objectFit: "cover",
              objectPosition: "center",
              opacity: 0.07,
              filter: "saturate(1.35)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(120deg, transparent 0%, rgba(255,122,0,0.045) 48%, transparent 72%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.02fr 0.98fr",
              gap: 28,
              padding: "34px",
              position: "relative",
              zIndex: 1,
            }}
            className="grid-2"
          >
            <div
              style={{
                minHeight: 520,
                borderRadius: 20,
                border: "1px solid rgba(255,122,0,0.20)",
                borderBottom: `2px solid ${C.accent}`,
                background: "linear-gradient(150deg, rgba(15,8,2,0.96), rgba(9,5,1,0.94))",
                padding: "44px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              className="manifesto-quote-card"
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -80,
                  bottom: -90,
                  width: 260,
                  height: 260,
                  background: "radial-gradient(circle, rgba(255,122,0,0.16), transparent 68%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 13px",
                    borderRadius: 999,
                    border: `.5px solid ${C.accentMid}`,
                    background: C.accentTint,
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    marginBottom: 30,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />
                  Founder Manifesto
                </div>

                <blockquote style={{ margin: 0 }}>
                  <p
                    style={{
                      fontSize: "clamp(28px,3.2vw,46px)",
                      lineHeight: 1.12,
                      letterSpacing: "-.035em",
                      color: C.textPri,
                      fontWeight: 600,
                      marginBottom: 28,
                    }}
                  >
                    "Unternehmen, die heute <span style={{ color: C.accent }}>keine KI nutzen</span>, sind morgen die <span style={{ color: C.accent }}>Beute</span> derer, die es tun."
                  </p>
                </blockquote>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.78,
                    color: C.textSec,
                    maxWidth: 560,
                  }}
                >
                  TigerFlow baut digitale Systeme für Unternehmen, die keine weiteren Tools sammeln wollen,
                  sondern einen messbaren Prozess: Anfrage rein, TigerBot qualifiziert, Rückruf, CRM und Follow-up.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                  marginTop: 34,
                  position: "relative",
                  zIndex: 1,
                }}
                className="stats-grid"
              >
                {proofCards.map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    style={{
                      borderRadius: 14,
                      border: `.5px solid ${C.borderEm}`,
                      background: "rgba(255,255,255,0.025)",
                      padding: "16px",
                      minHeight: 120,
                    }}
                    className="manifesto-mini-card"
                  >
                    <Icon size={18} color={C.accent} />
                    <div style={{ color: C.textPri, fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                      {title}
                    </div>
                    <div style={{ color: C.textTer, fontSize: 11, lineHeight: 1.55, marginTop: 6 }}>
                      {detail}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28, position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentHov})`,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    boxShadow: `0 0 0 4px rgba(255,122,0,0.13), 0 12px 28px rgba(255,122,0,0.24)`,
                  }}
                >
                  JH
                </div>
                <div>
                  <div style={{ color: C.textPri, fontWeight: 700, fontSize: 15 }}>Jafar Hamzeh</div>
                  <div style={{ color: C.textTer, fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>
                    Founder & CEO · TigerFlow
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  borderRadius: 20,
                  border: `.5px solid ${C.borderEm}`,
                  background: "linear-gradient(160deg, rgba(17,17,17,0.96), rgba(9,9,9,0.98))",
                  padding: 22,
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 340,
                }}
                className="manifesto-system-panel"
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "auto -60px -80px auto",
                    width: 260,
                    height: 260,
                    background: "radial-gradient(circle, rgba(255,122,0,0.15), transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, position: "relative", zIndex: 1 }}>
                  <div>
                    <div style={{ color: C.textPri, fontWeight: 700, fontSize: 15 }}>TigerFlow System</div>
                    <div style={{ color: C.textTer, fontSize: 12, marginTop: 4 }}>Einzeln buchbar. Als Bundle stärker.</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ADE80", fontSize: 12, whiteSpace: "nowrap" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 10px #4ADE80" }} />
                    TigerBot aktiv
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12, position: "relative", zIndex: 1 }}>
                  {flowSteps.map(({ icon: Icon, title, meta }, i) => (
                    <div key={title} style={{ position: "relative" }}>
                      {i < flowSteps.length - 1 && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 21,
                            top: 48,
                            bottom: -12,
                            width: 1,
                            background: "linear-gradient(to bottom, rgba(255,122,0,0.5), rgba(255,122,0,0.08))",
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "42px 1fr auto",
                          gap: 14,
                          alignItems: "center",
                          padding: "15px",
                          borderRadius: 14,
                          border: `.5px solid ${i === 1 ? "rgba(255,122,0,0.40)" : C.border}`,
                          background: i === 1 ? "rgba(255,122,0,0.085)" : "rgba(255,255,255,0.025)",
                          boxShadow: i === 1 ? "0 0 26px rgba(255,122,0,0.08)" : "none",
                          position: "relative",
                          zIndex: 1,
                        }}
                        className={`manifesto-flow-step ${i === 1 ? "is-active" : ""}`}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: C.accentTint,
                            color: C.accent,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={19} />
                        </div>
                        <div>
                          <div style={{ color: C.textPri, fontWeight: 700, fontSize: 14 }}>{title}</div>
                          <div style={{ color: C.textTer, fontSize: 12, lineHeight: 1.55, marginTop: 3 }}>{meta}</div>
                        </div>
                        <div style={{ color: i === 1 ? C.accent : C.textDis, fontSize: 11, fontFamily: "'Courier New',monospace" }}>
                          0{i + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
                className="grid-2"
              >
                <div
                  style={{
                    borderRadius: 18,
                    border: `.5px solid ${C.accentMid}`,
                    background: "linear-gradient(145deg, rgba(255,122,0,0.10), rgba(255,122,0,0.025))",
                    padding: 20,
                  }}
                  className="manifesto-mini-card manifesto-automation-card"
                >
                  <Workflow size={20} color={C.accent} />
                  <div style={{ color: C.textPri, fontSize: 14, fontWeight: 700, marginTop: 14 }}>Follow-up Automation</div>
                  <div style={{ color: C.textTer, fontSize: 12, lineHeight: 1.6, marginTop: 7 }}>
                    Leads bleiben nicht liegen. Jeder Kontakt bekommt den nächsten Schritt.
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 18,
                    border: `.5px solid ${C.borderEm}`,
                    background: "rgba(255,255,255,0.025)",
                    padding: 20,
                  }}
                  className="manifesto-mini-card"
                >
                  <Bot size={20} color={C.accent} />
                  <div style={{ color: C.textPri, fontSize: 14, fontWeight: 700, marginTop: 14 }}>TigerBot als Mitarbeiter</div>
                  <div style={{ color: C.textTer, fontSize: 12, lineHeight: 1.6, marginTop: 7 }}>
                    Beantwortet, sortiert und qualifiziert, bevor Ihr Team einsteigt.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              margin: "0 34px 34px",
              padding: "20px 22px",
              borderRadius: 18,
              border: `.5px solid ${C.accentMid}`,
              background: "linear-gradient(135deg, rgba(255,122,0,0.12), rgba(8,4,1,0.94))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
            className="manifesto-cta-bar"
          >
            <div>
              <div style={{ color: C.textPri, fontSize: 18, fontWeight: 700, letterSpacing: "-.02em" }}>
                Finden wir heraus, welcher Hebel zuerst greift.
              </div>
              <div style={{ color: C.textTer, fontSize: 13, marginTop: 5 }}>
                Webdesign, TigerBot, Voice Agent oder Bundle: Der erste Schritt muss messbar sein.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="#kontakt" className="cta-btn" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.accent, color: "#fff", textDecoration: "none", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Kostenlose Beratung buchen <ArrowRight size={15} />
              </a>
              <a href="#rechner" style={{ display: "inline-flex", alignItems: "center", color: C.textSec, textDecoration: "none", padding: "12px 10px", fontSize: 13 }}>
                ROI Rechner ansehen
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
