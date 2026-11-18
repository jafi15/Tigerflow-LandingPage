// Minimal static file server used to verify dist/ locally without Vercel.
// Mirrors the two hosting rules configured in vercel.json:
//   - cleanUrls: "/impressum" resolves to "impressum.html" on disk
//   - no SPA rewrite: unmatched paths get dist/404.html with a real 404 status
//
// This is a local approximation for testing only, not a deployment artifact.

import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
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
  ".mp4": "video/mp4",
  ".webm": "video/webm",
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

// Parses a single "bytes=a-b" / "bytes=a-" / "bytes=-n" range. Returns null for no/unsupported
// header, "invalid" when it lies outside the file.
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header || "");
  if (!match || (match[1] === "" && match[2] === "")) return null;
  let start;
  let end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (start >= size || start > end) return "invalid";
  return { start, end };
}

export function createServer(distDir = DIST_DIR) {
  return createHttpServer(async (req, res) => {
    const file = await resolveFile(distDir, req.url || "/");
    if (file) {
      // Browsers (Safari above all) only play media from servers that answer byte ranges.
      const { size } = await stat(file);
      const type = contentTypeFor(file);
      const range = parseRange(req.headers.range, size);
      if (range === "invalid") {
        res.writeHead(416, { "Content-Range": `bytes */${size}`, "Content-Type": type });
        res.end();
        return;
      }
      if (range) {
        res.writeHead(206, {
          "Content-Type": type,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
          "Content-Length": range.end - range.start + 1,
        });
        createReadStream(file, { start: range.start, end: range.end }).pipe(res);
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": size });
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
