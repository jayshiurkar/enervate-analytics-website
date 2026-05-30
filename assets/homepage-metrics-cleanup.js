(() => {
  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function lowerText(element) {
    return cleanText(element && element.textContent).toLowerCase();
  }

  function hideElement(element) {
    if (!element || element === document.body || element === document.documentElement || element.id === "root") return;
    element.setAttribute("data-enervate-metrics-removed", "true");
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("opacity", "0", "important");
    element.style.setProperty("pointer-events", "none", "important");
  }

  function containsAllMetricLabels(text) {
    return text.includes("assessments delivered") &&
      text.includes("clients served") &&
      text.includes("scientific publications");
  }

  function findSharedMetricsBlock() {
    const candidates = Array.prototype.slice.call(document.querySelectorAll("section, div, ul, article"));

    const matches = candidates.filter((element) => {
      if (!element || element.id === "industry-partners" || element.closest("#industry-partners")) return false;
      const text = lowerText(element);
      return containsAllMetricLabels(text) && text.length < 900;
    });

    if (!matches.length) return null;

    matches.sort((a, b) => lowerText(a).length - lowerText(b).length);
    return matches[0];
  }

  function hideIndividualMetricCard(labelText) {
    const elements = Array.prototype.slice.call(document.querySelectorAll("h1, h2, h3, h4, p, span, div, li"));

    elements.forEach((element) => {
      const text = lowerText(element);
      if (!text.includes(labelText)) return;
      if (element.closest("#industry-partners")) return;

      let current = element;
      let best = element;
      let steps = 0;

      while (current && current.parentElement && current.parentElement !== document.body && current.parentElement.id !== "root" && steps < 5) {
        const parent = current.parentElement;
        const parentText = lowerText(parent);
        if (!parentText.includes(labelText)) break;
        if (parentText.length > 240) break;
        best = parent;
        current = parent;
        steps += 1;
      }

      hideElement(best);
    });
  }

  function removeHomepageMetrics() {
    const sharedBlock = findSharedMetricsBlock();

    if (sharedBlock) {
      hideElement(sharedBlock);
      return;
    }

    hideIndividualMetricCard("assessments delivered");
    hideIndividualMetricCard("clients served");
    hideIndividualMetricCard("scientific publications");
  }

  function runRepeatedly() {
    removeHomepageMetrics();
    [250, 700, 1200, 2200, 4000].forEach((delay) => {
      window.setTimeout(removeHomepageMetrics, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", runRepeatedly);
  window.addEventListener("load", runRepeatedly);
  window.addEventListener("hashchange", () => window.setTimeout(runRepeatedly, 300));
  window.addEventListener("popstate", () => window.setTimeout(runRepeatedly, 300));
})();
