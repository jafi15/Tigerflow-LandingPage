import { C } from "../theme";

function CorridorPanel({ side, label, title, status, mx, my }) {
  const direction = side === "left" ? 1 : -1;

  return (
    <div
      className={`hero-corridor-panel hero-corridor-panel-${side}`}
      style={{
        position: "absolute",
        top: side === "left" ? "50%" : "57%",
        ...(side === "left"
          ? { left: "calc(52% + 18px)" }
          : { right: "clamp(24px,3.5vw,58px)" }),
        width: "220px",
        padding: "17px 18px",
        borderRadius: "12px",
        border: "0.5px solid rgba(255,122,0,0.22)",
        background: "linear-gradient(145deg,rgba(17,13,10,.90),rgba(9,9,9,.82))",
        boxShadow: "0 18px 50px rgba(0,0,0,.48),0 0 28px rgba(255,122,0,.055)",
        transform: `translate3d(${mx * 5 * direction}px,calc(-50% + ${my * 4}px),0)`,
        transition: "transform .18s linear",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          color: C.accent,
          fontFamily: "'Courier New',monospace",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: C.accent,
            boxShadow: "0 0 10px rgba(255,122,0,.55)",
          }}
        />
        {label}
      </div>
      <div
        style={{
          color: C.textPri,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: 1.35,
          marginBottom: "13px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingTop: "11px",
          borderTop: "0.5px solid rgba(255,255,255,.055)",
          color: C.textTer,
          fontSize: "11px",
        }}
      >
        <span style={{ color: C.accentLt, fontSize: "12px" }}>✓</span>
        {status}
      </div>
    </div>
  );
}

export function HeroSystemCorridor({ mx = 0, my = 0 }) {
  return (
    <div
      className="hero-system-corridor hero-corridor-right-layout"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}
    >
      <div
        className="hero-corridor-watermark-shell"
        style={{
          position: "absolute",
          left: "76%",
          top: "50%",
          width: "clamp(340px,33vw,500px)",
          transform: "translate3d(-50%,-50%,0)",
        }}
      >
        <img
          className="hero-corridor-watermark"
          src="/tigerflow-mark.png"
          alt=""
          width="320"
          height="245"
          style={{
            width: "100%",
            height: "auto",
            transform: `translate3d(${mx * 2}px,${my * 2}px,0)`,
            transition: "transform .2s linear",
          }}
        />
      </div>

      <div className="hero-corridor-line">
        <span />
        <span />
        <span />
        <i className="hero-corridor-pulse" />
      </div>

      <CorridorPanel
        side="left"
        label="Website"
        title="Neue Anfrage eingegangen"
        status="Formular erfasst"
        mx={mx}
        my={my}
      />
      <CorridorPanel
        side="right"
        label="Automation"
        title="Anfrage qualifiziert"
        status="Nächster Schritt vorbereitet"
        mx={mx}
        my={my}
      />
    </div>
  );
}
