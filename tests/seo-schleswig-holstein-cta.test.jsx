import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { SeoSchleswigHolsteinPage } from "../src/components/SeoSchleswigHolsteinPage.jsx";
import { ProjectCheck } from "../src/components/ProjectCheck.jsx";

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const PAGE_URL = "https://tigerflow.de/seo-schleswig-holstein";

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: PAGE_URL,
    pretendToBeVisual: true,
  });
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("Element", dom.window.Element);
  vi.stubGlobal("Node", dom.window.Node);
  vi.stubGlobal("SVGElement", dom.window.SVGElement);
  vi.stubGlobal("CustomEvent", dom.window.CustomEvent);
  vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
  vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
  dom.window.IntersectionObserver = NoopIntersectionObserver;
  dom.window.matchMedia = () => ({
    matches: false,
    media: "",
    addEventListener() {},
    removeEventListener() {},
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

function click(element) {
  act(() => element.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

function pressEscape() {
  act(() =>
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
  );
}

const label = (element) => element.textContent.replace(/\s+/g, " ").trim();

// Only ever opens and closes the dialog: the form is never filled or submitted.
describe("/seo-schleswig-holstein primary CTAs use the existing project check", () => {
  let dom;
  let root;
  let container;
  let fetchSpy;

  beforeEach(() => {
    dom = installDom();
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    dom.window.fetch = fetchSpy;
    container = document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(
        <>
          <SeoSchleswigHolsteinPage />
          <ProjectCheck hideTrigger />
        </>
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  const primary = () => ({
    hero: container.querySelector(".ssh-hero-actions button[data-project-check-cta]"),
    price: container.querySelector("#preis button[data-project-check-cta]"),
    closing: container.querySelector("#projektanfrage button[data-project-check-cta]"),
  });

  it("labels the three primary CTAs as briefed", () => {
    const { hero, price, closing } = primary();
    expect(hero && label(hero)).toBe("SEO-Ausgangslage prüfen");
    expect(price && label(price)).toBe("SEO-Projekt unverbindlich anfragen");
    expect(closing && label(closing)).toBe("SEO-Ausgangslage prüfen");
  });

  it("renders every CTA as a real button, never as a fake anchor, form or booking promise", () => {
    const ctas = [...container.querySelectorAll("[data-project-check-cta]")];
    expect(ctas.length).toBeGreaterThanOrEqual(3);
    for (const cta of ctas) {
      expect(cta.tagName).toBe("BUTTON");
      expect(cta.getAttribute("type")).toBe("button");
      expect(label(cta)).not.toMatch(/Termin buchen|kostenlose SEO-Analyse|garantiert/i);
    }
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('input, textarea, select, button[type="submit"]')).toBeNull();
    expect(container.querySelector('a[href="#kontakt"]')).toBeNull();
    expect(container.querySelector('a[href^="mailto:"][href*="subject"]')).toBeNull();
  });

  it("dispatches only tigerflow:open-project-check with the clicked element as detail.trigger", () => {
    const received = [];
    const listener = (event) => received.push(event.detail?.trigger);
    window.addEventListener("tigerflow:open-project-check", listener);

    const ctas = [...container.querySelectorAll("button[data-project-check-cta]")];
    for (const cta of ctas) click(cta);
    window.removeEventListener("tigerflow:open-project-check", listener);

    expect(received).toHaveLength(ctas.length);
    ctas.forEach((cta, index) => expect(received[index]).toBe(cta));
  });

  for (const name of ["hero", "price", "closing"]) {
    it(`opens the real project check from the ${name} CTA, closes on Escape and restores focus`, () => {
      const trigger = primary()[name];
      expect(trigger).not.toBeNull();
      expect(document.querySelector('[role="dialog"]')).toBeNull();

      trigger.focus();
      click(trigger);
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog.textContent).toContain("Schritt 1 von 4");

      pressEscape();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  }

  it("triggers no navigation, submission or network request by opening and closing", () => {
    click(primary().hero);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    pressEscape();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.location.href).toBe(PAGE_URL);
  });

  it("shows no success message without a real submission", () => {
    click(primary().price);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).not.toMatch(/Vielen Dank|erfolgreich|gesendet|übermittelt/i);
  });

  it("keeps every FAQ native and closed after mount", () => {
    const details = [...container.querySelectorAll("#faq details")];
    expect(details).toHaveLength(10);
    for (const entry of details) expect(entry.open).toBe(false);
  });
});
