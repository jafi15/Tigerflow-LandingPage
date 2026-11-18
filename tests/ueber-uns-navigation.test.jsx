import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { StickyNav } from "../src/components/StickyNav.jsx";
import { ServiceMegaMenu } from "../src/components/ServiceMegaMenu.jsx";

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
  vi.stubGlobal("CustomEvent", dom.window.CustomEvent);
  vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

describe("/ueber-uns links in interactive navigation", () => {
  let dom;
  let root;
  let container;

  beforeEach(() => {
    dom = installDom();
    container = document.getElementById("root");
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("shows a real 'Über uns' link in the sticky navigation once it appears", () => {
    act(() => root.render(<StickyNav />));
    expect(container.querySelector('a[href="/ueber-uns"]')).toBeNull();
    document.documentElement.scrollTop = 600;
    act(() => window.dispatchEvent(new window.Event("scroll")));
    const links = [...container.querySelectorAll('a[href="/ueber-uns"]')];
    expect(links.some((a) => a.textContent.trim() === "Über uns")).toBe(true);
  });

  it("closes the service menu when the 'Über TigerFlow' link is activated", () => {
    act(() => root.render(<ServiceMegaMenu />));
    const menu = container.querySelector("details");
    menu.open = true;
    const link = container.querySelector('a[href="/ueber-uns"]');
    expect(link.textContent.trim()).toBe("Über TigerFlow");
    container.addEventListener("click", (event) => event.preventDefault());
    act(() => link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })));
    expect(menu.open).toBe(false);
  });

  it("marks the link as current page inside the about page menu", () => {
    act(() => root.render(<ServiceMegaMenu currentPath="/ueber-uns" />));
    expect(container.querySelector('a[href="/ueber-uns"]').getAttribute("aria-current")).toBe("page");
  });
});
