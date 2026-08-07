import { C } from "../theme";
import { Footer } from "./Footer";

const rows = [
  ["Angaben gemäß § 5 DDG", "Jafar Hamzeh\nEinzelunternehmen\nRendsburger Straße 22\n25746 Heide\nDeutschland"],
  ["Kontakt", "E-Mail: service@tigerflow.de"],
  ["Umsatzsteuer-ID", "Wird ergänzt, sobald vorhanden."],
  ["Registereintrag", "Kein Registereintrag vorhanden."],
  ["Aufsichtsbehörde", "Keine zuständige Aufsichtsbehörde angegeben."],
  ["Verantwortlich für den Inhalt", "Jafar Hamzeh\nRendsburger Straße 22\n25746 Heide"],
];

export function ImpressumPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, rgba(255,122,0,0.10), transparent 34%), #070707",
        color: C.textPri,
      }}
    >
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "120px 48px 88px",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: C.textTer,
            textDecoration: "none",
            fontSize: 13,
            marginBottom: 34,
          }}
        >
          ← Zurück zur Website
        </a>

        <div
          style={{
            border: `.5px solid ${C.borderEm}`,
            borderRadius: 14,
            background: "linear-gradient(145deg, rgba(17,17,17,0.96), rgba(8,8,8,0.98))",
            boxShadow: "0 28px 90px rgba(0,0,0,0.56)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "44px 42px 24px", borderBottom: `.5px solid ${C.border}` }}>
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
              Anbieterkennzeichnung
            </div>
            <h1
              style={{
                fontSize: "clamp(34px,5vw,54px)",
                lineHeight: 1,
                letterSpacing: "-.035em",
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              Impressum
            </h1>
            <p style={{ color: C.textTer, fontSize: 15, lineHeight: 1.7, maxWidth: 620 }}>
              Rechtliche Angaben zum Anbieter dieser Website und den digitalen Diensten von TigerFlow.
            </p>
          </div>

          <div style={{ padding: "10px 42px 42px" }}>
            {rows.map(([title, content]) => (
              <section
                key={title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 0.85fr) 1.4fr",
                  gap: 28,
                  padding: "28px 0",
                  borderBottom: `.5px solid ${C.border}`,
                }}
                className="legal-row"
              >
                <h2 style={{ color: C.textSec, fontSize: 13, fontWeight: 600, letterSpacing: ".02em" }}>
                  {title}
                </h2>
                <p style={{ color: C.textPri, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-line" }}>
                  {content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
