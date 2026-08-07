import { useRef, useEffect, useCallback, useState } from "react";
import { C } from "../theme";
import { useReveal } from "../hooks";
import { Eyebrow } from "./Eyebrow";

const STATS = [
  { value: "+237%", label: "Mehr qualifizierte Leads" },
  { value: "78%",   label: "Mehr gebuchte Termine" },
  { value: "24/7",  label: "Automatisch im Einsatz" },
  { value: "100%",  label: "Skalierbar & messbar" },
];

const ICONS = {
  webdesign: (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 6, border: `1px solid ${C.accent}` }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    </div>
  ),
  voice: (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.accent}` }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M8 7v10M16 7v10M4 11v2M20 11v2" />
      </svg>
    </div>
  ),
  crm: (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 6, border: `1px solid ${C.accent}` }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    </div>
  ),
  leads: (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.accent}` }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  ),
  workflow: (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, position: "relative" }}>
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke={C.accent} strokeWidth="1" style={{ position: "absolute", inset: 0 }}>
        <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2" />
      </svg>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
      </svg>
    </div>
  ),
};

const MODULES = [
  { id: "webdesign", gridArea: "webdesign", title: "Webdesign",            sub: "Premium-Websites",        body: "Individuelle Websites, die Vertrauen schaffen, überzeugen und Besucher in Kunden verwandeln.", floatAnim: "floatA 9s ease-in-out infinite" },
  { id: "voice",     gridArea: "voice",     title: "AI Voice Agents",      sub: "Ausgehende Anrufe",       body: "KI-Agenten führen Anrufe, qualifizieren Interessenten und buchen Termine in Ihrem Namen.",    floatAnim: "floatB 7s ease-in-out 0.4s infinite" },
  { id: "crm",       gridArea: "crm",       title: "CRM-Systeme",          sub: "Zentralisierte Pipeline", body: "Leads erfassen, priorisieren und den Vertrieb mit klaren Daten und Prozessen zum Abschluss führen.",                    floatAnim: "floatA 11s ease-in-out 1.2s infinite" },
  { id: "leads",     gridArea: "leads",     title: "Lead-Systeme",         sub: "Strukturierter Eingang",  body: "Wir gewinnen, bewerten und leiten die richtigen Leads automatisch in Ihren Vertriebsprozess.",                   floatAnim: "floatB 8.5s ease-in-out 0.8s infinite" },
  { id: "workflow",  gridArea: "workflow",  title: "Workflow Automations", sub: "Prozesse verbinden",      body: "Automatisierte Workflows zwischen Tools, Teams und Systemen. Weniger manuelle Arbeit, mehr Konsistenz.",            floatAnim: "floatA 10s ease-in-out 2s infinite" },
];

/* ─────────────────────────────────────────────────────
   Spotlight Card Component (Hover & Glassmorphism)
───────────────────────────────────────────────────── */
function SpotlightCard({ children, style, className }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`spotlight-card ${className || ""}`}
      style={{
        ...style,
        position: "relative",
      }}
    >
      <div 
        className="spotlight-glow" 
        style={{ 
          opacity,
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,122,0,0.06), transparent 40%)` 
        }} 
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Realistic Tiger Image Background
───────────────────────────────────────────────────── */
function TigerImage() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, borderRadius: "16px" }}>
      <img 
        src="/tigerbot-bg.png" 
        alt="TigerBot AI" 
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top right",
          opacity: 0.95,
        }}
      />
      {/* Starker Fade von unten nach oben, damit der Text gut lesbar bleibt */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(14,6,0,1) 15%, rgba(14,6,0,0.85) 45%, transparent 80%)",
        pointerEvents: "none"
      }} />
      {/* Orange Glow Effekt in der oberen rechten Ecke */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at top right, rgba(255,122,0,0.15), transparent 60%)",
        pointerEvents: "none",
        mixBlendMode: "color-dodge"
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Main Services Section
───────────────────────────────────────────────────── */
export function Services() {
  const { ref: sectionRef, visible } = useReveal(0.06);
  const gridRef = useRef(null);
  const tbRef   = useRef(null);
  const modRefs = useRef({});
  const [lines, setLines] = useState([]);

  const measure = useCallback(() => {
    if (!gridRef.current || !tbRef.current) return;
    const gr = gridRef.current.getBoundingClientRect();
    const tb = tbRef.current.getBoundingClientRect();
    const cx = tb.left - gr.left + tb.width  / 2;
    const cy = tb.top  - gr.top  + tb.height / 2;
    setLines(
      MODULES.map(({ id }) => {
        const el = modRefs.current[id];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { id, x1: cx, y1: cy, x2: r.left - gr.left + r.width / 2, y2: r.top - gr.top + r.height / 2 };
      }).filter(Boolean)
    );
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(measure, 80);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [visible, measure]);

  const fu = (d = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .65s ease ${d}ms, transform .65s ease ${d}ms`,
  });

  return (
    <section
      id="leistungen"
      ref={sectionRef}
      style={{ background: C.surface, borderTop: `.5px solid ${C.border}`, borderBottom: `.5px solid ${C.border}`, overflow: "hidden", position: "relative" }}
    >
      {/* Section spotlight — centred on TigerBot */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 60% 70% at 50% 54%, ${C.accent}1a, transparent 55%),
          radial-gradient(ellipse 32% 42% at 50% 50%, ${C.accent}10, transparent 50%),
          radial-gradient(ellipse 90% 55% at 12% 72%, ${C.accent}07, transparent 60%),
          radial-gradient(ellipse 75% 50% at 88% 28%, ${C.accentLt}06, transparent 55%)
        `,
      }} />

      <div className="sec" style={{ maxWidth: "1200px", margin: "0 auto", padding: "112px 48px" }}>

        {/* Header */}
        <div style={fu(0)}>
          <Eyebrow>Leistungen</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, letterSpacing: "-.025em", color: C.textPri, lineHeight: 1.1, marginBottom: "64px", maxWidth: "520px" }}>
            Sechs Systeme.<br />
            Ein Ziel: <span style={{ color: C.accent }}>Wachstum.</span>
          </h2>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: "-42px",
            marginBottom: "54px",
            padding: "9px 14px",
            borderRadius: 999,
            border: `.5px solid ${C.accentMid}`,
            background: "linear-gradient(135deg, rgba(255,122,0,0.09), rgba(255,122,0,0.025))",
            color: C.textSec,
            fontSize: 12,
            lineHeight: 1.4,
            boxShadow: "0 10px 34px rgba(0,0,0,0.24)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, boxShadow: `0 0 10px ${C.accent}` }} />
            Einzeln buchbar oder als TigerFlow System kombinierbar.
          </div>
        </div>

        {/* Hub Grid */}
        <div ref={gridRef} className="hub-grid" style={{ position: "relative", ...fu(100) }}>

          {/* ── SVG Connection Lines ── */}
          {lines.length > 0 && (
            <svg aria-hidden="true" className={`hub-grid-svg ${visible ? "reveal-lines" : ""}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
              <defs>
                <filter id="sl-glow" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="sl-dot-glow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="7" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {lines.map(({ id, x1, y1, x2, y2 }) => (
                  <path key={id} id={`slp-${id}`} d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} fill="none" />
                ))}
              </defs>

              {lines.map(({ id, x1, y1, x2, y2 }, i) => (
                <g key={id}>
                  {/* Heavy outer glow */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth="8" strokeOpacity=".09" filter="url(#sl-glow)" />
                  {/* Mid glow */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth="2.5" strokeOpacity=".20" />
                  {/* Sharp dashed energy line */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth="1.1" strokeOpacity=".65" strokeDasharray="4 6" />
                  {/* Endpoint glow */}
                  <circle cx={x2} cy={y2} r="7"   fill={C.accent} fillOpacity=".12" />
                  <circle cx={x2} cy={y2} r="3"   fill={C.accent} fillOpacity=".78" filter="url(#sl-glow)" />
                  {/* Animated dot 1 */}
                  <circle r="4.5" fill={C.accent} fillOpacity=".96" filter="url(#sl-dot-glow)">
                    <animateMotion dur={`${3.2 + i * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.55}s`}>
                      <mpath href={`#slp-${id}`} />
                    </animateMotion>
                  </circle>
                  {/* Animated dot 2 */}
                  <circle r="2.5" fill={C.accentLt} fillOpacity=".85">
                    <animateMotion dur={`${4.8 + i * 0.28}s`} repeatCount="indefinite" begin={`${1.6 + i * 0.45}s`}>
                      <mpath href={`#slp-${id}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}
            </svg>
          )}

          {/* ── TigerBot Main Card ── */}
          <div id="service-tigerbot" className={`tigerbot-card service-anchor ${visible ? "reveal-tb" : ""}`} style={{ gridArea: "tigerbot", position: "relative", zIndex: 2, opacity: 0 }}>

            {/* Pulsing outer aura */}
            <div aria-hidden="true" style={{
              position: "absolute", inset: -6, borderRadius: 22,
              boxShadow: `0 0 70px ${C.accent}40, 0 0 140px ${C.accent}1c`,
              animation: "glowPulse 3.5s ease-in-out infinite",
              pointerEvents: "none", zIndex: 0,
            }} />

            {/* 3D Orbital Platform Rings */}
            {/* Ring 1 — innermost, brightest */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -26, left: "7%", right: "7%", height: 52,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,122,0,0.70)",
              boxShadow: "0 0 26px 10px rgba(255,122,0,0.36), 0 0 55px 20px rgba(255,122,0,0.14), inset 0 -2px 18px rgba(255,122,0,0.10)",
              pointerEvents: "none", zIndex: 0,
            }} />
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -26, left: "7%", right: "7%", height: 52,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 130%, rgba(255,122,0,0.24), transparent 55%)",
              pointerEvents: "none", zIndex: 0,
            }} />
            {/* Ring 2 */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -44, left: "1%", right: "1%", height: 38,
              borderRadius: "50%",
              border: "1px solid rgba(255,122,0,0.40)",
              boxShadow: "0 0 24px 8px rgba(255,122,0,0.17)",
              pointerEvents: "none", zIndex: 0,
            }} />
            {/* Ring 3 — outermost, faintest */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -60, left: "-6%", right: "-6%", height: 28,
              borderRadius: "50%",
              border: "1px solid rgba(255,122,0,0.19)",
              boxShadow: "0 0 34px 10px rgba(255,122,0,0.07)",
              pointerEvents: "none", zIndex: 0,
            }} />

            {/* Card */}
            <div ref={tbRef} style={{
              position: "relative", zIndex: 1,
              width: "100%",
              maxWidth: "380px",
              margin: "0 auto",
              background: `linear-gradient(155deg, #140800 0%, #1c0e00 45%, #2d1200 75%, #1a0900 100%)`,
              border: `1px solid ${C.accent}62`,
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: `0 0 0 1px ${C.accent}22 inset, 0 32px 80px rgba(0,0,0,.80)`,
            }}>
              {/* Background Tiger */}
              <TigerImage />

              {/* Top glow edge */}
              <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: `linear-gradient(to right, transparent, ${C.accent}99, transparent)`, zIndex: 1 }} />
              {/* Left edge glow */}
              <div aria-hidden="true" style={{ position: "absolute", top: "10%", bottom: "10%", left: 0, width: "1px", background: `linear-gradient(to bottom, transparent, ${C.accent}42, transparent)`, zIndex: 1 }} />
              {/* Corner highlight */}
              <div aria-hidden="true" style={{ position: "absolute", top: -60, left: -30, width: 200, height: 200, background: `radial-gradient(circle, ${C.accent}14, transparent 70%)`, pointerEvents: "none", zIndex: 1 }} />

              {/* Text column */}
              <div style={{ position: "relative", zIndex: 2, padding: "40px 32px 36px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.accent}1a`, border: `1px solid ${C.accent}45`, borderRadius: 100, padding: "4px 12px", marginBottom: 20 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, boxShadow: `0 0 6px ${C.accent}`, animation: "glowPulse 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 9, letterSpacing: ".12em", color: C.accent, fontWeight: 600, textTransform: "uppercase" }}>Hauptsystem</span>
                </div>
                
                <h3 style={{ fontSize: "clamp(32px,3.5vw,44px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-.025em", marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif", textShadow: `0 0 40px ${C.accent}30` }}>
                  Tiger<span style={{ color: C.accent }}>Bot</span>
                </h3>
                <p style={{ fontSize: 14, color: "#FFFFFF", marginBottom: 6 }}>Ihr digitaler Mitarbeiter.</p>
                <p style={{ fontSize: 13, color: C.textTer, marginBottom: 32, lineHeight: 1.6, maxWidth: "280px" }}>
                  <span style={{ color: C.accent }}>24/7</span> aktiv. Qualifiziert, beantwortet und bucht Termine – automatisch.
                </p>
                
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                  {[
                    { label: "Beantwortet Anfragen", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> },
                    { label: "Qualifiziert Leads", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                    { label: "Bucht Termine", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                    { label: "Lernt & optimiert", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg> }
                  ].map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#FFFFFF", fontWeight: 500, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                      <span className={`tb-check tb-check-${idx}`} style={{ color: C.accent, display: "flex", alignItems: "center", padding: 4 }}>{f.icon}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>
                
                <div className="tb-live-badge" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: `rgba(0,0,0,0.6)`, border: `1px solid ${C.accent}40`, borderRadius: 10, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 12px #22c55e", flexShrink: 0, animation: "glowPulse 2.5s ease-in-out infinite" }} />
                    <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 500 }}>
                      TigerBot aktiv
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#FFFFFF", opacity: 0.6 }}>Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Satellite Module Cards ── */}
          {MODULES.map(({ id, gridArea, title, sub, body, floatAnim }, idx) => {
            const delay = 0.6 + idx * 0.15; // Staggered delay
            return (
              <div 
                key={id} 
                id={`service-${id}`}
                className="service-anchor"
                ref={(el) => { modRefs.current[id] = el; }}
                style={{ 
                  gridArea, 
                  position: "relative", 
                zIndex: 2, 
                opacity: 0, /* handled by revealMod animation */
                animation: visible ? `revealMod 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s forwards, ${floatAnim}` : "none" 
              }}>
                {/* Platform glow base */}
                <div aria-hidden="true" style={{ position: "absolute", bottom: -22, left: "8%", right: "8%", height: 44, background: "radial-gradient(ellipse, rgba(255,122,0,0.30), transparent 70%)", filter: "blur(8px)", pointerEvents: "none" }} />
                <div aria-hidden="true" style={{ position: "absolute", bottom: -38, left: "18%", right: "18%", height: 28, background: "radial-gradient(ellipse, rgba(255,122,0,0.14), transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />

                <SpotlightCard 
                  className="card-hover"
                  style={{
                    background:       "linear-gradient(145deg, rgba(14,8,2,0.97) 0%, rgba(8,4,1,0.98) 100%)",
                    backdropFilter:   "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border:           ".5px solid rgba(255,122,0,0.18)",
                    borderBottom:     "1.5px solid rgba(255,122,0,0.44)",
                    borderRadius:     14,
                    padding:          "24px 22px 38px",
                    overflow:         "hidden",
                    cursor:           "default",
                    boxShadow:        "0 20px 60px rgba(0,0,0,0.72), 0 0 0 .5px rgba(255,122,0,0.07) inset",
                  }}
                >
                  {/* Top shimmer */}
                  <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 16, right: 16, height: ".5px", background: "linear-gradient(to right, transparent, rgba(255,122,0,0.30), transparent)", zIndex: 1 }} />
                  {/* Bottom orange glow gradient */}
                  <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: "linear-gradient(to top, rgba(255,122,0,0.09), transparent)", pointerEvents: "none", zIndex: 1 }} />
                  {/* Corner micro-glow */}
                  <div aria-hidden="true" style={{ position: "absolute", top: -18, right: -18, width: 72, height: 72, background: "radial-gradient(circle, rgba(255,122,0,0.10), transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, position: "relative", zIndex: 2 }}>
                    {/* Icon */}
                    <div style={{ color: C.accent, filter: `drop-shadow(0 0 8px ${C.accent}40)` }}>
                      {ICONS[id]}
                    </div>

                    {/* Header Text */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-.01em" }}>{title}</h3>
                      <span style={{ fontSize: 11, fontWeight: 500, color: C.accent }}>{sub}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "#A0A0A0", lineHeight: 1.6, position: "relative", zIndex: 2, paddingRight: 20 }}>{body}</p>

                  {/* Bottom-right arrow */}
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ position: "absolute", bottom: 20, right: 20, zIndex: 2 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </SpotlightCard>
              </div>
            );
          })}
        </div>

        {/* ── Stats Bar ── */}
        <div className="stats-grid" style={{
          marginTop: 44,
          padding: "28px 32px",
          background: "linear-gradient(135deg, rgba(14,8,2,0.97) 0%, rgba(8,4,1,0.98) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: ".5px solid rgba(255,122,0,0.20)",
          borderTop: "1px solid rgba(255,122,0,0.38)",
          borderRadius: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(255,122,0,0.10), 0 0 0 .5px rgba(255,122,0,0.06) inset",
          ...fu(500),
        }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: "1px", background: `linear-gradient(to right, transparent, ${C.accent}58, transparent)` }} />

          {STATS.map(({ value, label }, i) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4, padding: "8px 0", borderRight: i < 3 ? `.5px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: C.accent, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-.025em", filter: `drop-shadow(0 0 14px ${C.accent}58)` }}>
                {value}
              </span>
              <span style={{ fontSize: 11, color: C.textTer, lineHeight: 1.5 }}>{label}</span>
            </div>
          ))}

          <div aria-hidden="true" style={{ position: "absolute", bottom: 6, right: 14, fontSize: 9, color: C.textDis }}>
            * illustrative Demo-Kennzahlen
          </div>
        </div>

      </div>
    </section>
  );
}
