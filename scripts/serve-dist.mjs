// Minimal static file server used to verify dist/ locally without Vercel.
// Mirrors the two hosting rules configured in vercel.json:
//   - cleanUrls: "/impressum" resolves to "impressum.html" on disk
//   - no SPA rewrite: unmatched paths get dist/404.html with a real 404 status
//
// This is a local approximation for testing only, not a deployment artifact.

import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DIST_DIR = path.resolve(__dirname, "..", "dist");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
};

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] || "application/octet-stream";
}

async function resolveFile(distDir, urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = [];
  if (pathname === "/") {
    candidates.push(path.join(distDir, "index.html"));
  } else {
    const clean = pathname.replace(/^\/+/, "");
    candidates.push(path.join(distDir, clean)); // exact file (assets, robots.txt, sitemap.xml)
    candidates.push(path.join(distDir, `${clean}.html`)); // cleanUrls resolution
  }
  for (const candidate of candidates) {
    if (!candidate.startsWith(distDir)) continue; // guard against path traversal
    try {
      const st = await stat(candidate);
      if (st.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export function createServer(distDir = DIST_DIR) {
  return createHttpServer(async (req, res) => {
    const file = await resolveFile(distDir, req.url || "/");
    if (file) {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": contentTypeFor(file) });
      res.end(body);
      return;
    }
    try {
      const notFoundBody = await readFile(path.join(distDir, "404.html"));
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(notFoundBody);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
    }
  });
}

export function listen(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const { port: boundPort } = server.address();
      resolve(`http://127.0.0.1:${boundPort}`);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServer();
  const port = Number(process.env.PORT) || 4173;
  server.listen(port, () => {
    console.log(`Serving dist/ at http://localhost:${port}`);
  });
}
