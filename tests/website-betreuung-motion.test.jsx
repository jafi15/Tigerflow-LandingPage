import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { WebsiteBetreuungPage } from "../src/components/WebsiteBetreuungPage.jsx";

// Captures every observer so a test can report elements as intersecting.
const observers = [];
class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.targets = new Set();
    this.disconnected = false;
    observers.push(this);
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.targets.clear(); this.disconnected = true; }
}

function installDom({ reducedMotion = false, observer = true } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/website-betreuung",
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
  if (observer) {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    dom.window.IntersectionObserver = FakeIntersectionObserver;
  } else {
    delete dom.window.IntersectionObserver;
  }
  dom.window.matchMedia = (query) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  // Everything sits below the fold.
  dom.window.Element.prototype.getBoundingClientRect = function () {
    return { top: 2000, left: 0, width: 300, height: 200, right: 300, bottom: 2200, x: 0, y: 2000 };
  };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

describe("/website-betreuung scroll reveal", () => {
  let dom;
  let root;
  let container;

  function mount(options) {
    observers.length = 0;
    dom = installDom(options);
    container = document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(<WebsiteBetreuungPage />);
    });
  }

  afterEach(() => {
    if (root) act(() => root.unmount());
    root = null;
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  describe("with motion allowed", () => {
    beforeEach(() => mount());

    it("hides below-the-fold items only once the observer path is confirmed", () => {
      const pending = container.querySelectorAll(".wb-reveal-pending");
      expect(pending.length).toBeGreaterThan(5);
      const observer = observers.find((o) => o.targets.size > 0);
      for (const item of pending) expect(observer.targets.has(item)).toBe(true);
    });

    it("reveals each item exactly once and stops observing it", () => {
      const item = container.querySelector(".wb-reveal-pending");
      const observer = observers.find((o) => o.targets.has(item));
      act(() => observer.callback([{ target: item, isIntersecting: true }]));
      expect(item.classList.contains("wb-reveal-pending")).toBe(false);
      expect(observer.targets.has(item)).toBe(false);
      act(() => observer.callback([{ target: item, isIntersecting: true }]));
      expect(item.classList.contains("wb-reveal-pending")).toBe(false);
    });

    it("disconnects the observer on unmount", () => {
      const observer = observers.find((o) => o.targets.size > 0);
      act(() => root.unmount());
      root = null;
      expect(observer.disconnected).toBe(true);
    });
  });

  describe("with reduced motion", () => {
    beforeEach(() => mount({ reducedMotion: true }));

    it("hides nothing", () => {
      expect(container.querySelector(".wb-reveal-pending")).toBeNull();
    });
  });

  describe("without IntersectionObserver", () => {
    beforeEach(() => mount({ observer: false }));

    it("hides nothing", () => {
      expect(container.querySelector(".wb-reveal-pending")).toBeNull();
    });
  });
});
