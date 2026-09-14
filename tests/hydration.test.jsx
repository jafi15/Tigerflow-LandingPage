import { afterEach, describe, expect, it, vi } from "vitest";
import { StrictMode } from "react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import App from "../src/App.jsx";
import { ROUTES } from "../src/routes.config.js";

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installDom(pathname, serverHtml) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="root">${serverHtml}</div></body></html>`, {
    url: `https://tigerflow.de${pathname}`,
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
  vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => {});

  dom.window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });

  return dom;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("React hydration of prerendered routes", () => {
  for (const route of ROUTES) {
    it(`${route.path} hydrates without recoverable errors or hydration warnings`, async () => {
      const serverHtml = renderToString(<App pathname={route.path} />);
      const dom = installDom(route.path, serverHtml);
      const consoleErrors = [];
      const recoverableErrors = [];
      const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(" "));
      });

      let root;
      await act(async () => {
        root = hydrateRoot(
          dom.window.document.getElementById("root"),
          <StrictMode>
            <App pathname={route.path} />
          </StrictMode>,
          {
            onRecoverableError(error) {
              recoverableErrors.push(error);
            },
          }
        );
        await Promise.resolve();
      });

      const hydrationMessages = consoleErrors.filter((message) =>
        /hydrat|server rendered|did not match/i.test(message)
      );
      expect(recoverableErrors).toEqual([]);
      expect(hydrationMessages).toEqual([]);
      expect(dom.window.document.querySelectorAll("#root h1")).toHaveLength(1);

      await act(async () => root.unmount());
      errorSpy.mockRestore();
      dom.window.close();
    });
  }
});
