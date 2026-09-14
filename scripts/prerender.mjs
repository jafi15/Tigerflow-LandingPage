// Post-build step: turns the client-only Vite build in dist/ into a set of
// fully prerendered static pages (one real HTML file per route), plus
// robots.txt and sitemap.xml generated from the same route config.
//
// Run after `vite build` (client) and `vite build --ssr` (dist-ssr/entry-server.js).

import { readFile, writeFile, rm, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ROUTES, SITE_URL } from "../src/routes.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const distSsrDir = path.join(rootDir, "dist-ssr");
const ssrEntry = path.join(distSsrDir, "entry-server.js");

const OG_IMAGE = `${SITE_URL}/tigerflow-mark.png`;

// Only bestätigte (confirmed) data: matches the Impressum content 1:1.
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "TigerFlow",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/tigerflow-mark.png`,
      email: "service@tigerflow.de",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rendsburger Straße 22",
        postalCode: "25746",
        addressLocality: "Heide",
        addressCountry: "DE",
      },
    },
    {
      "@type": "WebSite",
      name: "TigerFlow",
      url: `${SITE_URL}/`,
    },
  ],
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead({ title, description, canonical, includeJsonLd, robots }) {
  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  ];
  if (canonical) {
    lines.push(`<link rel="canonical" href="${canonical}" />`);
  }
  lines.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="TigerFlow" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  if (canonical) {
    lines.push(`<meta property="og:url" content="${canonical}" />`);
  }
  lines.push(
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:locale" content="de_DE" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="robots" content="${robots}" />`
  );
  if (includeJsonLd) {
    lines.push(
      `<script type="application/ld+json">${JSON.stringify(ORG_JSON_LD)}</script>`
    );
  }
  return lines.join("\n    ");
}

function injectPage(template, { head, bodyHtml }) {
  const headStart = "<!--SEO_HEAD_START-->";
  const headEnd = "<!--SEO_HEAD_END-->";
  const startIdx = template.indexOf(headStart);
  const endIdx = template.indexOf(headEnd);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      "dist/index.html is missing the <!--SEO_HEAD_START/END--> markers"
    );
  }
  const before = template.slice(0, startIdx + headStart.length);
  const after = template.slice(endIdx);
  const withHead = `${before}\n    ${head}\n    ${after}`;

  const rootMarker = '<div id="root"></div>';
  if (!withHead.includes(rootMarker)) {
    throw new Error('dist/index.html is missing an empty <div id="root"></div>');
  }
  return withHead.replace(rootMarker, `<div id="root">${bodyHtml}</div>`);
}

function assertRenderedPage(html, outFile) {
  const h1Count = (html.match(/<h1[ >]/g) || []).length;
  if (h1Count !== 1) {
    throw new Error(
      `Prerendered page ${outFile} must contain exactly one <h1>, found ${h1Count}`
    );
  }
  if (!/<div id="root">[^]*?\S[^]*?<\/div>/.test(html)) {
    throw new Error(`Prerendered page ${outFile} has an empty #root body`);
  }
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(ssrEntry))) {
    throw new Error(
      `SSR bundle not found at ${ssrEntry}. Run "npm run build:ssr" first.`
    );
  }
  const { render } = await import(pathToFileURL(ssrEntry).href);

  const template = await readFile(path.join(distDir, "index.html"), "utf8");

  for (const route of ROUTES) {
    const canonical = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
    const bodyHtml = render(route.path);
    const head = buildHead({
      title: route.title,
      description: route.description,
      canonical,
      includeJsonLd: route.path === "/",
      robots: "index, follow",
    });
    const page = injectPage(template, { head, bodyHtml });
    const outPath = path.join(distDir, route.outFile);
    assertRenderedPage(page, route.outFile);
    await writeFile(outPath, page, "utf8");
    console.log(`prerendered ${route.path} -> dist/${route.outFile}`);
  }

  // 404: any path not present in ROUTES renders NotFoundPage client-side too,
  // so reuse the same render path with a guaranteed-unknown pathname.
  const notFoundBody = render("/__not_found__");
  const notFoundHead = buildHead({
    title: "Seite nicht gefunden | TigerFlow",
    description:
      "Die aufgerufene Seite existiert nicht oder wurde verschoben.",
    canonical: null,
    includeJsonLd: false,
    robots: "noindex, follow",
  });
  const notFoundPage = injectPage(template, {
    head: notFoundHead,
    bodyHtml: notFoundBody,
  });
  assertRenderedPage(notFoundPage, "404.html");
  await writeFile(path.join(distDir, "404.html"), notFoundPage, "utf8");
  console.log("prerendered 404 -> dist/404.html");

  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(path.join(distDir, "robots.txt"), robotsTxt, "utf8");
  console.log("generated dist/robots.txt");

  const urlEntries = ROUTES.map((route) => {
    const loc = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");
  const sitemapXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlEntries}\n` +
    `</urlset>\n`;
  await writeFile(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");
  console.log("generated dist/sitemap.xml");

  await rm(distSsrDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
