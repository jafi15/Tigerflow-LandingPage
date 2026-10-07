import { C } from "../theme";
import { Eyebrow } from "./Eyebrow";

export function PositioningIntro() {
  return (
    <section
      id="positionierung"
      className="sec"
      style={{ padding: "72px 48px 32px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, .9fr) minmax(0, 1.1fr)",
          gap: "clamp(36px, 7vw, 88px)",
          alignItems: "start",
          padding: "44px 0",
          borderTop: `.5px solid ${C.borderEm}`,
          borderBottom: `.5px solid ${C.border}`,
        }}
      >
        <div>
          <Eyebrow>TigerFlow aus Heide</Eyebrow>
          <h2
            style={{
              fontFamily: "'Space Grotesk','Inter',-apple-system,sans-serif",
              fontSize: "clamp(27px, 3.4vw, 42px)",
              fontWeight: 600,
              letterSpacing: "-.025em",
              lineHeight: 1.12,
              color: C.textPri,
              maxWidth: "520px",
            }}
          >
            Webdesign, SEO und KI-Automatisierung – sinnvoll verbunden.
          </h2>
        </div>

        <div style={{ paddingTop: "25px", maxWidth: "540px" }}>
          <p
            style={{
              fontSize: "clamp(17px, 2vw, 20px)",
              lineHeight: 1.6,
              letterSpacing: "-.012em",
              color: C.textPri,
              marginBottom: "18px",
            }}
          >
            TigerFlow bringt Websites, digitale Sichtbarkeit und Geschäftsprozesse auf den modernsten Stand.
          </p>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.75,
              color: C.textSec,
              maxWidth: "510px",
            }}
          >
            Wir begleiten Unternehmen in Heide, Dithmarschen und Schleswig-Holstein. Spezialisierte Web-, SEO- und KI-Projekte setzen wir auch deutschlandweit um.
          </p>
        </div>
      </div>
    </section>
  );
}
