import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { useTyped } from "../src/hooks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must stay byte-for-byte identical to Hero.jsx's TYPED_WORDS. A test below
// cross-checks this against the Hero.jsx source so the two can't drift.
const WORDS = [
  "Systeme, die jagen.",
  "Systeme, die qualifizieren.",
  "Systeme, die skalieren.",
  "Systeme, die schneller verkaufen.",
];

function Harness() {
  const { display, done } = useTyped(WORDS);
  return <span data-display={display} data-done={done ? "true" : "false"} />;
}

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
  return dom;
}

describe("Hero typing animation keeps its original visible behavior", () => {
  let dom;
  let container;
  let root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    dom = installDom();
    container = dom.window.document.getElementById("root");
    act(() => {
      root = createRoot(container);
      root.render(<Harness />);
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function state() {
    const el = container.querySelector("span");
    return { display: el.getAttribute("data-display"), done: el.getAttribute("data-done") === "true" };
  }

  async function tick(ms) {
    await act(async () => {
      vi.advanceTimersByTime(ms);
    });
  }

  it("uses the four original sentences, unchanged and in the original order, in Hero.jsx", () => {
    const heroSource = readFileSync(path.join(__dirname, "..", "src", "components", "Hero.jsx"), "utf8");
    let cursor = -1;
    for (const word of WORDS) {
      const idx = heroSource.indexOf(`"${word}"`, cursor + 1);
      expect(idx).toBeGreaterThan(cursor);
      cursor = idx;
    }
  });

  it("starts with an empty string and not done", () => {
    expect(state()).toEqual({ display: "", done: false });
  });

  it("types, holds, and deletes each word in order, then leaves the final sentence on screen", async () => {
    for (let wi = 0; wi < WORDS.length; wi++) {
      const word = WORDS[wi];
      const isLast = wi === WORDS.length - 1;

      for (let i = 1; i <= word.length; i++) {
        await tick(46);
        expect(state().display).toBe(word.slice(0, i));
      }

      if (isLast) {
        await tick(50); // covers an async setTimeout(0)-style "done" transition
        expect(state()).toEqual({ display: word, done: true });
        break;
      }

      expect(state().done).toBe(false);

      // holds the fully typed word before deleting (2400ms)
      await tick(2000);
      expect(state().display).toBe(word);
      await tick(400);

      for (let i = word.length - 1; i >= 0; i--) {
        await tick(26);
        expect(state().display).toBe(word.slice(0, i));
      }
      expect(state().display).toBe("");

      // pause before the next word begins typing (300ms)
      await tick(300);
    }

    // the final sentence stays displayed and the animation has stopped for good
    await tick(5000);
    expect(state()).toEqual({ display: WORDS[WORDS.length - 1], done: true });
  });
});
