import { describe, expect, it } from "vitest";
import {
  COMPANY_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  LeadValidationError,
  MAX_REQUEST_BYTES,
  MAX_SUBMIT_AGE_MS,
  MESSAGE_MAX_LENGTH,
  MIN_SUBMIT_MS,
  evaluateSubmissionTiming,
  isHoneypotTriggered,
  isValidRequestId,
  normalizeEmail,
  normalizeOptionalText,
  readJsonWithLimit,
  resolveRecommendationKey,
  validateProjectCheckPayload,
} from "./validation.ts";

const VALID_REQUEST_ID = "123e4567-e89b-12d3-a456-426614174000";

function validPayload(overrides = {}) {
  return {
    request_id: VALID_REQUEST_ID,
    improvement_focus: "webdesign",
    current_setup: "existing",
    primary_goal: "clarity",
    start_timeframe: "one-to-three",
    path: "/",
    locale: "de",
    started_at: Date.now() - MIN_SUBMIT_MS - 500,
    honeypot: "",
    email: "visitor@example.com",
    contact_name: "Jane Doe",
    company: "Acme GmbH",
    message: "Kurze Nachricht.",
    ...overrides,
  };
}

describe("resolveRecommendationKey", () => {
  it("maps every known improvement_focus to itself", () => {
    for (const focus of ["webdesign", "seo", "inquiries", "automation"]) {
      expect(resolveRecommendationKey(focus)).toBe(focus);
    }
  });

  it("falls back to webdesign for an unknown focus", () => {
    expect(resolveRecommendationKey("not-a-real-value")).toBe("webdesign");
  });
});

describe("isValidRequestId", () => {
  it("accepts a well-formed UUID", () => {
    expect(isValidRequestId(VALID_REQUEST_ID)).toBe(true);
    expect(isValidRequestId(VALID_REQUEST_ID.toUpperCase())).toBe(true);
  });

  it("rejects anything that is not a UUID", () => {
    expect(isValidRequestId("not-a-uuid")).toBe(false);
    expect(isValidRequestId(undefined)).toBe(false);
    expect(isValidRequestId(123)).toBe(false);
    expect(isValidRequestId("")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases a valid email", () => {
    expect(normalizeEmail("  Visitor@Example.COM  ")).toBe("visitor@example.com");
  });

  it("rejects a missing or non-string email", () => {
    expect(() => normalizeEmail(undefined)).toThrow(LeadValidationError);
    expect(() => normalizeEmail(42)).toThrow(LeadValidationError);
  });

  it("rejects an empty or whitespace-only email", () => {
    expect(() => normalizeEmail("   ")).toThrow(LeadValidationError);
  });

  it("rejects a malformed email", () => {
    expect(() => normalizeEmail("not-an-email")).toThrow(LeadValidationError);
  });

  it(`rejects an email longer than ${EMAIL_MAX_LENGTH} characters`, () => {
    const tooLong = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    expect(() => normalizeEmail(tooLong)).toThrow(LeadValidationError);
  });
});

describe("normalizeOptionalText", () => {
  it("returns null for undefined or null", () => {
    expect(normalizeOptionalText(undefined, 100, "field")).toBeNull();
    expect(normalizeOptionalText(null, 100, "field")).toBeNull();
  });

  it("trims whitespace and normalizes an empty-after-trim string to null", () => {
    expect(normalizeOptionalText("  Jane Doe  ", 100, "field")).toBe("Jane Doe");
    expect(normalizeOptionalText("   ", 100, "field")).toBeNull();
    expect(normalizeOptionalText("", 100, "field")).toBeNull();
  });

  it("rejects a value longer than the given max length", () => {
    expect(() => normalizeOptionalText("a".repeat(101), 100, "field")).toThrow(LeadValidationError);
  });

  it("rejects a non-string value", () => {
    expect(() => normalizeOptionalText(42, 100, "field")).toThrow(LeadValidationError);
  });
});

describe("validateProjectCheckPayload", () => {
  it("accepts a fully valid payload, normalizes email/contact fields, and derives recommendation_key", () => {
    const result = validateProjectCheckPayload(validPayload({ improvement_focus: "seo" }));
    expect(result).toEqual({
      request_id: VALID_REQUEST_ID,
      improvement_focus: "seo",
      current_setup: "existing",
      primary_goal: "clarity",
      start_timeframe: "one-to-three",
      recommendation_key: "seo",
      path: "/",
      locale: "de",
      email: "visitor@example.com",
      contact_name: "Jane Doe",
      company: "Acme GmbH",
      message: "Kurze Nachricht.",
    });
  });

  it("normalizes empty optional contact fields to null", () => {
    const result = validateProjectCheckPayload(
      validPayload({ contact_name: "", company: "   ", message: undefined })
    );
    expect(result.contact_name).toBeNull();
    expect(result.company).toBeNull();
    expect(result.message).toBeNull();
  });

  it("ignores any client-supplied recommendation_key entirely", () => {
    const result = validateProjectCheckPayload(
      validPayload({ improvement_focus: "webdesign", recommendation_key: "automation" })
    );
    expect(result.recommendation_key).toBe("webdesign");
  });

  it("rejects a missing or malformed request_id", () => {
    expect(() => validateProjectCheckPayload(validPayload({ request_id: undefined }))).toThrow(
      LeadValidationError
    );
    expect(() => validateProjectCheckPayload(validPayload({ request_id: "not-a-uuid" }))).toThrow(
      LeadValidationError
    );
  });

  it("rejects a missing or invalid email", () => {
    expect(() => validateProjectCheckPayload(validPayload({ email: undefined }))).toThrow(LeadValidationError);
    expect(() => validateProjectCheckPayload(validPayload({ email: "not-an-email" }))).toThrow(
      LeadValidationError
    );
  });

  it(`rejects contact_name over ${CONTACT_NAME_MAX_LENGTH} characters`, () => {
    expect(() =>
      validateProjectCheckPayload(validPayload({ contact_name: "a".repeat(CONTACT_NAME_MAX_LENGTH + 1) }))
    ).toThrow(LeadValidationError);
  });

  it(`rejects company over ${COMPANY_MAX_LENGTH} characters`, () => {
    expect(() =>
      validateProjectCheckPayload(validPayload({ company: "a".repeat(COMPANY_MAX_LENGTH + 1) }))
    ).toThrow(LeadValidationError);
  });

  it(`rejects message over ${MESSAGE_MAX_LENGTH} characters`, () => {
    expect(() =>
      validateProjectCheckPayload(validPayload({ message: "a".repeat(MESSAGE_MAX_LENGTH + 1) }))
    ).toThrow(LeadValidationError);
  });

  it.each(["improvement_focus", "current_setup", "primary_goal", "start_timeframe", "locale"])(
    "rejects an invalid %s value",
    (field) => {
      expect(() => validateProjectCheckPayload(validPayload({ [field]: "hack" }))).toThrow(
        LeadValidationError
      );
    }
  );

  it("rejects a path that does not start with /", () => {
    expect(() => validateProjectCheckPayload(validPayload({ path: "https://evil.example" }))).toThrow(
      LeadValidationError
    );
  });

  it("rejects an overly long path", () => {
    expect(() => validateProjectCheckPayload(validPayload({ path: "/" + "a".repeat(500) }))).toThrow(
      LeadValidationError
    );
  });

  it("rejects a non-object body", () => {
    expect(() => validateProjectCheckPayload(null)).toThrow(LeadValidationError);
    expect(() => validateProjectCheckPayload("string")).toThrow(LeadValidationError);
  });
});

describe("isHoneypotTriggered", () => {
  it("is false when the honeypot field is empty or missing", () => {
    expect(isHoneypotTriggered({ honeypot: "" })).toBe(false);
    expect(isHoneypotTriggered({})).toBe(false);
  });

  it("is true when the honeypot field is filled in", () => {
    expect(isHoneypotTriggered({ honeypot: "I am a bot" })).toBe(true);
  });
});

describe("evaluateSubmissionTiming", () => {
  const now = 1_000_000;

  it("is ok for a plausible human completion time", () => {
    expect(evaluateSubmissionTiming(now - MIN_SUBMIT_MS - 1, now)).toBe("ok");
  });

  it("is too_fast when submitted faster than the minimum duration (unambiguous bot signal)", () => {
    expect(evaluateSubmissionTiming(now - 100, now)).toBe("too_fast");
  });

  it("is too_fast when started_at is in the future (negative elapsed time, tampering)", () => {
    expect(evaluateSubmissionTiming(now + 10_000, now)).toBe("too_fast");
  });

  it("is expired when started_at is missing or not a number (ambiguous, must not fake success)", () => {
    expect(evaluateSubmissionTiming(undefined, now)).toBe("expired");
    expect(evaluateSubmissionTiming("not-a-number", now)).toBe("expired");
  });

  it("is expired when started_at is implausibly old (stale session, not a bot signal)", () => {
    expect(evaluateSubmissionTiming(now - MAX_SUBMIT_AGE_MS - 1, now)).toBe("expired");
  });
});

describe("readJsonWithLimit", () => {
  it("parses a small, valid JSON body", async () => {
    const req = new Request("https://example.test/submit-lead", {
      method: "POST",
      body: JSON.stringify({ a: 1 }),
      headers: { "content-type": "application/json" },
    });
    await expect(readJsonWithLimit(req, MAX_REQUEST_BYTES)).resolves.toEqual({ a: 1 });
  });

  it("rejects a body whose declared Content-Length exceeds the limit", async () => {
    const bigJson = JSON.stringify({ padding: "x".repeat(MAX_REQUEST_BYTES * 2) });
    const req = new Request("https://example.test/submit-lead", {
      method: "POST",
      body: bigJson,
      headers: { "content-type": "application/json" },
    });
    await expect(readJsonWithLimit(req, MAX_REQUEST_BYTES)).rejects.toThrow(LeadValidationError);
  });

  it("enforces the byte limit while streaming even without a trustworthy Content-Length header", async () => {
    const encoder = new TextEncoder();
    const bigJson = JSON.stringify({ padding: "y".repeat(MAX_REQUEST_BYTES * 2) });
    const bytes = encoder.encode(bigJson);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    const fakeRequest = {
      headers: { get: () => null },
      body: stream,
    };
    await expect(readJsonWithLimit(fakeRequest, MAX_REQUEST_BYTES)).rejects.toThrow(LeadValidationError);
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("https://example.test/submit-lead", {
      method: "POST",
      body: "{not json",
      headers: { "content-type": "application/json" },
    });
    await expect(readJsonWithLimit(req, MAX_REQUEST_BYTES)).rejects.toThrow(LeadValidationError);
  });
});
