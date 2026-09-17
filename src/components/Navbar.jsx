import { C } from "../theme";

export function Navbar({ scrolled }) {
  const links = ["Leistungen", "Prozess", "Ergebnisse", "Kontakt"];
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        borderBottom: `0.5px solid ${scrolled ? "#1A1A22" : "transparent"}`,
        background: scrolled ? "rgba(11,11,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        zIndex: 100,
        transition: "background .35s,border-color .35s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        <img
          src="/tigerflow-mark.png"
          alt=""
          aria-hidden="true"
          width="320"
          height="245"
          style={{
            width: "30px",
            height: "24px",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: C.textPri,
            letterSpacing: ".04em",
          }}
        >
          TigerFlow
        </div>
      </div>
      <div
        className="hide-mobile"
        style={{ display: "flex", gap: "32px", alignItems: "center" }}
      >
        {links.map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase()}`}
            className="nav-link"
            style={{ fontSize: "13px", fontWeight: 500, letterSpacing: ".005em" }}
          >
            {l}
          </a>
        ))}
        <a
          href="#kontakt"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: C.accent,
            textDecoration: "none",
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = ".7")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Beratung buchen →
        </a>
      </div>
    </nav>
  );
}
