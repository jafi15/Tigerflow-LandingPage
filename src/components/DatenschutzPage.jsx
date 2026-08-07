import { C } from "../theme";
import { Footer } from "./Footer";

const sections = [
  {
    title: "1. Verantwortlicher",
    content:
      "Jafar Hamzeh\nEinzelunternehmen\nRendsburger Straße 22\n25746 Heide\nDeutschland\n\nE-Mail: service@tigerflow.de",
  },
  {
    title: "2. Allgemeine Hinweise zur Datenverarbeitung",
    content:
      "Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website, zur Bearbeitung von Anfragen oder zur Durchführung vorvertraglicher und vertraglicher Maßnahmen erforderlich ist. Personenbezogene Daten sind alle Informationen, mit denen Sie persönlich identifiziert werden können.",
  },
  {
    title: "3. Hosting über Vercel",
    content:
      "Diese Website wird über Vercel Inc. bereitgestellt. Beim Aufruf der Website werden technisch erforderliche Zugriffsdaten verarbeitet, damit die Website sicher und stabil ausgeliefert werden kann. Dazu können insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene URL, Referrer-URL, Browsertyp, Betriebssystem und technische Protokolldaten gehören.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren, schnellen und zuverlässigen Bereitstellung der Website.",
  },
  {
    title: "4. Kontaktaufnahme per E-Mail",
    content:
      "Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir die von Ihnen übermittelten Daten, zum Beispiel E-Mail-Adresse, Name, Inhalt der Nachricht und weitere freiwillige Angaben. Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur Kommunikation mit Ihnen.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern die Anfrage auf vorvertragliche oder vertragliche Maßnahmen gerichtet ist. In allen übrigen Fällen erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.",
  },
  {
    title: "5. Formulare und Supabase",
    content:
      "Die auf dieser Website vorgesehenen Kontakt-, Analyse- oder Diagnoseformulare werden künftig über Supabase als technisches Backend verarbeitet. Wenn Sie ein Formular absenden, können die von Ihnen eingegebenen Daten, zum Beispiel E-Mail-Adresse, Unternehmensangaben, ausgewählte Optionen und Nachrichtentexte, zur Bearbeitung Ihrer Anfrage gespeichert und verarbeitet werden.\n\nDie Verarbeitung erfolgt, um Ihre Anfrage zu beantworten, Potenziale einzuschätzen und passende TigerFlow-Leistungen vorzubereiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei vorvertraglichen Anfragen sowie Art. 6 Abs. 1 lit. f DSGVO für die strukturierte Bearbeitung eingehender Anfragen.\n\nSolange einzelne Formulare rein als Frontend-Demo ohne Speicherung betrieben werden, findet über diese Formulare keine dauerhafte Speicherung der eingegebenen Daten statt.",
  },
  {
    title: "6. Cookies und Tracking",
    content:
      "Wir nutzen Vercel Web Analytics, um allgemeine Informationen zur Nutzung dieser Website zu erhalten, zum Beispiel Seitenaufrufe, Referrer, Gerätekategorien und technische Nutzungsdaten. Die Auswertung hilft uns, die Website technisch und inhaltlich zu verbessern.\n\nEs werden keine Marketing-Tracking-Tools wie Google Analytics, Meta Pixel oder TikTok Pixel eingesetzt. Nicht notwendige Marketing-Cookies werden nicht gesetzt.\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der Analyse und Verbesserung unserer Website.",
  },
  {
    title: "7. Terminbuchung und TigerBot",
    content:
      "Auf dieser Website ist derzeit kein externes Terminbuchungstool wie Calendly eingebunden. Ebenso ist der TigerBot aktuell nicht live auf dieser Website eingebunden. Die genannten Funktionen werden als Leistungen von TigerFlow angeboten, führen aber auf dieser Website derzeit nicht zu einer zusätzlichen Datenverarbeitung durch diese Tools.\n\nSollten solche Dienste später auf dieser Website eingebunden werden, wird diese Datenschutzerklärung vor oder mit der Aktivierung entsprechend ergänzt.",
  },
  {
    title: "8. Speicherdauer",
    content:
      "Personenbezogene Daten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Anfragedaten werden gelöscht, sobald die Bearbeitung abgeschlossen ist und keine gesetzlichen oder berechtigten Gründe für eine weitere Speicherung bestehen.",
  },
  {
    title: "9. Empfänger und Dienstleister",
    content:
      "Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies zur Bereitstellung der Website, zur Bearbeitung von Anfragen oder aufgrund gesetzlicher Pflichten erforderlich ist. Als technische Dienstleister kommen insbesondere Vercel für das Hosting und künftig Supabase für Formular- und Backend-Funktionen in Betracht.",
  },
  {
    title: "10. Ihre Rechte",
    content:
      "Sie haben nach Maßgabe der DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen bestimmte Verarbeitungen. Wenn eine Verarbeitung auf Ihrer Einwilligung beruht, können Sie diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.",
  },
  {
    title: "11. Beschwerderecht",
    content:
      "Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Für Schleswig-Holstein ist zuständig:\n\nUnabhängiges Landeszentrum für Datenschutz Schleswig-Holstein (ULD)\nPostfach 71 16\n24171 Kiel\nTelefon: 0431 988-1200\nE-Mail: mail@datenschutzzentrum.de\nWebsite: www.datenschutzzentrum.de",
  },
];

export function DatenschutzPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, rgba(255,122,0,0.10), transparent 34%), #070707",
        color: C.textPri,
      }}
    >
      <main
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          padding: "120px 48px 88px",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: C.textTer,
            textDecoration: "none",
            fontSize: 13,
            marginBottom: 34,
          }}
        >
          ← Zurück zur Website
        </a>

        <div
          style={{
            border: `.5px solid ${C.borderEm}`,
            borderRadius: 14,
            background: "linear-gradient(145deg, rgba(17,17,17,0.96), rgba(8,8,8,0.98))",
            boxShadow: "0 28px 90px rgba(0,0,0,0.56)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "44px 42px 24px", borderBottom: `.5px solid ${C.border}` }}>
            <div
              style={{
                fontSize: 11,
                color: C.accent,
                textTransform: "uppercase",
                letterSpacing: ".13em",
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Datenschutz
            </div>
            <h1
              style={{
                fontSize: "clamp(34px,5vw,54px)",
                lineHeight: 1,
                letterSpacing: "-.035em",
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              Datenschutzerklärung
            </h1>
            <p style={{ color: C.textTer, fontSize: 15, lineHeight: 1.7, maxWidth: 680 }}>
              Informationen zur Verarbeitung personenbezogener Daten auf dieser Website. Stand: Juni 2026.
            </p>
          </div>

          <div style={{ padding: "10px 42px 42px" }}>
            {sections.map(({ title, content }) => (
              <section
                key={title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(210px, 0.85fr) 1.55fr",
                  gap: 28,
                  padding: "28px 0",
                  borderBottom: `.5px solid ${C.border}`,
                }}
                className="legal-row"
              >
                <h2 style={{ color: C.textSec, fontSize: 13, fontWeight: 600, letterSpacing: ".02em" }}>
                  {title}
                </h2>
                <p style={{ color: C.textPri, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-line" }}>
                  {content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
