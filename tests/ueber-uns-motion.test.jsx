import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { UeberUnsPage } from "../src/components/UeberUnsPage.jsx";

const observers = [];
const playSpy = vi.fn(() => Promise.resolve());
const fullscreenSpy = vi.fn(() => Promise.resolve());
const pauseSpy = vi.fn();
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

function installDom({ reducedMotion = false, withObserver = true, top = 2000, finePointer = true, scrollY = 0, fullscreen = true } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/ueber-uns",
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
  if (withObserver) {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    dom.window.IntersectionObserver = FakeIntersectionObserver;
  } else {
    delete dom.window.IntersectionObserver;
    vi.stubGlobal("IntersectionObserver", undefined);
  }
  dom.window.matchMedia = (query) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : query.includes("hover") ? finePointer : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  dom.window.Element.prototype.getBoundingClientRect = function () {
    return { top, left: 0, width: 300, height: 200, right: 300, bottom: top + 200, x: 0, y: top };
  };
  vi.stubGlobal("requestAnimationFrame", (cb) => { cb(); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
  dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
  Object.defineProperty(dom.window, "scrollY", { value: scrollY, configurable: true });
  dom.window.HTMLMediaElement.prototype.play = playSpy;
  dom.window.HTMLMediaElement.prototype.pause = pauseSpy;
  if (fullscreen) {
    dom.window.HTMLElement.prototype.requestFullscreen = fullscreenSpy;
    Object.defineProperty(dom.window.document, "fullscreenEnabled", { value: true, configurable: true });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

describe("/ueber-uns reveal motion", () => {
  let dom;
  let root;
  let container;

  function mount(options) {
    observers.length = 0;
    dom = installDom(options);
    container = document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(<UeberUnsPage />);
    });
  }

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("marks content below the fold as pending only after JavaScript has initialised", () => {
    mount();
    const items = container.querySelectorAll("[data-au-reveal]");
    expect(items.length).toBeGreaterThan(8);
    for (const item of items) expect(item.classList.contains("au-reveal-pending")).toBe(true);
    expect(container.querySelector(".au-hero").hasAttribute("data-au-reveal")).toBe(false);
  });

  it("reveals once, releases the stagger state and stops observing", () => {
    vi.useFakeTimers();
    try {
      mount();
      const flow = container.querySelector(".au-flow");
      const observer = observers.find((o) => o.targets.has(flow));
      act(() => observer.callback([{ target: flow, isIntersecting: true }]));
      expect(flow.classList.contains("au-reveal-pending")).toBe(false);
      expect(flow.classList.contains("au-revealing")).toBe(true);
      expect(observer.targets.has(flow)).toBe(false);
      act(() => vi.advanceTimersByTime(1200));
      expect(flow.classList.contains("au-revealing")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores elements that are not intersecting yet", () => {
    mount();
    const target = container.querySelector("[data-au-reveal]");
    const observer = observers.find((o) => o.targets.has(target));
    act(() => observer.callback([{ target, isIntersecting: false }]));
    expect(target.classList.contains("au-reveal-pending")).toBe(true);
  });

  it("does not hide anything that is already in the viewport", () => {
    mount({ top: 100 });
    expect(container.querySelector(".au-reveal-pending")).toBeNull();
  });

  it("hides nothing with reduced motion", () => {
    mount({ reducedMotion: true });
    expect(container.querySelector(".au-reveal-pending")).toBeNull();
    expect(observers).toHaveLength(0);
  });

  it("hides nothing without IntersectionObserver support", () => {
    mount({ withObserver: false });
    expect(container.querySelector(".au-reveal-pending")).toBeNull();
  });

  it("disconnects the observer on unmount", () => {
    mount();
    const observer = observers[0];
    act(() => root.unmount());
    expect(observer.disconnected).toBe(true);
    root = createRoot(container);
  });

  it("keeps a permanent au-revealed marker for one-off effects after the reveal", () => {
    vi.useFakeTimers();
    try {
      mount();
      const card = container.querySelector(".au-final-card");
      const observer = observers.find((o) => o.targets.has(card));
      act(() => observer.callback([{ target: card, isIntersecting: true }]));
      act(() => vi.advanceTimersByTime(1500));
      expect(card.classList.contains("au-revealed")).toBe(true);
      expect(card.classList.contains("au-revealing")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("pointer effects (fine pointer, motion allowed)", () => {
    const move = (target, x, y) =>
      act(() => target.dispatchEvent(new window.MouseEvent("pointermove", { bubbles: true, clientX: x, clientY: y })));

    it("lets the glow follow the pointer inside a service path card (effect 14)", () => {
      mount({ top: 100 });
      const card = container.querySelector(".au-path");
      move(card.querySelector("h3"), 175, 150);
      expect(card.style.getPropertyValue("--au-mx")).toBe("175px");
      expect(card.style.getPropertyValue("--au-my")).toBe("50px");
    });

    it("tilts the hero visual towards the pointer and resets on leave (effect 2)", () => {
      mount({ top: 100 });
      move(container.querySelector(".au-hero"), 300, 300);
      const visual = container.querySelector(".au-visual");
      expect(Number(visual.style.getPropertyValue("--au-px"))).toBeCloseTo(1, 5);
      act(() => container.querySelector(".au-hero").dispatchEvent(new window.MouseEvent("pointerleave")));
      expect(visual.style.getPropertyValue("--au-px")).toBe("0");
    });

    it("does nothing on touch devices", () => {
      mount({ top: 100, finePointer: false });
      const card = container.querySelector(".au-path");
      move(card, 175, 150);
      expect(card.style.getPropertyValue("--au-mx")).toBe("");
    });

    it("does nothing with reduced motion", () => {
      mount({ top: 100, reducedMotion: true });
      const card = container.querySelector(".au-path");
      move(card, 175, 150);
      expect(card.style.getPropertyValue("--au-mx")).toBe("");
      expect(container.querySelector(".au-visual").style.getPropertyValue("--au-px")).toBe("");
    });
  });

  describe("scroll effects", () => {
    it("moves the hero glow slightly with the scroll position (effect 4)", () => {
      mount({ scrollY: 300 });
      act(() => window.dispatchEvent(new window.Event("scroll")));
      expect(container.querySelector(".au-hero-glow").style.transform).toContain("30px");
    });

    it("fills the process line with the scroll progress and marks the active step (effect 8)", () => {
      mount({ top: 334 });
      act(() => window.dispatchEvent(new window.Event("scroll")));
      const steps = container.querySelector(".au-steps");
      expect(steps.classList.contains("au-scrollspy")).toBe(true);
      expect(Number(steps.style.getPropertyValue("--au-progress"))).toBeCloseTo(0.25, 2);
      expect(steps.querySelectorAll(".au-step.au-is-active")).toHaveLength(1);
    });

    it("leaves the process line fully drawn and unmarked with reduced motion", () => {
      mount({ reducedMotion: true });
      act(() => window.dispatchEvent(new window.Event("scroll")));
      const steps = container.querySelector(".au-steps");
      expect(steps.classList.contains("au-scrollspy")).toBe(false);
      expect(steps.style.getPropertyValue("--au-progress")).toBe("");
      expect(container.querySelector(".au-hero-glow").style.transform).toBe("");
    });
  });

  describe("hero video", () => {
    beforeEach(() => { playSpy.mockClear(); pauseSpy.mockClear(); });

    it("starts muted once JavaScript runs", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      expect(video.muted).toBe(true);
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("does not autoplay with reduced motion but stays playable by button", () => {
      mount({ reducedMotion: true });
      expect(playSpy).not.toHaveBeenCalled();
      const button = container.querySelector(".au-video-toggle");
      expect(button.getAttribute("aria-label")).toBe("Video abspielen");
      act(() => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("lets the visitor pause, and offers a replay when the film has ended", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      const button = container.querySelector(".au-video-toggle");
      act(() => video.dispatchEvent(new window.Event("play")));
      expect(button.getAttribute("aria-label")).toBe("Video pausieren");
      act(() => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      expect(pauseSpy).toHaveBeenCalledTimes(1);
      act(() => video.dispatchEvent(new window.Event("ended")));
      expect(button.getAttribute("aria-label")).toBe("Video erneut abspielen");
    });

    it("stays out of the way (hidden control) until the film is actually running", () => {
      mount();
      const button = container.querySelector(".au-video-toggle");
      expect(button.classList.contains("au-video-pending")).toBe(true);
      act(() => container.querySelector(".au-visual video").dispatchEvent(new window.Event("play")));
      expect(button.classList.contains("au-video-pending")).toBe(false);
      expect(button.classList.contains("au-video-cover")).toBe(false);
    });

    it("turns the whole frame into a click target after the film has played once", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      const button = container.querySelector(".au-video-toggle");
      act(() => video.dispatchEvent(new window.Event("play")));
      act(() => video.dispatchEvent(new window.Event("pause")));
      act(() => video.dispatchEvent(new window.Event("ended")));
      expect(button.classList.contains("au-video-cover")).toBe(true);
      expect(button.querySelector(".au-video-label").textContent).toBe("Erneut ansehen");
      act(() => button.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      expect(playSpy).toHaveBeenCalledTimes(2);
    });

    it("offers the same click target when the browser blocks autoplay or with reduced motion", async () => {
      playSpy.mockImplementationOnce(() => Promise.reject(new Error("blocked")));
      mount();
      await act(async () => { await Promise.resolve(); });
      const button = container.querySelector(".au-video-toggle");
      expect(button.classList.contains("au-video-cover")).toBe(true);
      expect(button.querySelector(".au-video-label").textContent).toBe("Video abspielen");
    });

    it("starts the film with the first click anywhere when the browser blocked autoplay", async () => {
      playSpy.mockImplementationOnce(() => Promise.reject(new Error("blocked")));
      mount();
      await act(async () => { await Promise.resolve(); });
      playSpy.mockClear();
      act(() => document.body.dispatchEvent(new window.Event("pointerdown", { bubbles: true })));
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("does not start the film from a page click once the visitor decided otherwise or reduced motion is on", () => {
      mount({ reducedMotion: true });
      playSpy.mockClear();
      act(() => document.body.dispatchEvent(new window.Event("pointerdown", { bubbles: true })));
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("leaves a press on the film itself to the film controls", async () => {
      playSpy.mockImplementationOnce(() => Promise.reject(new Error("blocked")));
      mount();
      await act(async () => { await Promise.resolve(); });
      playSpy.mockClear();
      act(() => container.querySelector(".au-visual video").dispatchEvent(new window.Event("pointerdown", { bubbles: true })));
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("lets a click on the picture pause and resume", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      act(() => video.dispatchEvent(new window.Event("play")));
      act(() => video.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      expect(pauseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("hero video robustness and large view", () => {
    beforeEach(() => { playSpy.mockClear(); pauseSpy.mockClear(); fullscreenSpy.mockClear(); });
    const fullscreenButton = () => container.querySelector(".au-video-fullscreen");

    it("retries the muted start once the browser can play (slow or late-loading media)", async () => {
      playSpy.mockImplementationOnce(() => Promise.reject(new Error("not ready")));
      mount();
      await act(async () => { await Promise.resolve(); });
      act(() => container.querySelector(".au-visual video").dispatchEvent(new window.Event("canplay")));
      expect(playSpy).toHaveBeenCalledTimes(2);
    });

    it("does not force playback after the visitor paused it", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      act(() => video.dispatchEvent(new window.Event("play")));
      act(() => container.querySelector(".au-video-toggle").dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      playSpy.mockClear();
      act(() => video.dispatchEvent(new window.Event("canplay")));
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("enters full screen from a labelled button and starts the film there", () => {
      mount();
      expect(fullscreenButton().classList.contains("au-video-pending")).toBe(false);
      expect(fullscreenButton().getAttribute("aria-label")).toBe("Video im Vollbild ansehen");
      playSpy.mockClear();
      act(() => fullscreenButton().dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
      expect(fullscreenSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("gives the native controls back while in full screen and removes them afterwards", () => {
      mount();
      const video = container.querySelector(".au-visual video");
      Object.defineProperty(document, "fullscreenElement", { value: video, configurable: true });
      act(() => document.dispatchEvent(new window.Event("fullscreenchange")));
      expect(video.controls).toBe(true);
      Object.defineProperty(document, "fullscreenElement", { value: null, configurable: true });
      act(() => document.dispatchEvent(new window.Event("fullscreenchange")));
      expect(video.controls).toBe(false);
    });

    it("hides the full-screen button where the browser cannot do it", () => {
      mount({ fullscreen: false });
      expect(fullscreenButton().classList.contains("au-video-pending")).toBe(true);
    });
  });
});
