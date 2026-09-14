import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
const app = (
  <StrictMode>
    <App pathname={window.location.pathname} />
  </StrictMode>
)

// Production builds ship prerendered markup inside #root (see
// scripts/prerender.mjs), so hydrate it instead of re-rendering from
// scratch. `vite dev` serves an empty #root and needs a plain client render.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
