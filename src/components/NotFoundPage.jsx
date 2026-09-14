import { C } from "../theme";
import { Footer } from "./Footer";

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 20% 0%, rgba(255,122,0,0.10), transparent 34%), #070707",
        color: C.textPri,
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "640px",
          margin: "0 auto",
          padding: "120px 48px 88px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: ".13em",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Fehler 404
        </div>
        <h1
          style={{
            fontSize: "clamp(34px,5vw,54px)",
            lineHeight: 1.05,
            letterSpacing: "-.035em",
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          Seite nicht gefunden
        </h1>
        <p
          style={{
            color: C.textTer,
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          Die aufgerufene Seite existiert nicht oder wurde verschoben. Nutzen Sie
          einen der folgenden Links, um weiterzukommen.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/"
            className="cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: C.accent,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              padding: "13px 28px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Zur Startseite
          </a>
          <a
            href="/#kontakt"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: `.5px solid ${C.borderEm}`,
              color: C.textSec,
              textDecoration: "none",
              borderRadius: 8,
              padding: "13px 28px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Kontakt aufnehmen
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
