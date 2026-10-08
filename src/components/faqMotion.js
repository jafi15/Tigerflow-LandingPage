export function createFaqCloseController({
  getDetails,
  motionWindow,
  onClosingChange,
  closeDuration = 400,
}) {
  let closeTimer = null;
  let isClosing = false;
  let disposed = false;

  const finishClose = () => {
    if (disposed) return;
    const details = getDetails();
    if (details) details.open = false;
    closeTimer = null;
    isClosing = false;
    onClosingChange(false);
  };

  const handleSummaryClick = (event) => {
    const details = getDetails();
    if (!details?.open) return;

    event.preventDefault();
    if (isClosing) return;

    const reduceMotion = motionWindow.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      details.open = false;
      onClosingChange(false);
      return;
    }

    isClosing = true;
    onClosingChange(true);
    closeTimer = motionWindow.setTimeout(finishClose, closeDuration);
  };

  const cleanup = () => {
    disposed = true;
    if (closeTimer !== null) motionWindow.clearTimeout(closeTimer);
    closeTimer = null;
    isClosing = false;
  };

  return { handleSummaryClick, cleanup };
}
