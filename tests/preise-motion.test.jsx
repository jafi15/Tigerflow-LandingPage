import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { PreisePage } from "../src/components/PreisePage.jsx";

// Captures every observer so a test can report elements as intersecting.
const observers = [];
class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.targets = new Set();
    observers.push(this);
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.targets.clear(); }
}

function installDom({ reducedMotion = false, finePointer = true } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/preise",
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
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  dom.window.IntersectionObserver = FakeIntersectionObserver;
  vi.stubGlobal("requestAnimationFrame", (cb) => { cb(); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
  dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
  dom.window.matchMedia = (query) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : query.includes("hover") ? finePointer : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  // Everything sits below the fold, 300 x 200 px, so reveals and pointer maths are testable.
  dom.window.Element.prototype.getBoundingClientRect = function () {
    return { top: 2000, left: 100, width: 300, height: 200, right: 400, bottom: 2200, x: 100, y: 2000 };
  };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

function pointerMove(target, clientX, clientY) {
  act(() => {
    const event = new window.MouseEvent("pointermove", { bubbles: true, clientX, clientY });
    target.dispatchEvent(event);
  });
}

describe("/preise motion and glass hover", () => {
  let dom;
  let root;
  let container;

  function mount(options) {
    observers.length = 0;
    dom = installDom(options);
    container = document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(<PreisePage />);
    });
  }

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  describe("with a fine pointer and motion allowed", () => {
    beforeEach(() => mount());

    it("marks every card surface as glass-capable with a decorative sheen layer", () => {
      const cards = container.querySelectorAll(".pr-card, .pr-group, .pr-plan, .pr-seo-step");
      expect(cards.length).toBeGreaterThan(20);
      for (const card of cards) {
        expect(card.hasAttribute("data-pr-glass"), card.className).toBe(true);
        const sheen = card.querySelector(":scope > .pr-sheen");
        expect(sheen, card.className).not.toBeNull();
        expect(sheen.getAttribute("aria-hidden")).toBe("true");
        expect(sheen.textContent).toBe("");
      }
    });

    it("lets the glass light follow the pointer inside the hovered card", () => {
      const card = container.querySelector(".pr-addon");
      pointerMove(card.querySelector("h3"), 175, 2050);
      expect(card.style.getPropertyValue("--pr-mx")).toBe("75px");
      expect(card.style.getPropertyValue("--pr-my")).toBe("50px");
    });

    it("tilts the hero visual gently towards the pointer", () => {
      const hero = container.querySelector(".pr-hero");
      pointerMove(hero, 400, 2200);
      const visual = container.querySelector(".pr-visual");
      expect(Number(visual.style.getPropertyValue("--pr-px"))).toBeCloseTo(1, 5);
      expect(Number(visual.style.getPropertyValue("--pr-py"))).toBeCloseTo(1, 5);
    });

    it("pops cards in once they scroll into view and keeps intros on the calm rise", () => {
      const pop = container.querySelector('[data-pr-reveal="pop"]');
      const intro = container.querySelector(".pr-intro[data-pr-reveal]");
      expect(pop).not.toBeNull();
      expect(intro.getAttribute("data-pr-reveal")).not.toBe("pop");
      expect(pop.classList.contains("pr-reveal-pending")).toBe(true);

      const observer = observers.find((o) => o.targets.has(pop));
      act(() => observer.callback([{ target: pop, isIntersecting: true }]));
      expect(pop.classList.contains("pr-reveal-pending")).toBe(false);
      expect(pop.classList.contains("pr-revealed")).toBe(true);
    });
  });

  describe("with reduced motion", () => {
    beforeEach(() => mount({ reducedMotion: true }));

    it("hides nothing, pops nothing and does not track the pointer", () => {
      expect(container.querySelector(".pr-reveal-pending")).toBeNull();
      const card = container.querySelector(".pr-addon");
      pointerMove(card, 175, 2050);
      expect(card.style.getPropertyValue("--pr-mx")).toBe("");
      pointerMove(container.querySelector(".pr-hero"), 400, 2200);
      expect(container.querySelector(".pr-visual").style.getPropertyValue("--pr-px")).toBe("");
    });
  });

  describe("on touch devices", () => {
    beforeEach(() => mount({ finePointer: false }));

    it("does not track the pointer", () => {
      const card = container.querySelector(".pr-addon");
      pointerMove(card, 175, 2050);
      expect(card.style.getPropertyValue("--pr-mx")).toBe("");
    });
  });
});
