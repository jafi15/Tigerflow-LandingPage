import { useState } from "react";
import { C } from "../theme";
import { useReveal } from "../hooks";
import { Eyebrow } from "./Eyebrow";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const { ref, visible } = useReveal(0.15);
  const contactEmail = "service@tigerflow.de";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    setTimeout(() => setStatus("done"), 1000);
  };

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
          Lassen Sie uns prüfen,
          <br />
          wo der größte Hebel liegt.
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
          Wir analysieren, ob Webdesign, TigerBot, Voice Agent oder ein Bundle
          für Ihr Unternehmen zuerst den größten Effekt hat.
        </p>
        {status === "done" ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 28px",
              background: "rgba(74,222,128,0.06)",
              border: ".5px solid rgba(74,222,128,0.2)",
              borderRadius: "10px",
              boxShadow: "0 4px 24px rgba(0,0,0,.35)",
            }}
          >
            <span style={{ color: "#4ADE80", fontSize: "14px" }}>✓</span>
            <span style={{ fontSize: "14px", color: C.textSec }}>
              Danke — wir melden uns innerhalb von 24 Stunden.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              maxWidth: "480px",
              margin: "0 auto",
              border: `.5px solid ${status === "error" ? "#E24B4A55" : C.borderEm}`,
              borderRadius: "10px",
              overflow: "hidden",
              transition: "border-color .2s",
              boxShadow:
                "0 4px 28px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.04) inset",
            }}
            className="form-stack"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              placeholder="ihre@email.de"
              style={{
                flex: 1,
                background: C.surface,
                border: "none",
                padding: "14px 18px",
                fontSize: "14px",
                fontFamily: "'Inter',sans-serif",
                color: C.textPri,
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              className="cta-btn"
              disabled={status === "sending"}
              style={{
                background: C.accent,
                color: "#fff",
                border: "none",
                padding: "14px 22px",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "'Inter',sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {status === "sending" && (
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "1.5px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              )}
              Analyse anfragen →
            </button>
          </form>
        )}
        {status === "error" && (
          <p style={{ fontSize: "12px", color: "#E24B4A", marginTop: "8px" }}>
            Bitte geben Sie eine gültige E-Mail-Adresse ein.
          </p>
        )}
        <p
          style={{
            fontSize: "11px",
            color: C.textDis,
            marginTop: "14px",
            letterSpacing: ".02em",
          }}
        >
          Kein Spam. Kein Newsletter. Nur eine konkrete Einschätzung.
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
