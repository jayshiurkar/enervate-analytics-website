(() => {
  let moveTimer = null;
  let observerStarted = false;

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function pageTop(element) {
    if (!element || !element.getBoundingClientRect) return -1;
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function isUsableElement(element) {
    if (!element || element === document.body || element === document.documentElement) return false;
    if (element.id === "root" || element.id === "industry-partners") return false;
    if (element.closest && element.closest("#industry-partners")) return false;
    if (!element.getBoundingClientRect) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function addPlacementStyles() {
    if (document.getElementById("enervate-partners-bottom-placement-css")) return;

    const style = document.createElement("style");
    style.id = "enervate-partners-bottom-placement-css";
    style.textContent = `
      #industry-partners {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding-top: clamp(2.2rem, 4vw, 3.4rem) !important;
        padding-bottom: clamp(2.2rem, 4vw, 3.4rem) !important;
      }

      #industry-partners .enervate-partners-header {
        margin-bottom: 1.4rem !important;
      }

      #industry-partners .enervate-partners-title {
        font-size: clamp(1.25rem, 2vw, 1.75rem) !important;
      }

      #industry-partners .enervate-partners-subtitle {
        font-size: 0.92rem !important;
        margin-top: 0.55rem !important;
      }

      #industry-partners .enervate-partner-card {
        width: clamp(145px, 15vw, 205px) !important;
        height: 86px !important;
        padding: 0.75rem 1rem !important;
        border-radius: 14px !important;
      }

      #industry-partners .enervate-partner-card img {
        max-height: 52px !important;
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }

      @media (max-width: 768px) {
        #industry-partners .enervate-partner-card {
          width: 145px !important;
          height: 76px !important;
          padding: 0.65rem 0.85rem !important;
        }

        #industry-partners .enervate-partner-card img {
          max-height: 44px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findBottomCtaBlock() {
    const textElements = Array.prototype.slice.call(document.querySelectorAll("h1, h2, h3, h4, p, span, div"));
    const anchors = textElements.filter((element) => {
      if (!isUsableElement(element)) return false;
      const text = cleanText(element.textContent).toUpperCase();
      return text.includes("FROM DATA TO DECISIONS") && text.length < 180;
    });

    const ctaBlocks = [];

    anchors.forEach((anchor) => {
      let current = anchor;
      let best = null;
      let steps = 0;

      while (current && current.parentElement && current.parentElement !== document.body && current.id !== "root" && steps < 10) {
        const text = cleanText(current.textContent).toUpperCase();
        const hasCtaText = text.includes("FROM DATA TO DECISIONS") && text.includes("READY TO GET STARTED");
        const reasonableSize = text.length < 1800;

        if (hasCtaText && reasonableSize && isUsableElement(current)) {
          best = current;
        }

        current = current.parentElement;
        steps += 1;
      }

      if (best) ctaBlocks.push(best);
    });

    if (!ctaBlocks.length) {
      const fallback = textElements.filter((element) => {
        if (!isUsableElement(element)) return false;
        const text = cleanText(element.textContent).toUpperCase();
        return text.includes("FROM DATA TO DECISIONS") && text.includes("READY TO GET STARTED") && text.length < 1800;
      });
      ctaBlocks.push.apply(ctaBlocks, fallback);
    }

    const unique = [];
    ctaBlocks.forEach((element) => {
      if (!unique.includes(element)) unique.push(element);
    });

    if (!unique.length) return null;

    unique.sort((a, b) => {
      const topDiff = pageTop(b) - pageTop(a);
      if (Math.abs(topDiff) > 2) return topDiff;
      return cleanText(a.textContent).length - cleanText(b.textContent).length;
    });

    return unique[0];
  }

  function reduceReadyHeadingSize(ctaBlock) {
    if (!ctaBlock) return;
    Array.prototype.slice.call(ctaBlock.querySelectorAll("h1, h2, h3")).forEach((heading) => {
      if (cleanText(heading.textContent).toLowerCase() === "ready to get started?") {
        heading.style.setProperty("font-size", "clamp(1.8rem, 3.8vw, 3rem)", "important");
        heading.style.setProperty("line-height", "1.12", "important");
      }
    });
  }

  function movePartnersSection() {
    addPlacementStyles();

    const partners = document.getElementById("industry-partners");
    const ctaBlock = findBottomCtaBlock();

    if (!partners || !ctaBlock || !ctaBlock.parentElement) return false;

    if (partners.nextElementSibling !== ctaBlock) {
      ctaBlock.parentElement.insertBefore(partners, ctaBlock);
    }

    reduceReadyHeadingSize(ctaBlock);
    return true;
  }

  function scheduleMove() {
    if (moveTimer) window.clearTimeout(moveTimer);
    moveTimer = window.setTimeout(() => {
      movePartnersSection();
    }, 120);
  }

  function runRepeatedly() {
    movePartnersSection();
    [250, 700, 1300, 2400, 4000, 6500, 9000].forEach((delay) => {
      window.setTimeout(movePartnersSection, delay);
    });
  }

  function startObserver() {
    if (observerStarted || !window.MutationObserver) return;
    observerStarted = true;

    const target = document.getElementById("root") || document.body;
    const observer = new MutationObserver(scheduleMove);
    observer.observe(target, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    runRepeatedly();
    startObserver();
  });

  window.addEventListener("load", () => {
    runRepeatedly();
    startObserver();
  });

  window.addEventListener("hashchange", runRepeatedly);
  window.addEventListener("popstate", runRepeatedly);
  document.addEventListener("click", () => window.setTimeout(runRepeatedly, 500));
})();
