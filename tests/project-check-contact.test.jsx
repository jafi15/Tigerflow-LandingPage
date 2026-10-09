import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { ProjectCheckContact } from "../src/components/ProjectCheckContact.jsx";

const ANSWERS = ["webdesign", "existing", "clarity", "one-to-three"];

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: "https://tigerflow.de/",
    pretendToBeVisual: true,
  });
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("Element", dom.window.Element);
  vi.stubGlobal("Node", dom.window.Node);
  vi.stubGlobal("SVGElement", dom.window.SVGElement);
  vi.stubGlobal("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return dom;
}

// Fields in this component are deliberately uncontrolled (read via
// FormData on submit, see ProjectCheckContact.jsx) — a direct DOM
// assignment is enough, no React onChange needs to fire for this test to
// reflect real usage. This project has no @testing-library installed and
// doesn't add one here; this is plain DOM.
function setField(input, value) {
  act(() => {
    input.value = value;
  });
}

function submitForm(form) {
  act(() => {
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ProjectCheckContact", () => {
  let dom;
  let root;
  let container;
  let fetchMock;

  beforeEach(() => {
    dom = installDom();
    container = document.getElementById("root");
    vi.stubEnv("VITE_SUPABASE_URL", "https://project-ref.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    act(() => root?.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  function render() {
    act(() => {
      root = createRoot(container);
      root.render(<ProjectCheckContact answers={ANSWERS} />);
    });
  }

  function emailField() {
    return container.querySelector('input[name="email"]');
  }

  it("renders email (required), optional contact name/company/message with a visible limit, and no checkbox", () => {
    render();
    const emailInput = emailField();
    expect(emailInput).not.toBeNull();
    expect(emailInput.required).toBe(true);

    expect(container.querySelector('input[name="contact_name"]')).not.toBeNull();
    expect(container.querySelector('input[name="company"]')).not.toBeNull();

    const textarea = container.querySelector('textarea[name="message"]');
    expect(textarea).not.toBeNull();
    expect(textarea.maxLength).toBe(1000);
    expect(container.textContent).toMatch(/max\.\s*1000\s*zeichen/i);

    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it("shows a transparent privacy notice linking to /datenschutz, with no consent/newsletter wording", () => {
    render();
    const link = container.querySelector('a[href="/datenschutz"]');
    expect(link).not.toBeNull();
    expect(container.textContent).not.toMatch(/einwillig|newsletter|werb(ung|lich)/i);
  });

  it("includes a visually hidden honeypot field that is not part of the tab order", () => {
    render();
    const honeypot = container.querySelector('.project-check-contact-honeypot input[name="honeypot"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("shows an accessible loading state and never a success message before the server confirms it", async () => {
    let resolveFetch;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await flush();

    const button = container.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.textContent).not.toMatch(/eingegangen|vielen dank/i);

    resolveFetch({ ok: true, json: async () => ({ ok: true }) });
    await flush();

    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(container.textContent).toMatch(/eingegangen|vielen dank/i);
  });

  it("sends the expected payload shape including a UUID request_id and a recent started_at", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    render();

    setField(emailField(), "Visitor@Example.com");
    submitForm(container.querySelector("form"));
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://project-ref.supabase.co/functions/v1/submit-lead");
    expect(init.headers.apikey).toBe("sb_publishable_test");
    const body = JSON.parse(init.body);
    expect(body.email).toBe("Visitor@Example.com");
    expect(body.improvement_focus).toBe("webdesign");
    expect(body.current_setup).toBe("existing");
    expect(body.primary_goal).toBe("clarity");
    expect(body.start_timeframe).toBe("one-to-three");
    expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(typeof body.started_at).toBe("number");
    expect(Date.now() - body.started_at).toBeLessThan(5000);
    expect(body.honeypot).toBe("");
  });

  it("keeps the same request_id across a retry after a failure (idempotent resubmission)", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "server_error" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await flush();
    submitForm(container.querySelector("form"));
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody.request_id).toBe(firstBody.request_id);
  });

  it("shows a generic error and a mailto fallback on a backend error response, without a fake success", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ ok: false, error: "server_error" }) });
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await flush();

    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
    const fallback = container.querySelector('a[href^="mailto:service@tigerflow.de"]');
    expect(fallback).not.toBeNull();
    expect(decodeURIComponent(fallback.getAttribute("href"))).not.toMatch(/visitor@example\.com/);
  });

  it("shows the generic error and mailto fallback on a network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await flush();

    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.querySelector('a[href^="mailto:service@tigerflow.de"]')).not.toBeNull();
  });

  it("times out a hanging request and falls back to the generic error state", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        })
    );
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });

    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    vi.useRealTimers();
  });

  it("falls back to the generic error state immediately, without calling fetch, when Supabase env config is missing", async () => {
    // Explicitly stub to empty rather than vi.unstubAllEnvs(): if this
    // machine has a real .env.local (as it does for local end-to-end
    // testing against a live project), unstubbing would fall through to
    // those real values instead of simulating "missing" — this must stay
    // deterministic regardless of the ambient dev environment.
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    render();

    setField(emailField(), "visitor@example.com");
    submitForm(container.querySelector("form"));
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.querySelector('a[href^="mailto:service@tigerflow.de"]')).not.toBeNull();
  });

  it("rejects client-side submission of an empty required email (native required validation)", () => {
    render();
    expect(emailField().checkValidity()).toBe(false);
  });
});
