import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { buildInquiryHref } from "./projectCheckInquiry.js";
import { useLeadSubmission } from "../hooks/useLeadSubmission.js";

const MESSAGE_MAX_LENGTH = 1000;
const CONTACT_NAME_MAX_LENGTH = 120;
const COMPANY_MAX_LENGTH = 200;
const EMAIL_MAX_LENGTH = 254;

function randomRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Extremely old-browser fallback — still unique enough for an idempotency
  // key, never used as a security token.
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Deliberately uncontrolled fields, read via FormData on submit instead of
// React state on every keystroke. Besides being simpler, this avoids
// unnecessary re-renders per keystroke; native `required`/`maxLength`
// already give immediate browser-level feedback without any JS.
export function ProjectCheckContact({ answers }) {
  const { status, submit } = useLeadSubmission();
  // Generated once, when this result/contact view first mounts — not when
  // the quiz itself started.
  const [requestId] = useState(randomRequestId);
  const [startedAt] = useState(() => Date.now());

  const emailId = useId();
  const contactNameId = useId();
  const companyId = useId();
  const messageId = useId();
  const honeypotId = useId();

  const mailtoHref = buildInquiryHref(answers);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new window.FormData(event.currentTarget);

    await submit({
      request_id: requestId,
      started_at: startedAt,
      honeypot: data.get("honeypot") ?? "",
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      locale: "de",
      improvement_focus: answers[0],
      current_setup: answers[1],
      primary_goal: answers[2],
      start_timeframe: answers[3],
      email: data.get("email") ?? "",
      contact_name: data.get("contact_name") ?? "",
      company: data.get("company") ?? "",
      message: data.get("message") ?? "",
    });
  };

  if (status === "success") {
    return (
      <div className="project-check-contact-success" role="status">
        <Check size={16} aria-hidden="true" />
        <span>Vielen Dank — Ihre Anfrage ist eingegangen. Wir melden uns zeitnah bei Ihnen.</span>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="project-check-contact" onSubmit={handleSubmit}>
      <h3>Unverbindliche Anfrage senden</h3>

      <div className="project-check-contact-honeypot" aria-hidden="true">
        <label htmlFor={honeypotId}>Bitte dieses Feld leer lassen</label>
        <input id={honeypotId} name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="project-check-contact-field">
        <label htmlFor={emailId}>E-Mail *</label>
        <input id={emailId} name="email" type="email" required maxLength={EMAIL_MAX_LENGTH} autoComplete="email" />
      </div>

      <div className="project-check-contact-field">
        <label htmlFor={contactNameId}>Ansprechpartner</label>
        <input
          id={contactNameId}
          name="contact_name"
          type="text"
          maxLength={CONTACT_NAME_MAX_LENGTH}
          autoComplete="name"
        />
      </div>

      <div className="project-check-contact-field">
        <label htmlFor={companyId}>Unternehmen</label>
        <input id={companyId} name="company" type="text" maxLength={COMPANY_MAX_LENGTH} autoComplete="organization" />
      </div>

      <div className="project-check-contact-field">
        <label htmlFor={messageId}>
          Nachricht <span className="project-check-contact-limit">(max. {MESSAGE_MAX_LENGTH} Zeichen)</span>
        </label>
        <textarea id={messageId} name="message" maxLength={MESSAGE_MAX_LENGTH} />
      </div>

      <p className="project-check-contact-privacy">
        Mit dem Absenden werden Ihre Angaben zur Bearbeitung dieser Anfrage gemäß unserer{" "}
        <a href="/datenschutz">Datenschutzerklärung</a> verarbeitet.
      </p>

      <button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Wird gesendet…" : "Anfrage senden"}
      </button>

      {status === "error" && (
        <div className="project-check-contact-error" role="alert">
          <p>Ihre Anfrage konnte nicht automatisch gesendet werden.</p>
          <a className="project-check-contact-fallback" href={mailtoHref}>
            Per E-Mail senden <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      )}
    </form>
  );
}
