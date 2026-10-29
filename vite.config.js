import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // scripts/prerender.mjs reads the manifest to link each route's code-split
  // page chunk (JS + CSS) into that route's prerendered HTML.
  build: { manifest: true },
})
