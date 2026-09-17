import { useState, useEffect } from "react";
import { C } from "./theme";
import { Navbar } from "./components/Navbar";
import { StickyNav } from "./components/StickyNav";
import { Hero } from "./components/Hero";
import { Problem } from "./components/Problem";
import { ComparisonSlider } from "./components/ComparisonSlider";
import { Services } from "./components/Services";
import { DiagnosisForm } from "./components/DiagnosisForm";
import { Process } from "./components/Process";
import { Results } from "./components/Results";
import { AutomationCalculator } from "./components/AutomationCalculator";
import { ExpertNote } from "./components/ExpertNote";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { ImpressumPage } from "./components/ImpressumPage";
import { DatenschutzPage } from "./components/DatenschutzPage";
import { AGBPage } from "./components/AGBPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { Analytics } from "@vercel/analytics/react";
import { ROUTES } from "./routes.config";
import "./index.css";

const KNOWN_PATHS = new Set(ROUTES.map((r) => r.path));

export default function App({
  pathname = typeof window !== "undefined" ? window.location.pathname : "/",
}) {
  const [scrolled, setScrolled] = useState(false);
  const isImpressum = pathname === "/impressum";
  const isDatenschutz = pathname === "/datenschutz";
  const isAGB = pathname === "/agb";
  const isKnown = KNOWN_PATHS.has(pathname);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      {isImpressum ? (
        <ImpressumPage />
      ) : isDatenschutz ? (
        <DatenschutzPage />
      ) : isAGB ? (
        <AGBPage />
      ) : !isKnown ? (
        <NotFoundPage />
      ) : (
        <div
          style={{
            fontFamily: "'Inter',-apple-system,sans-serif",
            background: C.pageBg,
            color: C.textPri,
            minHeight: "100vh",
          }}
        >
          <Navbar scrolled={scrolled} />
          <StickyNav />
          <Hero />
          <Problem />
          <ComparisonSlider />
          <Services />
          <DiagnosisForm />
          <Process />
          <Results />
          <AutomationCalculator />
          <ExpertNote />
          <CTASection />
          <Footer />
        </div>
      )}
      <Analytics />
    </>
  );
}
