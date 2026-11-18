import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import path from "node:path";
import { DIST_DIR, createServer, listen } from "../scripts/serve-dist.mjs";

// Safari only plays video from servers that answer byte-range requests with 206.
let server;
let baseUrl;
const MP4 = "/video/tigerflow-ueber-uns.mp4";
const size = () => statSync(path.join(DIST_DIR, "video", "tigerflow-ueber-uns.mp4")).size;

beforeAll(async () => {
  server = createServer();
  baseUrl = await listen(server, 0);
});

afterAll(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

describe("preview server delivers the hero video the way browsers need it", () => {
  it("announces range support and the real video types", async () => {
    const mp4 = await fetch(`${baseUrl}${MP4}`);
    expect(mp4.status).toBe(200);
    expect(mp4.headers.get("content-type")).toBe("video/mp4");
    expect(mp4.headers.get("accept-ranges")).toBe("bytes");
    expect(Number(mp4.headers.get("content-length"))).toBe(size());
    await mp4.arrayBuffer();
    const webm = await fetch(`${baseUrl}/video/tigerflow-ueber-uns.webm`);
    expect(webm.headers.get("content-type")).toBe("video/webm");
    await webm.arrayBuffer();
  });

  it("answers a bounded range with 206 and exactly the requested bytes", async () => {
    const res = await fetch(`${baseUrl}${MP4}`, { headers: { Range: "bytes=0-99" } });
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe(`bytes 0-99/${size()}`);
    expect(res.headers.get("content-length")).toBe("100");
    expect((await res.arrayBuffer()).byteLength).toBe(100);
  });

  it("answers open-ended and suffix ranges (what Safari sends first and last)", async () => {
    const open = await fetch(`${baseUrl}${MP4}`, { headers: { Range: "bytes=1000-" } });
    expect(open.status).toBe(206);
    expect(open.headers.get("content-range")).toBe(`bytes 1000-${size() - 1}/${size()}`);
    expect((await open.arrayBuffer()).byteLength).toBe(size() - 1000);
    const suffix = await fetch(`${baseUrl}${MP4}`, { headers: { Range: "bytes=-50" } });
    expect(suffix.status).toBe(206);
    expect((await suffix.arrayBuffer()).byteLength).toBe(50);
  });

  it("rejects ranges outside the file with 416", async () => {
    const res = await fetch(`${baseUrl}${MP4}`, { headers: { Range: `bytes=${size() + 10}-` } });
    expect(res.status).toBe(416);
    expect(res.headers.get("content-range")).toBe(`bytes */${size()}`);
    await res.arrayBuffer();
  });

  it("keeps serving pages unchanged", async () => {
    const res = await fetch(`${baseUrl}/ueber-uns`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
    await res.text();
  });
});
