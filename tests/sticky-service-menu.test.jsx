import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import App from "../src/App.jsx";
import { StickyNav } from "../src/components/StickyNav.jsx";
import { ServiceMegaMenu } from "../src/components/ServiceMegaMenu.jsx";
import { ROUTES } from "../src/routes.config.js";
import { preloadRoutePage } from "../src/routePages.js";

// The service menu ("Leistungen") must stay reachable after scrolling on every real page, inside
// exactly one visible bar:
// - five pages have their own section bar: it keeps its section links and gains the service menu;
// - the other pages with a static header get the shared StickyNav;
// - the homepage and the legal/404 pages keep their fixed shared navbar (no extra bar).
const LOCAL_BAR_ROUTES = {
  "/seo-heide": "sh-topbar",
  "/seo-schleswig-holstein": "ssh-bar",
  "/preise": "pr-topbar",
  "/seo-betreuung": "sb-bar",
  "/webdesign-schleswig-holstein": "wsh-bar",
};
const SHARED_BAR_ROUTES = ROUTES.map((r) => r.path).filter(
  (path) => !["/", "/impressum", "/datenschutz", "/agb"].includes(path) && !LOCAL_BAR_ROUTES[path]
);
const SHARED_PAGE_LINKS = {
  "/webdesign-heide": [["#ablauf", "Ablauf"], ["#preis", "Preis"], ["#faq", "FAQ"]],
  "/webdesign-dithmarschen": [["#situationen", "Unternehmen"], ["#preis", "Preis"], ["#faq", "FAQ"]],
  "/website-betreuung": [["#pruefroutine", "Prüfroutine"], ["#pakete", "Pakete"], ["#faq", "FAQ"]],
  "/ueber-uns": [["/ueber-uns", "Über uns"], ["#arbeitsweise", "Arbeitsweise"]],
};
const LEGAL_ROUTES = ["/impressum", "/datenschutz", "/agb"];
const PAGE_CSS = {
  "/seo-heide": "SeoHeidePage.css",
  "/seo-schleswig-holstein": "SeoSchleswigHolsteinPage.css",
  "/preise": "PreisePage.css",
  "/seo-betreuung": "SeoBetreuungPage.css",
  "/webdesign-schleswig-holstein": "WebdesignSchleswigHolsteinPage.css",
};

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installDom(pathname) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
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
  vi.stubGlobal("CustomEvent", dom.window.CustomEvent);
  vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
  vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
  dom.window.IntersectionObserver = NoopIntersectionObserver;
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => {});
  dom.window.matchMedia = () => ({
    matches: false,
    media: "",
    addEventListener() {},
    removeEventListener() {},
  });
  dom.window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  dom.window.HTMLMediaElement.prototype.pause = () => {};
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

function scrollTo(y) {
  document.documentElement.scrollTop = y;
  act(() => window.dispatchEvent(new window.Event("scroll")));
}

describe("service menu stays reachable while scrolling", () => {
  let dom;
  let root;
  let container;

  async function mount(pathname) {
    await preloadRoutePage(pathname);
    dom = installDom(pathname);
    container = document.getElementById("root");
    root = createRoot(container);
    await act(async () => {
      root.render(<App pathname={pathname} />);
      await Promise.resolve();
    });
  }

  afterEach(() => {
    if (root) act(() => root.unmount());
    if (dom) dom.window.close();
    vi.unstubAllGlobals();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    root = undefined;
    dom = undefined;
  });

  describe("StickyNav", () => {
    beforeEach(() => {
      dom = installDom("/");
      container = document.getElementById("root");
      root = createRoot(container);
    });

    it("keeps the homepage threshold by default and accepts a smaller one for pages with their own header", () => {
      act(() => root.render(<StickyNav />));
      scrollTo(120);
      expect(container.querySelector(".tf-sticky-bar")).toBeNull();
      scrollTo(500);
      expect(container.querySelector(".tf-sticky-bar")).not.toBeNull();
      act(() => root.render(<StickyNav threshold={80} />));
      scrollTo(120);
      expect(container.querySelector(".tf-sticky-bar")).not.toBeNull();
      scrollTo(40);
    });

    it("offers the existing ServiceMegaMenu on desktop and mobile and hands it the current path", () => {
      act(() => root.render(<StickyNav threshold={80} currentPath="/ueber-uns" />));
      scrollTo(200);
      const menus = container.querySelectorAll(".tf-sticky-bar details.tf-service-menu");
      expect(menus).toHaveLength(2);
      for (const menu of menus) {
        expect(menu.querySelector("summary").textContent).toContain("Leistungen");
        expect(menu.querySelector('a[href="/ueber-uns"]').getAttribute("aria-current")).toBe("page");
        expect(menu.querySelector('a[href="/webdesign-heide"]').hasAttribute("aria-current")).toBe(false);
      }
      expect(container.querySelector(".tf-sticky-bar .hide-mobile .tf-service-menu")).not.toBeNull();
      expect(container.querySelector(".tf-sticky-bar .tf-sticky-mobile-menu")).not.toBeNull();
    });

    it("links the ROI calculator to the homepage from other pages and keeps the local hash on the homepage", () => {
      act(() => root.render(<StickyNav threshold={80} currentPath="/preise" />));
      scrollTo(200);
      expect(container.querySelector(".tf-sticky-bar a[href='/#rechner']")).not.toBeNull();
      expect(container.querySelector(".tf-sticky-bar a[href='#rechner']")).toBeNull();
      act(() => root.render(<StickyNav currentPath="/" />));
      scrollTo(600);
      expect(container.querySelector(".tf-sticky-bar a[href='#rechner']")).not.toBeNull();
    });

    it("is not a banner landmark", () => {
      act(() => root.render(<StickyNav threshold={80} currentPath="/preise" />));
      scrollTo(200);
      const bar = container.querySelector(".tf-sticky-bar");
      expect(bar.tagName).not.toBe("HEADER");
      expect(bar.closest("header")).toBeNull();
      expect(bar.getAttribute("role")).toBeNull();
    });

    it("closes the menu with Escape and after activating a link", () => {
      act(() => root.render(<StickyNav threshold={80} currentPath="/preise" />));
      scrollTo(200);
      const menu = container.querySelector(".tf-sticky-bar details.tf-service-menu");
      menu.open = true;
      act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
      expect(menu.open).toBe(false);
      menu.open = true;
      container.addEventListener("click", (event) => event.preventDefault());
      const link = menu.querySelector('a[href="/seo-heide"]');
      act(() => link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })));
      expect(menu.open).toBe(false);
    });
  });

  describe("several menus on one page", () => {
    it("Escape only closes and re-focuses the menu that is open (no focus jump to another menu)", () => {
      dom = installDom("/");
      container = document.getElementById("root");
      root = createRoot(container);
      act(() => root.render(<><ServiceMegaMenu currentPath="/preise" /><ServiceMegaMenu className="tf-service-menu-bar" currentPath="/preise" /></>));
      const [first, second] = container.querySelectorAll("details.tf-service-menu");
      first.open = true;
      act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
      expect(first.open).toBe(false);
      expect(document.activeElement).toBe(first.querySelector("summary"));
      // A menu that was not open is left alone.
      document.activeElement.blur();
      act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
      expect(document.activeElement).not.toBe(second.querySelector("summary"));
    });
  });

  describe("pages with the shared sticky bar", () => {
    for (const path of SHARED_BAR_ROUTES) {
      it(`${path}: gets exactly one sticky bar with the service menu after leaving its header`, async () => {
        await mount(path);
        expect(container.querySelector(".tf-sticky-bar")).toBeNull();
        scrollTo(30);
        expect(container.querySelector(".tf-sticky-bar")).toBeNull();
        scrollTo(160);
        expect(container.querySelectorAll(".tf-sticky-bar")).toHaveLength(1);
        const menus = container.querySelectorAll(".tf-sticky-bar details.tf-service-menu");
        expect(menus).toHaveLength(2);
        for (const menu of menus) {
          expect(menu.querySelector("summary").textContent).toContain("Leistungen");
          expect(menu.querySelector(`a[href="${path}"]`)?.getAttribute("aria-current")).toBe("page");
        }
        const bar = container.querySelector(".tf-sticky-bar");
        // The replacement bar also preserves this page header's own navigation path.
        const pageNav = bar.querySelector('nav[aria-label="Seitennavigation"]');
        expect(pageNav).not.toBeNull();
        const actualPageLinks = [...pageNav.querySelectorAll("a")].map((link) => [link.getAttribute("href"), link.textContent.trim()]);
        expect(actualPageLinks).toEqual(SHARED_PAGE_LINKS[path]);
        expect(bar.querySelector("header, [role='banner']")).toBeNull();
        expect(bar.closest("header")).toBeNull();
        scrollTo(5000);
        expect(container.querySelectorAll(".tf-sticky-bar")).toHaveLength(1);
      });

      it(`${path}: renders the shared bar before <main>`, async () => {
        await mount(path);
        scrollTo(160);
        const bar = container.querySelector(".tf-sticky-bar");
        const main = container.querySelector("main");
        expect(bar.compareDocumentPosition(main) & window.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      });
    }
  });

  describe("pages with their own section bar", () => {
    const visibleBars = (bar) =>
      [...container.querySelectorAll(`.${bar}, .tf-sticky-bar, .tf-global-navbar`)].filter(
        (el) => !el.hasAttribute("inert") && (!el.classList.contains(bar) || el.classList.contains("is-visible"))
      );

    for (const [path, bar] of Object.entries(LOCAL_BAR_ROUTES)) {
      it(`${path}: the same single bar keeps its section links and offers the service menu`, async () => {
        await mount(path);
        const local = container.querySelector(`.${bar}`);
        expect(local).not.toBeNull();
        expect(local.classList.contains("is-visible")).toBe(false);
        scrollTo(30);
        expect(local.classList.contains("is-visible")).toBe(false);
        scrollTo(160);
        // Never a second bar: the shared StickyNav is not rendered on these routes.
        expect(container.querySelector(".tf-sticky-bar")).toBeNull();
        expect(local.classList.contains("is-visible")).toBe(true);
        expect(local.hasAttribute("inert")).toBe(false);
        expect(visibleBars(bar)).toHaveLength(1);
        // The floating chrome stays before main in keyboard order and never creates a second banner.
        const main = container.querySelector("main");
        expect(local.compareDocumentPosition(main) & window.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(local.tagName).not.toBe("HEADER");
        expect(local.closest("header")).toBeNull();
        expect(local.getAttribute("role")).not.toBe("banner");
        // Section links stay.
        const links = local.querySelectorAll('nav[aria-label="Abschnitte"] a[href^="#"]');
        expect(links.length).toBeGreaterThanOrEqual(3);
        // Exactly one service menu, with the current page marked.
        const menus = local.querySelectorAll("details.tf-service-menu");
        expect(menus).toHaveLength(1);
        expect(menus[0].querySelector("summary").textContent).toContain("Leistungen");
        expect(menus[0].querySelector(`a[href="${path}"]`).getAttribute("aria-current")).toBe("page");
        expect(menus[0].querySelectorAll("a[aria-current='page']")).toHaveLength(1);
        // The Projekt-Check trigger of the bar is kept.
        expect(local.textContent).toContain("Projekt-Check");
        scrollTo(5000);
        expect(visibleBars(bar)).toHaveLength(1);
      });

      it(`${path}: the menu closes with Escape (focus returns) and after activating a link`, async () => {
        await mount(path);
        scrollTo(160);
        const menu = container.querySelector(`.${bar} details.tf-service-menu`);
        menu.open = true;
        act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
        expect(menu.open).toBe(false);
        expect(document.activeElement).toBe(menu.querySelector("summary"));
        menu.open = true;
        container.addEventListener("click", (event) => event.preventDefault());
        const link = menu.querySelector('a[href="/webdesign-heide"]');
        act(() => link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })));
        expect(menu.open).toBe(false);
      });

      it(`${path}: the bar and its section navigation stay available on mobile`, () => {
        const css = readFileSync(`src/components/${PAGE_CSS[path]}`, "utf8");
        const menuCss = readFileSync("src/components/ServiceMegaMenu.css", "utf8");
        expect(css).not.toMatch(new RegExp(`\\.${bar}\\s*\\{\\s*display:\\s*none`));
        expect(menuCss).not.toMatch(/\.tf-service-menu-bar\s*~\s*nav\s*,\s*\.tf-service-menu-bar\s*~\s*button\s*\{\s*display:\s*none/);
        expect(menuCss).toMatch(/\.tf-service-menu-bar\s*~\s*nav\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
      });
    }

    it("has no global rule that hides page-local bars", () => {
      expect(readFileSync("src/index.css", "utf8")).not.toContain("data-tf-sticky");
    });
  });

  describe("homepage and legal pages", () => {
    it("/: keeps the existing single sticky bar and its 400px threshold", async () => {
      await mount("/");
      scrollTo(200);
      expect(container.querySelector(".tf-sticky-bar")).toBeNull();
      scrollTo(600);
      expect(container.querySelectorAll(".tf-sticky-bar")).toHaveLength(1);
    });

    for (const path of LEGAL_ROUTES) {
      it(`${path}: keeps using the fixed shared navbar without a second bar`, async () => {
        await mount(path);
        scrollTo(900);
        expect(container.querySelector(".tf-sticky-bar")).toBeNull();
        expect(container.querySelector("nav.tf-global-navbar details.tf-service-menu")).not.toBeNull();
      });
    }
  });
});
