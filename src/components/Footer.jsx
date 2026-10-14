import { C } from "../theme";

export function Footer({ highContrast = false }) {
  const contactEmail = "service@tigerflow.de";

  return (
    <footer
      style={{
        borderTop: `.5px solid ${C.border}`,
        padding: "28px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: highContrast ? "#8F8F8F" : C.textTer,
          letterSpacing: ".04em",
        }}
      >
        TigerFlow
      </div>
      <div style={{ display: "flex", gap: "28px", flexWrap: "wrap", alignItems: "center" }}>
        <a
          href={`mailto:${contactEmail}`}
          style={{
            fontSize: "12px",
            color: C.textSec,
            textDecoration: "none",
            transition: "color .15s",
          }}
          onMouseEnter={(e) => (e.target.style.color = C.accent)}
          onMouseLeave={(e) => (e.target.style.color = C.textSec)}
        >
          {contactEmail}
        </a>
        {[
          { label: "Impressum", href: "/impressum" },
          { label: "Datenschutz", href: "/datenschutz" },
          { label: "AGB", href: "/agb" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontSize: "12px",
              color: highContrast ? C.textSec : C.textTer,
              textDecoration: "none",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => (e.target.style.color = highContrast ? C.textPri : C.textSec)}
            onMouseLeave={(e) => (e.target.style.color = highContrast ? C.textSec : C.textTer)}
          >
            {label}
          </a>
        ))}
      </div>
      <div style={{ fontSize: "12px", color: highContrast ? "#8A8A8A" : C.textDis }}>
        © 2026 TigerFlow. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
