import { useEffect, useState } from "react";

// True once the page has been scrolled further than `distance` px (e.g. past a static header).
export function useScrolledPast(distance) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast((window.scrollY || document.documentElement.scrollTop) > distance);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [distance]);
  return past;
}
