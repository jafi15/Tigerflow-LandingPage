// Route-level code splitting: every page except the homepage lives in its own
// chunk instead of the initial bundle.
//
// - Browser (src/main.jsx): loads only the chunk of the current route, then
//   hydrates – so the prerendered HTML never flashes a loading state.
// - SSR/prerender (src/entry-server.jsx): registers all pages up front, so every
//   route still renders complete, indexable HTML.
// - scripts/prerender.mjs uses `source` to look up each page's CSS and JS chunk
//   in the Vite manifest and links them in the route's prerendered HTML.

import { createElement } from "react";
import { ROUTES } from "./routes.config.js";

export const ROUTE_PAGES = {
  "/webdesign-heide": {
    source: "src/components/WebdesignHeidePage.jsx",
    load: () => import("./components/WebdesignHeidePage.jsx").then((m) => m.WebdesignHeidePage),
  },
  "/webdesign-dithmarschen": {
    source: "src/components/WebdesignDithmarschenPage.jsx",
    load: () =>
      import("./components/WebdesignDithmarschenPage.jsx").then((m) => m.WebdesignDithmarschenPage),
  },
  "/webdesign-schleswig-holstein": {
    source: "src/components/WebdesignSchleswigHolsteinPage.jsx",
    load: () =>
      import("./components/WebdesignSchleswigHolsteinPage.jsx").then(
        (m) => m.WebdesignSchleswigHolsteinPage
      ),
  },
  "/seo-heide": {
    source: "src/components/SeoHeidePage.jsx",
    load: () => import("./components/SeoHeidePage.jsx").then((m) => m.SeoHeidePage),
  },
  "/impressum": {
    source: "src/components/ImpressumPage.jsx",
    load: () => import("./components/ImpressumPage.jsx").then((m) => m.ImpressumPage),
  },
  "/datenschutz": {
    source: "src/components/DatenschutzPage.jsx",
    load: () => import("./components/DatenschutzPage.jsx").then((m) => m.DatenschutzPage),
  },
  "/agb": {
    source: "src/components/AGBPage.jsx",
    load: () => import("./components/AGBPage.jsx").then((m) => m.AGBPage),
  },
};

// Any path that is not a known route renders the 404 page.
export const NOT_FOUND_PAGE = {
  source: "src/components/NotFoundPage.jsx",
  load: () => import("./components/NotFoundPage.jsx").then((m) => m.NotFoundPage),
};

const NOT_FOUND_KEY = "*";
const KNOWN_PATHS = new Set(ROUTES.map((r) => r.path));
const resolved = new Map();

function keyFor(pathname) {
  if (pathname === "/") return null;
  if (ROUTE_PAGES[pathname]) return pathname;
  return KNOWN_PATHS.has(pathname) ? null : NOT_FOUND_KEY;
}

function entryFor(key) {
  return key === NOT_FOUND_KEY ? NOT_FOUND_PAGE : ROUTE_PAGES[key];
}

// Loads (once) the page chunk for `pathname`; resolves immediately for the homepage.
export async function preloadRoutePage(pathname) {
  const key = keyFor(pathname);
  if (key === null || resolved.has(key)) return;
  resolved.set(key, await entryFor(key).load());
}

// SSR/prerender: pages are imported statically and registered synchronously.
export function registerRoutePages(pages) {
  for (const [key, component] of Object.entries(pages)) resolved.set(key, component);
}

// Returns the rendered page element for `pathname`, or null for the homepage.
export function renderRoutePage(pathname) {
  const key = keyFor(pathname);
  if (key === null) return null;
  const page = resolved.get(key);
  if (!page) {
    throw new Error(`Route page for "${pathname}" was rendered before its chunk was preloaded.`);
  }
  return createElement(page);
}

export { NOT_FOUND_KEY };
