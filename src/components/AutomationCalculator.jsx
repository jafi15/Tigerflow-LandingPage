import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { C } from "../theme";
import { Eyebrow } from "./Eyebrow";

export function AutomationCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const hourlyRate = 65; // Average hourly cost in EUR

  const monthlySavings = teamSize * hoursPerWeek * 4 * hourlyRate;
  const yearlySavings = monthlySavings * 12;
  const hoursSavedYearly = teamSize * hoursPerWeek * 4 * 12;

  return (
    <section id="rechner" className="sec" style={{ padding: "96px 48px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "64px", alignItems: "center" }} className="grid-2">
        <div>
          <Eyebrow>ROI Rechner</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: C.textPri, marginBottom: "24px", lineHeight: 1.1 }}>
            Was kostet Sie<br />manuelle Arbeit?
          </h2>
          <p style={{ color: C.textSec, marginBottom: "40px", fontSize: "16px", lineHeight: 1.6, maxWidth: "440px" }}>
            Stellen Sie Ihr Team und die wöchentlichen manuellen Stunden ein, um Ihr Einsparpotenzial durch KI-Automatisierung zu berechnen.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ background: C.surface, padding: "24px", borderRadius: "12px", border: `.5px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ color: C.textPri, fontSize: "14px", fontWeight: 500 }}>Teamgröße</span>
                <span style={{ color: C.accent, fontWeight: 600 }}>{teamSize} Mitarbeiter</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }}
              />
            </div>

            <div style={{ background: C.surface, padding: "24px", borderRadius: "12px", border: `.5px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ color: C.textPri, fontSize: "14px", fontWeight: 500 }}>Manuelle Std / Woche</span>
                <span style={{ color: C.accent, fontWeight: 600 }}>{hoursPerWeek} Std</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #16161D 0%, #0B0B0F 100%)", padding: "40px", borderRadius: "24px", border: `.5px solid ${C.accentMid}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: `radial-gradient(circle, ${C.accentTint} 0%, transparent 70%)`, pointerEvents: "none" }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
              <div style={{ width: "40px", height: "40px", background: C.accentTint, borderRadius: "10px", display: "flex", alignItems: "center", justifyCenter: "center", color: C.accent }}>
                <TrendingUp size={20} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.accent, letterSpacing: ".05em", textTransform: "uppercase" }}>Einsparpotenzial</span>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "12px", color: C.textTer, marginBottom: "8px", textTransform: "uppercase" }}>Jährliche Ersparnis</div>
              <motion.div 
                key={yearlySavings}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: "48px", fontWeight: 600, color: C.textPri, letterSpacing: "-.04em" }}
              >
                €{yearlySavings.toLocaleString()}
              </motion.div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: C.textSec }}>
                  <Clock size={14} />
                  <span style={{ fontSize: "11px" }}>Zeit / Jahr</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 500, color: C.textPri }}>{hoursSavedYearly.toLocaleString()}h</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: C.textSec }}>
                  <Users size={14} />
                  <span style={{ fontSize: "11px" }}>Kapazität</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 500, color: C.textPri }}>+{(hoursSavedYearly / 1600).toFixed(1)} MA</div>
              </div>
            </div>

            <a href="#kontakt" style={{ marginTop: "32px", display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", width: "100%", background: C.accent, color: "#fff", textDecoration: "none", padding: "16px", borderRadius: "12px", fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }} className="cta-btn">
              Potenzial ausschöpfen <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
