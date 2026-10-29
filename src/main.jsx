import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadRoutePage } from './routePages'

const rootEl = document.getElementById('root')
const pathname = window.location.pathname
const app = (
  <StrictMode>
    <App pathname={pathname} />
  </StrictMode>
)

// Only the current route's page chunk is loaded. Rendering waits for it, so the
// prerendered markup is hydrated in place without a loading state or flicker.
// If the chunk cannot be loaded, the prerendered HTML simply stays as it is.
preloadRoutePage(pathname)
  .then(() => {
    // Production builds ship prerendered markup inside #root (see
    // scripts/prerender.mjs), so hydrate it instead of re-rendering from
    // scratch. `vite dev` serves an empty #root and needs a plain client render.
    if (rootEl.hasChildNodes()) {
      hydrateRoot(rootEl, app)
    } else {
      createRoot(rootEl).render(app)
    }
  })
  .catch((error) => {
    console.error('TigerFlow: route chunk could not be loaded', error)
  })
