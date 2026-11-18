import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { NOT_FOUND_KEY, registerRoutePages } from "./routePages";
import { WebdesignHeidePage } from "./components/WebdesignHeidePage";
import { WebdesignDithmarschenPage } from "./components/WebdesignDithmarschenPage";
import { WebdesignSchleswigHolsteinPage } from "./components/WebdesignSchleswigHolsteinPage";
import { SeoHeidePage } from "./components/SeoHeidePage";
import { SeoSchleswigHolsteinPage } from "./components/SeoSchleswigHolsteinPage";
import { SeoBetreuungPage } from "./components/SeoBetreuungPage";
import { PreisePage } from "./components/PreisePage";
import { WebsiteBetreuungPage } from "./components/WebsiteBetreuungPage";
import { UeberUnsPage } from "./components/UeberUnsPage";
import { ImpressumPage } from "./components/ImpressumPage";
import { DatenschutzPage } from "./components/DatenschutzPage";
import { AGBPage } from "./components/AGBPage";
import { NotFoundPage } from "./components/NotFoundPage";

// The browser bundle code-splits these pages (src/routePages.js). The SSR build
// imports them statically so every route renders complete, indexable HTML.
registerRoutePages({
  "/webdesign-heide": WebdesignHeidePage,
  "/webdesign-dithmarschen": WebdesignDithmarschenPage,
  "/webdesign-schleswig-holstein": WebdesignSchleswigHolsteinPage,
  "/seo-heide": SeoHeidePage,
  "/seo-schleswig-holstein": SeoSchleswigHolsteinPage,
  "/seo-betreuung": SeoBetreuungPage,
  "/preise": PreisePage,
  "/website-betreuung": WebsiteBetreuungPage,
  "/ueber-uns": UeberUnsPage,
  "/impressum": ImpressumPage,
  "/datenschutz": DatenschutzPage,
  "/agb": AGBPage,
  [NOT_FOUND_KEY]: NotFoundPage,
});

// Used only at build time by scripts/prerender.mjs (via the Vite SSR build)
// to produce the initial HTML for every route in src/routes.config.js.
export function render(pathname) {
  return renderToString(<App pathname={pathname} />);
}
