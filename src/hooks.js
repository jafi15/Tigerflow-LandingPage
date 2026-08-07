import { useState, useEffect, useRef } from "react";

export function useTyped(words) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [done, setDone] = useState(false);
  const t = useRef(null);

  useEffect(() => {
    if (done) return;
    const word = words[wi];
    const clr = () => clearTimeout(t.current);
    if (phase === "typing") {
      if (ci < word.length) {
        t.current = setTimeout(() => {
          setDisplay(word.slice(0, ci + 1));
          setCi((c) => c + 1);
        }, 46 + Math.random() * 18);
      } else {
        if (wi === words.length - 1) {
          t.current = setTimeout(() => setDone(true), 0);
          return;
        }
        t.current = setTimeout(() => setPhase("deleting"), 2400);
      }
    } else {
      if (ci > 0) {
        t.current = setTimeout(() => {
          setDisplay(word.slice(0, ci - 1));
          setCi((c) => c - 1);
        }, 26);
      } else {
        t.current = setTimeout(() => {
          setWi((i) => i + 1);
          setPhase("typing");
        }, 300);
      }
    }
    return clr;
  }, [phase, ci, wi, done, words]);

  return { display, done };
}

export function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useMouseParallax(strength = 1) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      target.current = {
        x: ((e.clientX - cx) / cx) * strength,
        y: ((e.clientY - cy) / cy) * strength,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.055;
      current.current.y += (target.current.y - current.current.y) * 0.055;
      setPos({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [strength]);

  return pos;
}
