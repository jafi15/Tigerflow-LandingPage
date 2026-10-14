# Social-Vorschaubilder (Open Graph)

`og-card.html` ist die Vorlage für die 1200×630-Vorschaubilder, die beim Teilen eines Links
(LinkedIn, WhatsApp, Slack, X) angezeigt werden. Die fertigen Bilder liegen in `public/og/`
und werden in `src/routes.config.js` pro Seite über `ogImage` zugeordnet. Seiten ohne eigenes
Bild (Impressum, Datenschutz, AGB, 404) verwenden `public/og/home.png`.

## Neue Karte erstellen

1. `design/og/og-card.html` im Browser öffnen, Inhalt als JSON im Hash übergeben:
   `og-card.html#{"eyebrow":"WEBDESIGN AUS HEIDE","title":"…","chip":"Websites ab 829 € netto"}`
2. Fenster auf exakt 1200×630 px stellen und einen Screenshot als PNG nach `public/og/<seite>.png` speichern
   (z. B. mit Playwright `page.screenshot()` bei `deviceScaleFactor: 1`).
3. In `src/routes.config.js` bei der Route `ogImage: "/og/<seite>.png"` eintragen.

Für Ortsnamen mit Bindestrich einen geschützten Bindestrich (U+2011) verwenden, damit der
Titel nicht am Bindestrich umbricht.
