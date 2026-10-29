import { describe, it, expect, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { DIST_DIR } from "../scripts/serve-dist.mjs";
import { ROUTES } from "../src/routes.config.js";
import { NOT_FOUND_PAGE, ROUTE_PAGES } from "../src/routePages.js";

// Each code-split page, the CSS class prefix only it uses, and its prerendered file.
const MONEY_PAGES = [
  { path: "/webdesign-heide", chunk: "WebdesignHeidePage", prefix: "wdh-", file: "webdesign-heide.html" },
  { path: "/webdesign-dithmarschen", chunk: "WebdesignDithmarschenPage", prefix: "wdd-", file: "webdesign-dithmarschen.html" },
  { path: "/webdesign-schleswig-holstein", chunk: "WebdesignSchleswigHolsteinPage", prefix: "wsh-", file: "webdesign-schleswig-holstein.html" },
  { path: "/seo-heide", chunk: "SeoHeidePage", prefix: "sh-", file: "seo-heide.html" },
  { path: "/preise", chunk: "PreisePage", prefix: "pr-", file: "preise.html" },
];

const html = (file) => readFileSync(path.join(DIST_DIR, file), "utf8");
const doc = (file) => new JSDOM(html(file)).window.document;
const asset = (href) => readFileSync(path.join(DIST_DIR, href.replace(/^\//, "")), "utf8");

function headAssets(file) {
  const d = doc(file);
  return {
    entry: d.querySelector('script[type="module"]')?.getAttribute("src"),
    stylesheets: [...d.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href")),
    preloads: [...d.querySelectorAll('link[rel="modulepreload"]')].map((l) => l.getAttribute("href")),
  };
}

describe("route registry", () => {
  it("code-splits every route except the homepage", () => {
    const splitPaths = ROUTES.map((r) => r.path).filter((p) => p !== "/");
    expect(Object.keys(ROUTE_PAGES).sort()).toEqual(splitPaths.sort());
  });

  it("points every entry at an existing page module", () => {
    for (const { source } of [...Object.values(ROUTE_PAGES), NOT_FOUND_PAGE]) {
      expect(existsSync(path.resolve(DIST_DIR, "..", source)), source).toBe(true);
    }
  });

  it("refuses to render a split route before its chunk is preloaded", async () => {
    vi.resetModules();
    const fresh = await import("../src/routePages.js");
    expect(() => fresh.renderRoutePage("/agb")).toThrow(/preloaded/);
    await fresh.preloadRoutePage("/agb");
    expect(fresh.renderRoutePage("/agb")).toBeTruthy();
    expect(fresh.renderRoutePage("/")).toBeNull();
  });

  it("renders unknown paths with the 404 page chunk", async () => {
    vi.resetModules();
    const fresh = await import("../src/routePages.js");
    await fresh.preloadRoutePage("/gibt-es-nicht");
    expect(fresh.renderRoutePage("/gibt-es-nicht")).toBeTruthy();
  });
});

describe("initial homepage bundle", () => {
  const home = headAssets("index.html");

  it("loads no code-split page chunk on the homepage", () => {
    expect(home.preloads).toEqual([]);
    expect(home.stylesheets).toHaveLength(1);
  });

  for (const page of MONEY_PAGES) {
    it(`does not contain the ${page.chunk} code or styles`, () => {
      expect(asset(home.entry)).not.toContain(`${page.prefix}page`);
      expect(asset(home.stylesheets[0])).not.toContain(`.${page.prefix}page`);
    });
  }
});

describe("prerendered money pages", () => {
  for (const page of MONEY_PAGES) {
    describe(page.path, () => {
      const assets = headAssets(page.file);

      it("links only its own page CSS, so the HTML is styled before any JS runs", () => {
        const pageCss = assets.stylesheets.filter((href) => !href.includes("/index-"));
        expect(pageCss).toHaveLength(1);
        expect(pageCss[0]).toContain(page.chunk);
        expect(asset(pageCss[0])).toContain(`.${page.prefix}page`);
      });

      it("modulepreloads its own chunk and no other page's chunk", () => {
        expect(assets.preloads.some((href) => href.includes(page.chunk))).toBe(true);
        for (const other of MONEY_PAGES.filter((p) => p !== page)) {
          expect(assets.preloads.join(" ")).not.toContain(other.chunk);
          expect(assets.stylesheets.join(" ")).not.toContain(other.chunk);
        }
      });

      it("still ships complete, indexable initial HTML", () => {
        const d = doc(page.file);
        expect(d.querySelector(`#root .${page.prefix}page`)).not.toBeNull();
        expect(d.querySelectorAll("#root h1")).toHaveLength(1);
        expect(d.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
          `https://tigerflow.de${page.path}`
        );
        expect(d.querySelector('meta[name="description"]')?.getAttribute("content")).toBeTruthy();
      });
    });
  }
});

describe("build output", () => {
  it("does not deploy the Vite manifest", () => {
    expect(existsSync(path.join(DIST_DIR, ".vite"))).toBe(false);
  });

  it("every referenced asset exists", () => {
    for (const file of ["index.html", "404.html", ...ROUTES.map((r) => r.outFile)]) {
      const { entry, stylesheets, preloads } = headAssets(file);
      for (const href of [entry, ...stylesheets, ...preloads]) {
        expect(existsSync(path.join(DIST_DIR, href.replace(/^\//, ""))), `${file}: ${href}`).toBe(true);
      }
    }
  });
});
