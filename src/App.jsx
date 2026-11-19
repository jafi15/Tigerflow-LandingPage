import { useState, useEffect } from "react";
import { C } from "./theme";
import { Navbar } from "./components/Navbar";
import { StickyNav } from "./components/StickyNav";
import { Hero } from "./components/Hero";
import { PositioningIntro } from "./components/PositioningIntro";
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
import { ProjectCheck } from "./components/ProjectCheck";
import { Analytics } from "@vercel/analytics/react";
import { ROUTES } from "./routes.config";
import { renderRoutePage } from "./routePages";
import "./index.css";

const KNOWN_PATHS = new Set(ROUTES.map((r) => r.path));
// Pages whose own sticky section bar already includes the service menu (no second bar).
const LOCAL_STICKY_BAR_PATHS = new Set([
  "/seo-heide",
  "/seo-schleswig-holstein",
  "/preise",
  "/seo-betreuung",
  "/webdesign-schleswig-holstein",
]);
const STICKY_PAGE_LINKS = {
  "/webdesign-heide": [
    { href: "#ablauf", label: "Ablauf" },
    { href: "#preis", label: "Preis" },
    { href: "#faq", label: "FAQ" },
  ],
  "/webdesign-dithmarschen": [
    { href: "#situationen", label: "Unternehmen" },
    { href: "#preis", label: "Preis" },
    { href: "#faq", label: "FAQ" },
  ],
  "/website-betreuung": [
    { href: "#pruefroutine", label: "Prüfroutine" },
    { href: "#pakete", label: "Pakete" },
    { href: "#faq", label: "FAQ" },
  ],
  "/ueber-uns": [
    { href: "/ueber-uns", label: "Über uns", current: true },
    { href: "#arbeitsweise", label: "Arbeitsweise" },
  ],
};

export default function App({
  pathname = typeof window !== "undefined" ? window.location.pathname : "/",
}) {
  const [scrolled, setScrolled] = useState(false);
  const isKnown = KNOWN_PATHS.has(pathname);
  // Legal pages and the 404 page render below the shared navbar.
  const withSharedNavbar = !isKnown || ["/impressum", "/datenschutz", "/agb"].includes(pathname);
  // Every route except "/" is code-split; its chunk is preloaded before render.
  const routePage = renderRoutePage(pathname);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      {withSharedNavbar ? (
        <><Navbar scrolled currentPath={pathname} />{routePage}</>
      ) : routePage ? (
        // Money pages bring their own (static) header. Pages with their own section bar carry the
        // service menu in that bar; all others get the shared sticky bar, placed before the page
        // (and therefore before <main>).
        <>
          {!LOCAL_STICKY_BAR_PATHS.has(pathname) && (
            <StickyNav threshold={80} currentPath={pathname} pageLinks={STICKY_PAGE_LINKS[pathname] || []} />
          )}
          {routePage}
        </>
      ) : (
        <div
          style={{
            fontFamily: "'Inter',-apple-system,sans-serif",
            background: C.pageBg,
            color: C.textPri,
            minHeight: "100vh",
          }}
        >
          <Navbar scrolled={scrolled} currentPath={pathname} />
          <StickyNav />
          <Hero />
          <PositioningIntro />
          <Problem />
          <ComparisonSlider />
          <Services />
          <DiagnosisForm />
          <Process />
          <Results />
          <AutomationCalculator />
          <ExpertNote />
          <CTASection />
          <Footer highContrast />
        </div>
      )}
      {pathname !== "/" && <ProjectCheck hideTrigger />}
      <Analytics />
    </>
  );
}
