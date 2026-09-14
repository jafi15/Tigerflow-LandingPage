import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, listen } from "../scripts/serve-dist.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let server;
let baseUrl;

beforeAll(async () => {
  server = createServer();
  baseUrl = await listen(server, 0);
});

afterAll(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

describe("production-like dist HTTP behavior", () => {
  for (const route of ["/", "/impressum", "/datenschutz", "/agb"]) {
    it(`${route} returns prerendered HTML with HTTP 200`, async () => {
      const response = await fetch(`${baseUrl}${route}`);
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/^text\/html\b/);
      expect(body).toContain('<div id="root">');
      expect(body).toMatch(/<h1[ >]/);
    });
  }

  it("serves robots.txt as text", async () => {
    const response = await fetch(`${baseUrl}/robots.txt`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^text\/plain\b/);
    expect(await response.text()).toContain("Sitemap: https://tigerflow.de/sitemap.xml");
  });

  it("serves sitemap.xml as XML", async () => {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^application\/xml\b/);
    expect(await response.text()).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it("returns the noindex 404 document with a real HTTP 404", async () => {
    const response = await fetch(`${baseUrl}/dies-gibt-es-nicht-xyz-technical-check`);
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toMatch(/^text\/html\b/);
    expect(body).toContain('content="noindex, follow"');
    expect(body).not.toContain('<link rel="canonical"');
  });
});

describe("production hosting configuration", () => {
  it("does not contain an SPA catch-all rewrite", () => {
    const config = JSON.parse(readFileSync(path.join(rootDir, "vercel.json"), "utf8"));

    expect(config).not.toHaveProperty("rewrites");
    expect(config.cleanUrls).toBe(true);
  });
});
