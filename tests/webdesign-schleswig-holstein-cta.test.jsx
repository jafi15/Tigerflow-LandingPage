import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { WebdesignSchleswigHolsteinPage } from "../src/components/WebdesignSchleswigHolsteinPage.jsx";
import { ProjectCheck } from "../src/components/ProjectCheck.jsx";

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/webdesign-schleswig-holstein",
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

// Only ever opens and closes the dialog: the form is never filled or submitted.
describe("/webdesign-schleswig-holstein primary CTAs use the existing project check", () => {
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
          <WebdesignSchleswigHolsteinPage />
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

  it("renders several primary CTA buttons, none of them a fake anchor or a form", () => {
    const ctas = container.querySelectorAll("button[data-project-check-cta]");
    expect(ctas.length).toBeGreaterThanOrEqual(3);
    for (const cta of ctas) expect(cta.getAttribute("type")).toBe("button");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('a[href="#kontakt"]')).toBeNull();
    expect(container.querySelector('a[href^="mailto:"][href*="subject"]')).toBeNull();
  });

  it("dispatches tigerflow:open-project-check with the clicked element as detail.trigger", () => {
    const received = [];
    const listener = (event) => received.push(event.detail?.trigger);
    window.addEventListener("tigerflow:open-project-check", listener);

    const ctas = [...container.querySelectorAll("button[data-project-check-cta]")];
    expect(ctas.length).toBeGreaterThanOrEqual(3);
    for (const cta of ctas) click(cta);
    window.removeEventListener("tigerflow:open-project-check", listener);

    expect(received).toHaveLength(ctas.length);
    ctas.forEach((cta, index) => expect(received[index]).toBe(cta));
  });

  it("opens the real project check, closes on Escape and restores focus to the trigger", () => {
    const hero = container.querySelector(".wsh-hero button[data-project-check-cta]");
    expect(hero).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    hero.focus();
    click(hero);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain("Schritt 1 von 4");

    pressEscape();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(hero);
  });

  it("restores focus to the closing CTA as well", () => {
    const closing = container.querySelector("#projektanfrage button[data-project-check-cta]");
    expect(closing).not.toBeNull();
    closing.focus();
    click(closing);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    pressEscape();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(closing);
  });

  it("does not send any network request by opening or closing the project check", () => {
    click(container.querySelector("button[data-project-check-cta]"));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    pressEscape();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows no success message without a real submission", () => {
    click(container.querySelector("button[data-project-check-cta]"));
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).not.toMatch(/Vielen Dank|erfolgreich|gesendet|übermittelt/i);
  });

  it("keeps every FAQ native and closed after mount", () => {
    const details = [...container.querySelectorAll("#faq details")];
    expect(details).toHaveLength(10);
    for (const entry of details) expect(entry.open).toBe(false);
  });
});
