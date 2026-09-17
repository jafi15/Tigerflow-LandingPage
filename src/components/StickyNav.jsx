import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calculator } from "lucide-react";
import { C } from "../theme";

export function StickyNav() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setProgress(scrolled);
      setShow(winScroll > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "64px",
            background: "rgba(11,11,15,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: `.5px solid ${C.borderEm}`,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 48px"
          }}
        >
          {/* Progress Bar */}
          <div style={{ position: "absolute", bottom: "-0.5px", left: 0, height: "1px", background: C.accent, width: `${progress}%`, transition: "width 0.1s linear" }} />

          <div style={{ width: "100%", maxWidth: "1100px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
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
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.textPri, letterSpacing: ".04em" }}>TigerFlow</div>
              </div>
            </div>

            <div
              className="hide-mobile"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "12px",
                color: C.textSec,
                letterSpacing: ".02em",
                whiteSpace: "nowrap",
              }}
            >
              Wir skalieren. Sie <span style={{ color: C.accent }}>profitieren.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <a href="#rechner" style={{ fontSize: "13px", color: C.textSec, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }} className="hide-mobile nav-link">
                <Calculator size={14} /> ROI Rechner
              </a>
              <a 
                href="#kontakt" 
                style={{ 
                  background: C.accent, 
                  color: "#fff", 
                  textDecoration: "none", 
                  padding: "10px 20px", 
                  borderRadius: "100px", 
                  fontSize: "13px", 
                  fontWeight: 500, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px" 
                }} 
                className="cta-btn"
              >
                Jetzt anfragen <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
