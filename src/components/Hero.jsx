import { C } from "../theme";
import { useTyped, useMouseParallax } from "../hooks";
import { GridBg } from "./GridBg";
import { DashboardMockup } from "./DashboardMockup";

const TYPED_WORDS = [
  "Systeme, die jagen.",
  "Systeme, die qualifizieren.",
  "Systeme, die skalieren.",
  "Systeme, die schneller verkaufen.",
];

export function Hero() {
  const { display, done } = useTyped(TYPED_WORDS);
  const mouse = useMouseParallax(1);
  const services = [
    { label: "TigerBot", href: "#service-tigerbot" },
    { label: "Webdesign", href: "#service-webdesign" },
    { label: "Voice Agents", href: "#service-voice" },
    { label: "CRM", href: "#service-crm" },
    { label: "Lead-Systeme", href: "#service-leads" },
    { label: "Automation", href: "#service-workflow" },
  ];

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "64px",
      }}
    >
      <GridBg mx={mouse.x} my={mouse.y} />
      <DashboardMockup mx={mouse.x} my={mouse.y} />

      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "560px",
          padding: "0 48px",
          margin: "0",
        }}
      >
        <div className="fu0" style={{ marginBottom: "22px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: C.accent,
              padding: "5px 12px",
              background: C.accentTint,
              border: `.5px solid ${C.accentMid}`,
              borderRadius: "100px",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: C.accent,
              }}
            />
            TigerFlow · AI Systems & Automation
          </span>
        </div>

        <h1
          className="fu1 hero-h1"
          style={{
            fontSize: "clamp(40px,6vw,70px)",
            fontFamily: "'Space Grotesk','Inter',-apple-system,sans-serif",
            fontWeight: 600,
            letterSpacing: "-.02em",
            lineHeight: 1.01,
            color: C.textPri,
            marginBottom: "2px",
          }}
        >
          Wir bauen
        </h1>
        <div
          className="fu2 hero-h1"
          style={{
            fontSize: "clamp(40px,6vw,70px)",
            fontFamily: "'Space Grotesk','Inter',-apple-system,sans-serif",
            fontWeight: 600,
            letterSpacing: "-.02em",
            lineHeight: 1.01,
            color: C.textPri,
            minHeight: "1.06em",
            display: "flex",
            alignItems: "baseline",
            marginBottom: "28px",
          }}
        >
          <span>{display}</span>
          <span
            style={{
              display: "inline-block",
              width: "3px",
              height: ".82em",
              background: done ? "transparent" : C.accent,
              marginLeft: "3px",
              verticalAlign: "middle",
              borderRadius: "1px",
              animation: done ? "none" : "blink 1.1s step-end infinite",
              transition: "background .3s",
            }}
          />
        </div>

        <p
          className="fu3"
          style={{
            fontSize: "17px",
            fontWeight: 300,
            lineHeight: 1.72,
            color: C.textTer,
            letterSpacing: "-.005em",
            maxWidth: "420px",
            marginBottom: "40px",
          }}
        >
          TigerFlow automatisiert Leads, Anfragen und Prozesse —<br />
          mit TigerBot, Voice Agents und Systemen, die rund um die Uhr arbeiten.
        </p>

        <div className="fu4">
          <a
            href="#kontakt"
            className="cta-btn cta-full"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: C.accent,
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              padding: "13px 28px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: ".01em",
            }}
          >
            Kostenlose Beratung buchen <span style={{ fontSize: "15px" }}>→</span>
          </a>
        </div>

        <div
          className="fu5 hero-service-badges"
          style={{
            marginTop: "44px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: C.textDis,
              letterSpacing: ".05em",
              fontWeight: 500,
            }}
          >
            Einzeln buchbar
          </span>
          {services.map((service) => (
            <a
              key={service.href}
              href={service.href}
              className="hero-service-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 11px",
                borderRadius: "999px",
                border: `.5px solid ${C.borderEm}`,
                background: "rgba(255,255,255,0.025)",
                color: C.textTer,
                textDecoration: "none",
                fontSize: "12px",
                lineHeight: 1,
                transition:
                  "color .18s ease,border-color .18s ease,background .18s ease,transform .18s ease,box-shadow .18s ease",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: C.accent,
                  boxShadow: `0 0 10px ${C.accent}66`,
                  flexShrink: 0,
                }}
              />
              {service.label}
            </a>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.28,
        }}
        className="fu5 hero-scroll-indicator"
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: ".1em",
            color: C.textTer,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: ".5px",
            height: "28px",
            background: `linear-gradient(to bottom,${C.textTer},transparent)`,
          }}
        />
      </div>
    </section>
  );
}
