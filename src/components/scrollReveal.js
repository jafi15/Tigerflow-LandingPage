export function setupScrollReveal(page, motionWindow = window) {
  const revealItems = [...page.querySelectorAll("[data-wdd-reveal]")];
  const prefersReducedMotion = motionWindow.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in motionWindow)) {
    revealItems.forEach((item) =>
      item.classList.add("wdd-reveal-visible", "wdd-reveal-complete")
    );
    return () => {};
  }

  const pendingEffects = new Map();
  const completeReveal = (target) => {
    const pendingEffect = pendingEffects.get(target);
    if (pendingEffect) {
      motionWindow.clearTimeout(pendingEffect.timeoutId);
      target.removeEventListener("transitionend", pendingEffect.handleTransitionEnd);
      pendingEffects.delete(target);
    }
    target.classList.remove("wdd-reveal-pending");
    target.classList.add("wdd-reveal-complete");
  };

  const observer = new motionWindow.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.classList.add("wdd-reveal-visible");
        const handleTransitionEnd = (event) => {
          if (event.target === target) completeReveal(target);
        };
        target.addEventListener("transitionend", handleTransitionEnd);
        const timeoutId = motionWindow.setTimeout(() => completeReveal(target), 1400);
        pendingEffects.set(target, { handleTransitionEnd, timeoutId });
        observer.unobserve(target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top <= motionWindow.innerHeight * 0.92) {
      item.classList.add("wdd-reveal-visible", "wdd-reveal-complete");
      return;
    }
    item.classList.add("wdd-reveal-pending");
    observer.observe(item);
  });

  return () => {
    observer.disconnect();
    pendingEffects.forEach(({ handleTransitionEnd, timeoutId }, target) => {
      motionWindow.clearTimeout(timeoutId);
      target.removeEventListener("transitionend", handleTransitionEnd);
    });
    pendingEffects.clear();
  };
}
