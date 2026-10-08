import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, Compass, Globe2, Sparkles } from "lucide-react";
import "./ServiceMegaMenu.css";

export function ServiceMegaMenu({ className = "", currentPath = "" }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const close = () => {
      if (menuRef.current) menuRef.current.open = false;
    };
    const handlePointerDown = (event) => {
      if (menuRef.current?.open && !menuRef.current.contains(event.target)) close();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
        menuRef.current?.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const pageLink = (href, label) => (
    <a
      href={href}
      className={currentPath === href ? "is-current" : undefined}
      aria-current={currentPath === href ? "page" : undefined}
    >
      <span>{label}</span><ArrowRight size={13} aria-hidden="true" />
    </a>
  );

  const openProjectCheck = (event) => {
    if (menuRef.current) menuRef.current.open = false;
    window.dispatchEvent(
      new CustomEvent("tigerflow:open-project-check", {
        detail: { trigger: event.currentTarget },
      })
    );
  };

  return (
    <details ref={menuRef} className={`tf-service-menu ${className}`.trim()}>
      <summary>
        Leistungen <ChevronDown size={13} aria-hidden="true" />
      </summary>
      <div className="tf-service-panel">
        <div className="tf-service-intro">
          <span>LEISTUNGEN</span>
          <strong>Digitale Systeme mit einem klaren Einstieg.</strong>
          <p>Direkt zur passenden Leistung oder regionalen Website.</p>
        </div>
        <div className="tf-service-groups">
          <section>
            <div className="tf-service-group-title">
              <Globe2 size={16} aria-hidden="true" />
              <span><strong>Website</strong><small>Auftritt & Anfragen</small></span>
            </div>
            <a href="/#service-webdesign"><span>Website im Überblick</span><ArrowRight size={13} aria-hidden="true" /></a>
            {pageLink("/webdesign-heide", "Webdesign Heide")}
            {pageLink("/webdesign-dithmarschen", "Webdesign Dithmarschen")}
          </section>
          <section>
            <div className="tf-service-group-title">
              <Compass size={16} aria-hidden="true" />
              <span><strong>SEO</strong><small>Sichtbarkeit & Nachfrage</small></span>
            </div>
            <a href="/#leistungen"><span>SEO im Überblick</span><ArrowRight size={13} aria-hidden="true" /></a>
            <span className="tf-service-preview"><span>Local SEO</span><small>Seite folgt</small></span>
            <span className="tf-service-preview"><span>SEO-Betreuung</span><small>Seite folgt</small></span>
          </section>
          <section>
            <div className="tf-service-group-title">
              <Sparkles size={16} aria-hidden="true" />
              <span><strong>KI & Automatisierung</strong><small>Prozesse & Entlastung</small></span>
            </div>
            <a href="/#leistungen"><span>KI im Überblick</span><ArrowRight size={13} aria-hidden="true" /></a>
            <span className="tf-service-preview"><span>TigerBot & TelefonBot</span><small>Seite folgt</small></span>
            <span className="tf-service-preview"><span>CRM-Automatisierung</span><small>Seite folgt</small></span>
          </section>
        </div>
        <div className="tf-service-footer">
          <span><i aria-hidden="true" /> Website als Einstieg. SEO und Automatisierung als Ausbau.</span>
          <button type="button" onClick={openProjectCheck}>Projekt einordnen <ArrowRight size={13} aria-hidden="true" /></button>
        </div>
      </div>
    </details>
  );
}
