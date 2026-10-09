// Shared between ProjectCheck.jsx and ProjectCheckContact.jsx. Split out on
// its own (rather than re-exported from ProjectCheck.jsx) to avoid a
// circular import between the two components and because a file exporting
// both a component and plain functions/constants breaks React Fast Refresh.
export const QUESTIONS = [
  {
    title: "Was soll verbessert werden?",
    hint: "Wählen Sie den Bereich, bei dem aktuell der größte Hebel liegt.",
    options: [
      { value: "webdesign", label: "Website neu aufbauen oder modernisieren" },
      { value: "seo", label: "Bei Google besser sichtbar werden" },
      { value: "inquiries", label: "Anfragen strukturierter bearbeiten" },
      { value: "automation", label: "Wiederkehrende Prozesse automatisieren" },
    ],
  },
  {
    title: "Was ist aktuell vorhanden?",
    hint: "Eine grobe Einordnung reicht für den ersten sinnvollen Schritt.",
    options: [
      { value: "none", label: "Noch keine Website oder kein System" },
      { value: "existing", label: "Eine bestehende Website" },
      { value: "tools", label: "Einzelne Tools ohne verbundenen Prozess" },
      { value: "unclear", label: "Unklar – das soll gemeinsam geprüft werden" },
    ],
  },
  {
    title: "Was ist das wichtigste Ziel?",
    hint: "Damit ordnen wir nicht nur eine Leistung, sondern den passenden Einstieg zu.",
    options: [
      { value: "clarity", label: "Angebot klarer präsentieren" },
      { value: "visibility", label: "Relevante Sichtbarkeit aufbauen" },
      { value: "response", label: "Anfragen schneller bearbeiten" },
      { value: "efficiency", label: "Manuelle Arbeit reduzieren" },
    ],
  },
  {
    title: "Wann soll das Projekt starten?",
    hint: "Der Zeitraum dient nur der ersten Einordnung und ist noch keine Terminvereinbarung.",
    options: [
      { value: "soon", label: "So bald wie sinnvoll" },
      { value: "one-to-three", label: "In 1–3 Monaten" },
      { value: "three-plus", label: "Später als in 3 Monaten" },
      { value: "exploring", label: "Zunächst Möglichkeiten prüfen" },
    ],
  },
];

export function buildInquiryHref(answers) {
  const labels = answers.map((answer, index) => {
    const option = QUESTIONS[index].options.find(({ value }) => value === answer);
    return `${index + 1}. ${QUESTIONS[index].title}\n${option?.label ?? "–"}`;
  });
  const subject = "Unverbindliche Projektanfrage – TigerFlow Projekt-Check";
  const body = [
    "Hallo TigerFlow,",
    "",
    "ich habe den Projekt-Check durchgeführt:",
    "",
    ...labels,
    "",
    "Unternehmen / Ansprechpartner:",
    "Weitere Informationen:",
  ].join("\n");
  return `mailto:service@tigerflow.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
