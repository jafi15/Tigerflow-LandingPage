import { useCallback, useState } from "react";

const SUBMIT_TIMEOUT_MS = 10000;
const FUNCTIONS_PATH = "/functions/v1/submit-lead";

// Missing config degrades to the "error" status (→ mailto fallback in the
// UI) rather than throwing — this must never break rendering, including
// during SSR/prerendering, where these env vars are also simply absent.
function resolveConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// Network/status logic only, kept separate from ProjectCheckContact's
// markup and field state on purpose (see project report).
export function useLeadSubmission() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [config] = useState(resolveConfig);

  const submit = useCallback(
    async (payload) => {
      if (!config) {
        // No real backend reachable — fail immediately to the error state
        // (→ mailto fallback) without ever calling fetch.
        setStatus("error");
        return false;
      }

      setStatus("submitting");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

      try {
        const response = await fetch(`${config.url}${FUNCTIONS_PATH}`, {
          method: "POST",
          headers: { "content-type": "application/json", apikey: config.key },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        let json = null;
        try {
          json = await response.json();
        } catch {
          json = null;
        }

        // Success is only ever reported after a confirmed HTTP 200 AND
        // {ok:true} from the atomic save path — never optimistically.
        const success = response.ok && json?.ok === true;
        setStatus(success ? "success" : "error");
        return success;
      } catch (err) {
        // Network failure, timeout/abort, or anything else — never shown to
        // the visitor beyond the generic error state; logged for debugging
        // only.
        console.error("submit-lead request failed", err);
        setStatus("error");
        return false;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [config]
  );

  const reset = useCallback(() => setStatus("idle"), []);

  return { status, submit, reset };
}
