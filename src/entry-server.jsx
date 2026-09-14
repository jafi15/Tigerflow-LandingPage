import { renderToString } from "react-dom/server";
import App from "./App.jsx";

// Used only at build time by scripts/prerender.mjs (via the Vite SSR build)
// to produce the initial HTML for every route in src/routes.config.js.
export function render(pathname) {
  return renderToString(<App pathname={pathname} />);
}
