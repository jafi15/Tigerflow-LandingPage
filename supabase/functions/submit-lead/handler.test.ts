import { describe, expect, it, vi } from "vitest";
import { handleSubmitLead } from "./handler.ts";
import { MAX_SUBMIT_AGE_MS, MIN_SUBMIT_MS } from "./validation.ts";

const ALLOWED_ORIGIN = "https://tigerflow.de";
const VALID_PUBLISHABLE_KEY = "sb_publishable_test";
const VALID_REQUEST_ID = "123e4567-e89b-12d3-a456-426614174000";

function validBody(overrides = {}) {
  return {
    request_id: VALID_REQUEST_ID,
    improvement_focus: "webdesign",
    current_setup: "existing",
    primary_goal: "clarity",
    start_timeframe: "one-to-three",
    path: "/",
    locale: "de",
    started_at: Date.now() - MIN_SUBMIT_MS - 1000,
    honeypot: "",
    email: "visitor@example.com",
    contact_name: "Jane Doe",
    company: "Acme GmbH",
    message: "Kurze Nachricht.",
    ...overrides,
  };
}

function postRequest(body, { origin = ALLOWED_ORIGIN, method = "POST", headers = {} } = {}) {
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(method) && body !== null;
  return new Request("https://project-ref.supabase.co/functions/v1/submit-lead", {
    method,
    headers: {
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...(origin ? { origin } : {}),
      ...headers,
    },
    ...(hasBody ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });
}

// Most tests exercise behavior *past* the Publishable Key gate, so they go
// through this helper, which always attaches a valid apikey header. Tests
// about the gate itself use postRequest directly to control that header.
function validRequest(body, { headers = {}, ...rest } = {}) {
  return postRequest(body, { ...rest, headers: { apikey: VALID_PUBLISHABLE_KEY, ...headers } });
}

async function readJson(response) {
  return JSON.parse(await response.text());
}

function allowAll() {
  return vi.fn().mockResolvedValue(true);
}

function baseOptions(overrides = {}) {
  return {
    insertLead: vi.fn().mockResolvedValue(undefined),
    checkRateLimit: allowAll(),
    validPublishableKeys: [VALID_PUBLISHABLE_KEY],
    allowedOrigin: ALLOWED_ORIGIN,
    ...overrides,
  };
}

describe("handleSubmitLead", () => {
  it("accepts a valid submission, writes it via insertLead, and never trusts a client-sent recommendation_key", async () => {
    const options = baseOptions();
    const req = validRequest(validBody({ improvement_focus: "seo", recommendation_key: "automation" }));

    const res = await handleSubmitLead(req, options);

    expect(res.status).toBe(200);
    await expect(readJson(res)).resolves.toEqual({ ok: true });
    expect(options.insertLead).toHaveBeenCalledTimes(1);
    expect(options.insertLead).toHaveBeenCalledWith({
      request_id: VALID_REQUEST_ID,
      email: "visitor@example.com",
      contact_name: "Jane Doe",
      company: "Acme GmbH",
      path: "/",
      locale: "de",
      submission: {
        improvement_focus: "seo",
        current_setup: "existing",
        primary_goal: "clarity",
        start_timeframe: "one-to-three",
        recommendation_key: "seo",
        message: "Kurze Nachricht.",
      },
    });
  });

  it("normalizes missing optional contact fields to null before calling insertLead", async () => {
    const options = baseOptions();
    const body = validBody();
    delete body.contact_name;
    delete body.company;
    delete body.message;
    await handleSubmitLead(validRequest(body), options);
    expect(options.insertLead).toHaveBeenCalledWith(
      expect.objectContaining({
        contact_name: null,
        company: null,
        submission: expect.objectContaining({ message: null }),
      })
    );
  });

  it("rejects a missing or invalid email with a generic error and does not call insertLead", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ email: "not-an-email" })), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "invalid_request" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("rejects a missing or malformed request_id with a generic error", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ request_id: "not-a-uuid" })), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "invalid_request" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  describe("idempotent retry (same request_id)", () => {
    // The real dedup guarantee lives in create_project_check_lead()'s
    // ON CONFLICT (request_id) DO NOTHING — not executable here (no local
    // Postgres). This fake store stands in for that exact contract (second
    // write with a known request_id is a no-op, first write's data is never
    // overwritten) to prove the request pipeline is retry-safe end to end
    // given that contract holds.
    function createFakeIdempotentStore() {
      const byRequestId = new Map();
      const insertLead = vi.fn(async (input) => {
        if (byRequestId.has(input.request_id)) return;
        byRequestId.set(input.request_id, input);
      });
      return { insertLead, byRequestId };
    }

    it("responds with success both times and stores only one record for two identical retries", async () => {
      const store = createFakeIdempotentStore();
      const options = baseOptions({ insertLead: store.insertLead });
      const body = validBody();

      const first = await handleSubmitLead(validRequest(body), options);
      const second = await handleSubmitLead(validRequest(body), options);

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      await expect(readJson(first)).resolves.toEqual({ ok: true });
      await expect(readJson(second)).resolves.toEqual({ ok: true });
      expect(store.byRequestId.size).toBe(1);
    });

    it("never lets a retry with different field values overwrite the first stored submission", async () => {
      const store = createFakeIdempotentStore();
      const options = baseOptions({ insertLead: store.insertLead });

      await handleSubmitLead(validRequest(validBody({ message: "Erste Nachricht" })), options);
      await handleSubmitLead(validRequest(validBody({ message: "Andere Nachricht beim Retry" })), options);

      expect(store.byRequestId.size).toBe(1);
      expect(store.byRequestId.get(VALID_REQUEST_ID).submission.message).toBe("Erste Nachricht");
    });

    it("treats two different request_ids as two separate submissions", async () => {
      const store = createFakeIdempotentStore();
      const options = baseOptions({ insertLead: store.insertLead });

      await handleSubmitLead(validRequest(validBody()), options);
      await handleSubmitLead(
        validRequest(validBody({ request_id: "00000000-0000-4000-8000-000000000000" })),
        options
      );

      expect(store.byRequestId.size).toBe(2);
    });
  });

  it("works with no Authorization header at all — only the Publishable Key on apikey is required", async () => {
    const options = baseOptions();
    const req = validRequest(validBody());
    expect(req.headers.get("authorization")).toBeNull();

    const res = await handleSubmitLead(req, options);
    expect(res.status).toBe(200);
  });

  describe("Publishable Key gate", () => {
    it("rejects a request with no apikey header at all", async () => {
      const options = baseOptions();
      const res = await handleSubmitLead(postRequest(validBody()), options);
      expect(res.status).toBe(401);
      await expect(readJson(res)).resolves.toEqual({ ok: false, error: "unauthorized" });
      expect(options.insertLead).not.toHaveBeenCalled();
      expect(options.checkRateLimit).not.toHaveBeenCalled();
    });

    it("rejects a request with a wrong/unknown apikey value", async () => {
      const options = baseOptions();
      const res = await handleSubmitLead(
        postRequest(validBody(), { headers: { apikey: "sb_publishable_not_ours" } }),
        options
      );
      expect(res.status).toBe(401);
      await expect(readJson(res)).resolves.toEqual({ ok: false, error: "unauthorized" });
      expect(options.insertLead).not.toHaveBeenCalled();
    });

    it("accepts any key from a rotated set of multiple valid publishable keys", async () => {
      const options = baseOptions({ validPublishableKeys: ["sb_publishable_old", "sb_publishable_new"] });
      const res = await handleSubmitLead(
        postRequest(validBody(), { headers: { apikey: "sb_publishable_old" } }),
        options
      );
      expect(res.status).toBe(200);
    });
  });

  it("adds the CORS header only when the Origin matches, but still processes mismatched origins the same way", async () => {
    const matchingOptions = baseOptions();
    const matching = await handleSubmitLead(validRequest(validBody(), { origin: ALLOWED_ORIGIN }), matchingOptions);
    expect(matching.headers.get("access-control-allow-origin")).toBe(ALLOWED_ORIGIN);

    const mismatchedOptions = baseOptions();
    const mismatched = await handleSubmitLead(
      validRequest(validBody(), { origin: "https://not-tigerflow.example" }),
      mismatchedOptions
    );
    // CORS is a browser-side convenience only: a mismatched Origin still gets
    // processed and stored exactly like a matching one — it just would be
    // blocked client-side by the browser, not rejected by this server.
    expect(mismatched.status).toBe(200);
    expect(mismatched.headers.get("access-control-allow-origin")).toBeNull();
    expect(mismatchedOptions.insertLead).toHaveBeenCalledTimes(1);
  });

  describe("CORS preflight", () => {
    it("reflects the allowed origin and allows the headers the supabase-js browser client sends", async () => {
      const res = await handleSubmitLead(postRequest(null, { method: "OPTIONS" }), baseOptions());
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBe(ALLOWED_ORIGIN);

      const allowedHeaders = (res.headers.get("access-control-allow-headers") ?? "")
        .split(",")
        .map((header) => header.trim().toLowerCase());
      for (const required of ["authorization", "x-client-info", "apikey", "content-type"]) {
        expect(allowedHeaders).toContain(required);
      }
    });

    it("omits CORS headers entirely for a preflight from a mismatched origin", async () => {
      const res = await handleSubmitLead(
        postRequest(null, { method: "OPTIONS", origin: "https://not-tigerflow.example" }),
        baseOptions()
      );
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    });
  });

  it("rejects non-POST, non-OPTIONS methods generically", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody(), { method: "GET" }), options);
    expect(res.status).toBe(405);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "method_not_allowed" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns 429 and a generic error when the rate limit is exceeded, without touching insertLead", async () => {
    const options = baseOptions({ checkRateLimit: vi.fn().mockResolvedValue(false) });
    const res = await handleSubmitLead(validRequest(validBody()), options);
    expect(res.status).toBe(429);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "rate_limited" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("fails open (allows, proceeds) and returns a controlled response when checkRateLimit itself throws", async () => {
    const options = baseOptions({ checkRateLimit: vi.fn().mockRejectedValue(new Error("rate limiter is down")) });
    const res = await handleSubmitLead(validRequest(validBody()), options);
    expect(res.status).toBe(200);
    await expect(readJson(res)).resolves.toEqual({ ok: true });
    expect(options.insertLead).toHaveBeenCalledTimes(1);
  });

  it("passes the client IP from X-Forwarded-For (leftmost entry) to checkRateLimit", async () => {
    const options = baseOptions();
    await handleSubmitLead(
      validRequest(validBody(), { headers: { "x-forwarded-for": "203.0.113.42, 10.0.0.1" } }),
      options
    );
    expect(options.checkRateLimit).toHaveBeenCalledWith("203.0.113.42", expect.any(Number));
  });

  it("prefers CF-Connecting-IP over X-Forwarded-For when both are present", async () => {
    const options = baseOptions();
    await handleSubmitLead(
      validRequest(validBody(), {
        headers: { "cf-connecting-ip": "198.51.100.7", "x-forwarded-for": "203.0.113.42" },
      }),
      options
    );
    expect(options.checkRateLimit).toHaveBeenCalledWith("198.51.100.7", expect.any(Number));
  });

  it("returns a generic error for malformed JSON and does not call insertLead", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest("{not json"), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "invalid_request" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a generic error for an oversized body and does not call insertLead", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ padding: "z".repeat(10_000) })), options);
    expect(res.status).toBe(413);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "invalid_request" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a generic error for an invalid selection value and does not call insertLead", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ improvement_focus: "hack" })), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "invalid_request" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("silently drops a honeypot-triggered submission behind a convincing success response (unambiguous bot signal)", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ honeypot: "spam" })), options);
    expect(res.status).toBe(200);
    await expect(readJson(res)).resolves.toEqual({ ok: true });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a real, generic, retryable error for a too-fast submission instead of a fake success (a real visitor can trigger this via browser autofill + a quick click)", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(validBody({ started_at: Date.now() - 50 })), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "submission_expired" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a real, generic, retryable error for an expired started_at instead of a fake success", async () => {
    const options = baseOptions();
    const res = await handleSubmitLead(
      validRequest(validBody({ started_at: Date.now() - MAX_SUBMIT_AGE_MS - 1000 })),
      options
    );
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "submission_expired" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a real, generic, retryable error when started_at is missing instead of a fake success", async () => {
    const body = validBody();
    delete body.started_at;
    const options = baseOptions();
    const res = await handleSubmitLead(validRequest(body), options);
    expect(res.status).toBe(400);
    await expect(readJson(res)).resolves.toEqual({ ok: false, error: "submission_expired" });
    expect(options.insertLead).not.toHaveBeenCalled();
  });

  it("returns a generic server_error and never leaks internal failure details when insertLead throws", async () => {
    const options = baseOptions({
      insertLead: vi.fn().mockRejectedValue(new Error("duplicate key value violates unique constraint")),
    });
    const res = await handleSubmitLead(validRequest(validBody()), options);
    expect(res.status).toBe(500);
    const json = await readJson(res);
    expect(json).toEqual({ ok: false, error: "server_error" });
    expect(JSON.stringify(json)).not.toMatch(/duplicate key|constraint/i);
  });
});
