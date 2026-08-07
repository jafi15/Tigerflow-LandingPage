import { useState, useRef } from "react";
import { AlertCircle, Zap, MousePointer2 } from "lucide-react";
import { C } from "../theme";
import { Eyebrow } from "./Eyebrow";

export function ComparisonSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e) => handleMove(e.clientX);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX);

  return (
    <section className="sec" style={{ padding: "96px 48px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <Eyebrow>Vergleich</Eyebrow>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: C.textPri, lineHeight: 1.1 }}>
          Vom Chaos zur Klarheit
        </h2>
      </div>

      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        style={{
          position: "relative",
          width: "100%",
          height: "480px",
          borderRadius: "24px",
          overflow: "hidden",
          cursor: "ew-resize",
          userSelect: "none",
          border: `.5px solid ${C.border}`,
          background: C.pageBg,
        }}
      >
        {/* Manual Side (Left) */}
        <div style={{ position: "absolute", inset: 0, background: "#111117" }}>
          <div style={{ padding: "60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: "#E24B4A", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={24} />
              <span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "12px", letterSpacing: ".1em" }}>Manueller Prozess</span>
            </div>
            <h3 style={{ fontSize: "32px", color: C.textPri, marginBottom: "24px", maxWidth: "400px" }}>Zeitfressende Routineaufgaben</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: C.textTer }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E24B4A" }} />
                <span>Leads manuell abtippen</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E24B4A" }} />
                <span>E-Mails einzeln beantworten</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E24B4A" }} />
                <span>Termine per Telefon suchen</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Side (Right) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #1A0800 0%, #111111 100%)",
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          <div style={{ padding: "60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
            <div style={{ color: C.accent, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", flexDirection: "row-reverse" }}>
              <Zap size={24} />
              <span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "12px", letterSpacing: ".1em" }}>AI Automation</span>
            </div>
            <h3 style={{ fontSize: "32px", color: C.textPri, marginBottom: "24px", maxWidth: "400px" }}>Intelligente, skalierbare Systeme</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: C.textSec }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: "row-reverse" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent }} />
                <span>Lead-Qualifizierung in Echtzeit</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: "row-reverse" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent }} />
                <span>Automatisierte Antwort-Sequenzen</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: "row-reverse" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent }} />
                <span>Terminbuchung ohne Rückfragen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Handle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sliderPosition}%`,
            width: "2px",
            background: "rgba(255,255,255,0.2)",
            zIndex: 10,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: C.pageBg,
              border: `.5px solid ${C.borderEm}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.accent,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <MousePointer2 size={20} />
          </div>
        </div>
      </div>
    </section>
  );
}
