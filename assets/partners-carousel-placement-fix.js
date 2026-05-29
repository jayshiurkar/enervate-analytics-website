(() => {
  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function isVisible(element) {
    if (!element || !element.getBoundingClientRect) return false;
    var rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findBestCtaBlock() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("section, main > div, body > div, div"));
    var valid = candidates.filter(function (element) {
      if (!element || element.id === "industry-partners" || element.closest("#industry-partners")) return false;
      var text = cleanText(element.textContent).toUpperCase();
      return text.indexOf("FROM DATA TO DECISIONS") !== -1 && text.indexOf("READY TO GET STARTED") !== -1;
    }).filter(isVisible);

    if (!valid.length) {
      var textMatches = Array.prototype.slice.call(document.querySelectorAll("h1, h2, h3, p, span, div"))
        .filter(function (element) {
          return cleanText(element.textContent).toUpperCase().indexOf("FROM DATA TO DECISIONS") !== -1;
        });

      textMatches.forEach(function (element) {
        var current = element;
        var steps = 0;
        while (current && current.parentElement && current.parentElement !== document.body && current.id !== "root" && steps < 8) {
          var text = cleanText(current.textContent).toUpperCase();
          if (text.indexOf("FROM DATA TO DECISIONS") !== -1 && text.indexOf("READY TO GET STARTED") !== -1 && isVisible(current)) {
            valid.push(current);
            break;
          }
          current = current.parentElement;
          steps += 1;
        }
      });
    }

    if (!valid.length) return null;

    valid.sort(function (a, b) {
      return (b.getBoundingClientRect().top + window.scrollY) - (a.getBoundingClientRect().top + window.scrollY);
    });

    return valid[0];
  }

  function reduceReadyHeadingSize(ctaBlock) {
    if (!ctaBlock) return;
    Array.prototype.slice.call(ctaBlock.querySelectorAll("h1, h2, h3")).forEach(function (heading) {
      if (cleanText(heading.textContent).toLowerCase() === "ready to get started?") {
        heading.style.setProperty("font-size", "clamp(1.8rem, 3.8vw, 3rem)", "important");
        heading.style.setProperty("line-height", "1.12", "important");
      }
    });
  }

  function movePartnersSection() {
    var partners = document.getElementById("industry-partners");
    var ctaBlock = findBestCtaBlock();

    if (!partners || !ctaBlock || !ctaBlock.parentElement) return;
    if (partners.nextElementSibling !== ctaBlock) {
      ctaBlock.parentElement.insertBefore(partners, ctaBlock);
    }

    reduceReadyHeadingSize(ctaBlock);
  }

  function runDelayed() {
    movePartnersSection();
    setTimeout(movePartnersSection, 300);
    setTimeout(movePartnersSection, 900);
    setTimeout(movePartnersSection, 1800);
    setTimeout(movePartnersSection, 3500);
  }

  document.addEventListener("DOMContentLoaded", runDelayed);
  window.addEventListener("load", runDelayed);
  window.addEventListener("hashchange", runDelayed);
  window.addEventListener("popstate", runDelayed);
  document.addEventListener("click", function () {
    setTimeout(runDelayed, 500);
  });
})();
