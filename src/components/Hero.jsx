import { C } from "../theme";
import { useTyped, useMouseParallax } from "../hooks";
import { GridBg } from "./GridBg";
import { HeroSystemCorridor } from "./HeroSystemCorridor";
import { ProjectCheck } from "./ProjectCheck";

const TYPED_WORDS = [
  "Systeme, die jagen.",
  "Systeme, die qualifizieren.",
  "Systeme, die skalieren.",
  "Systeme, die schneller verkaufen.",
];

export function Hero() {
  const { display, done } = useTyped(TYPED_WORDS);
  const mouse = useMouseParallax(1);

  return (
    <section
      className="hero-system-layout"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "64px",
      }}
    >
      <GridBg mx={mouse.x} my={mouse.y} />
      <HeroSystemCorridor mx={mouse.x} my={mouse.y} />

      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "560px",
          padding: "0 48px",
          margin: "0",
          textAlign: "left",
        }}
      >
        <h1
          className="fu0 hero-h1"
          style={{
            fontSize: "clamp(40px,6vw,70px)",
            fontFamily: "'Space Grotesk','Inter',-apple-system,sans-serif",
            fontWeight: 600,
            letterSpacing: "-.02em",
            lineHeight: 1.01,
            color: C.textPri,
            marginBottom: "2px",
          }}
        >
          Wir bauen
        </h1>
        <div
          className="fu1 hero-h1 hero-typing-line"
          style={{
            fontSize: "clamp(40px,6vw,70px)",
            fontFamily: "'Space Grotesk','Inter',-apple-system,sans-serif",
            fontWeight: 600,
            letterSpacing: "-.02em",
            lineHeight: 1.01,
            color: C.textPri,
            minHeight: "1.06em",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "flex-start",
            marginBottom: "28px",
          }}
        >
          <span>{display}</span>
          <span
            className={`hero-typing-cursor${done ? " is-done" : ""}`}
            style={{
              display: "inline-block",
              width: "3px",
              height: ".82em",
              background: C.accent,
              marginLeft: "3px",
              verticalAlign: "middle",
              borderRadius: "1px",
              animation: done ? undefined : "blink 1.1s step-end infinite",
              transition: "background .3s",
            }}
          />
        </div>

        <p
          className="fu2"
          style={{
            fontSize: "17px",
            fontWeight: 300,
            lineHeight: 1.72,
            color: C.textTer,
            letterSpacing: "-.005em",
            maxWidth: "420px",
            marginBottom: "40px",
          }}
        >
          TigerFlow automatisiert Leads, Anfragen und Prozesse —<br />
          mit TigerBot, Voice Agents und Systemen, die rund um die Uhr arbeiten.
        </p>

        <div className="fu3">
          <ProjectCheck />
        </div>

      </div>

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.28,
        }}
        className="fu4 hero-scroll-indicator"
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: ".1em",
            color: C.textTer,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: ".5px",
            height: "28px",
            background: `linear-gradient(to bottom,${C.textTer},transparent)`,
          }}
        />
      </div>
    </section>
  );
}
