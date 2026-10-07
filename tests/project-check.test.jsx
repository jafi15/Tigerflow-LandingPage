import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { ProjectCheck } from "../src/components/ProjectCheck.jsx";

const projectCheckCss = readFileSync(
  new URL("../src/components/ProjectCheck.css", import.meta.url),
  "utf8"
);

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/",
    pretendToBeVisual: true,
  });
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("Element", dom.window.Element);
  vi.stubGlobal("Node", dom.window.Node);
  vi.stubGlobal("SVGElement", dom.window.SVGElement);
  vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

function click(element) {
  act(() => element.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

describe("TigerFlow project check", () => {
  let dom;
  let root;
  let container;

  beforeEach(() => {
    dom = installDom();
    container = document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(<ProjectCheck />);
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("renders the primary CTA as a branded system control", () => {
    const trigger = container.querySelector(".project-check-trigger");
    const signal = trigger.querySelector(".project-check-trigger-system");

    expect(signal).not.toBeNull();
    expect(signal.getAttribute("aria-hidden")).toBe("true");
    expect(signal.querySelectorAll("i")).toHaveLength(3);
    expect(trigger.querySelector(".project-check-trigger-arrow")).not.toBeNull();
  });

  it("opens a four-step, non-scoring project check from the primary CTA", () => {
    const trigger = container.querySelector("button");
    expect(trigger.textContent).toContain("Projekt-Check starten");
    expect(container.textContent).toContain("In 2 Minuten zum passenden Einstieg");
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    click(trigger);

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain("Schritt 1 von 4");
    expect(dialog.textContent).toContain("Was soll verbessert werden?");
    expect(dialog.textContent).not.toMatch(/Score|Punkte|garantiert/i);
  });

  it("recommends the Webdesign entry after the website path and prepares a transparent inquiry", () => {
    click(container.querySelector("button"));

    for (const label of [
      "Website neu aufbauen oder modernisieren",
      "Eine bestehende Website",
      "Angebot klarer präsentieren",
      "In 1–3 Monaten",
    ]) {
      const option = [...document.querySelectorAll(".project-check-option")].find((button) =>
        button.textContent.includes(label)
      );
      expect(option).not.toBeUndefined();
      click(option);
    }

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain("Empfohlener Einstieg");
    expect(dialog.textContent).toContain("Website mit technischer SEO-Basis");
    expect(dialog.querySelector('a[href="/webdesign-heide"]')?.textContent).toContain(
      "Webdesign in Heide ansehen"
    );
    const inquiry = dialog.querySelector('a[href^="mailto:service@tigerflow.de"]');
    expect(inquiry).not.toBeNull();
    expect(decodeURIComponent(inquiry.getAttribute("href"))).toContain(
      "Website neu aufbauen oder modernisieren"
    );
  });

  it("closes with Escape", () => {
    const trigger = container.querySelector("button");
    click(trigger);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    act(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("traps keyboard focus inside the modal dialog", () => {
    click(container.querySelector("button"));
    const dialog = document.querySelector('[role="dialog"]');
    const closeButton = dialog.querySelector('[aria-label="Projekt-Check schließen"]');
    const options = dialog.querySelectorAll(".project-check-option");
    const lastOption = options[options.length - 1];

    expect(document.activeElement).toBe(closeButton);
    act(() => {
      lastOption.focus();
      window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(document.activeElement).toBe(closeButton);

    act(() => {
      closeButton.focus();
      window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true }));
    });
    expect(document.activeElement).toBe(lastOption);
  });

  it("fits narrow mobile viewports and uses readable text contrast", () => {
    expect(projectCheckCss).toMatch(/\.project-check-trigger\s*\{[\s\S]*max-width:\s*100%/);
    expect(projectCheckCss).toMatch(
      /@media\(max-width:360px\)[\s\S]*\.project-check-trigger-system\s*\{\s*display:\s*none/
    );
    expect(projectCheckCss).not.toMatch(/color:\s*#(?:555|4E4E4E|737373|686868|777)\b/i);
    expect(projectCheckCss).toMatch(
      /\.project-check-inquiry\s*\{[\s\S]*background:\s*#FF7A00;[\s\S]*color:\s*#111111;/
    );
    expect(projectCheckCss).toMatch(
      /\.project-check-option:focus-visible\s*\{[\s\S]*outline:\s*2px solid #FF9B42;/
    );
  });
});
