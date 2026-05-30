(() => {
  let observerStarted = false;
  let partnersData = null;
  let loadingPartners = null;
  let runTimer = null;

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function lower(value) {
    return cleanText(value).toLowerCase();
  }

  function pageTop(element) {
    if (!element || !element.getBoundingClientRect) return -1;
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function addStyles() {
    if (document.getElementById("enervate-partners-final-css")) return;

    const style = document.createElement("style");
    style.id = "enervate-partners-final-css";
    style.textContent = `
      #industry-partners:not([data-enervate-bottom-ready="true"]) { display:none !important; visibility:hidden !important; opacity:0 !important; pointer-events:none !important; }
      #industry-partners { background:radial-gradient(circle at 15% 0%, rgba(48,124,182,.18), transparent 35%), linear-gradient(180deg,#0b1118 0%,#0a1017 100%) !important; border-top:1px solid rgba(120,160,210,.16) !important; border-bottom:1px solid rgba(120,160,210,.16) !important; padding:clamp(2.2rem,4vw,3.4rem) 0 !important; margin:0 !important; overflow:hidden !important; }
      #industry-partners .enervate-partners-inner { width:min(1180px,calc(100% - 2rem)) !important; margin:0 auto !important; }
      #industry-partners .enervate-partners-header { text-align:center !important; margin-bottom:1.4rem !important; }
      #industry-partners .enervate-partners-title { color:#fff !important; font-size:clamp(1.25rem,2vw,1.75rem) !important; line-height:1.2 !important; font-weight:800 !important; margin:0 !important; }
      #industry-partners .enervate-partners-marquee { position:relative !important; overflow:hidden !important; width:100% !important; padding:.25rem 0 !important; -webkit-mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent) !important; mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent) !important; }
      #industry-partners .enervate-partners-track { display:flex !important; align-items:center !important; gap:1rem !important; width:max-content !important; animation:enervatePartnersMarqueeFinal 62s linear infinite !important; will-change:transform !important; }
      #industry-partners .enervate-partner-card { flex:0 0 auto !important; width:clamp(145px,15vw,205px) !important; height:86px !important; padding:.75rem 1rem !important; border-radius:14px !important; background:rgba(255,255,255,.96) !important; border:1px solid rgba(255,255,255,.18) !important; box-shadow:0 16px 34px rgba(0,0,0,.22) !important; display:flex !important; align-items:center !important; justify-content:center !important; }
      #industry-partners .enervate-partner-card img { display:block !important; max-height:52px !important; max-width:100% !important; width:auto !important; height:auto !important; object-fit:contain !important; }
      #industry-partners .enervate-partners-marquee:hover .enervate-partners-track { animation-play-state:paused !important; }
      @keyframes enervatePartnersMarqueeFinal { from { transform:translateX(0); } to { transform:translateX(-50%); } }
      @media (max-width:768px) { #industry-partners .enervate-partner-card { width:145px !important; height:76px !important; padding:.65rem .85rem !important; } #industry-partners .enervate-partner-card img { max-height:44px !important; } }
      @media (prefers-reduced-motion:reduce) { #industry-partners .enervate-partners-track { animation:none !important; flex-wrap:wrap !important; justify-content:center !important; width:100% !important; } #industry-partners .enervate-partners-marquee { -webkit-mask-image:none !important; mask-image:none !important; } }
    `;
    document.head.appendChild(style);
  }

  function parsePartnersScript(scriptText) {
    const match = scriptText.match(/const\s+p\s*=\s*(\[[\s\S]*?\]);\s*const\s+n\s*=/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function loadPartnersData() {
    if (partnersData) return Promise.resolve(partnersData);
    if (loadingPartners) return loadingPartners;
    loadingPartners = fetch("/assets/partners-carousel.js", { cache: "force-cache" })
      .then((response) => response.text())
      .then((text) => {
        partnersData = parsePartnersScript(text);
        return partnersData;
      })
      .catch(() => null);
    return loadingPartners;
  }

  function isUsableCtaCandidate(element) {
    if (!element || element === document.body || element === document.documentElement) return false;
    if (element.id === "root" || element.id === "industry-partners") return false;
    if (element.closest && element.closest("#industry-partners")) return false;
    if (!element.getBoundingClientRect) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findBottomCtaBlock() {
    const textElements = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,p,span,div"));
    const anchors = textElements.filter((element) => {
      if (!isUsableCtaCandidate(element)) return false;
      const text = cleanText(element.textContent).toUpperCase();
      return text.includes("FROM DATA TO DECISIONS") && text.length < 180;
    });

    const blocks = [];
    anchors.forEach((anchor) => {
      let current = anchor;
      let best = null;
      let steps = 0;
      while (current && current.parentElement && current.parentElement !== document.body && current.id !== "root" && steps < 10) {
        const text = cleanText(current.textContent).toUpperCase();
        if (text.includes("FROM DATA TO DECISIONS") && text.includes("READY TO GET STARTED") && text.length < 1800 && isUsableCtaCandidate(current)) best = current;
        current = current.parentElement;
        steps += 1;
      }
      if (best) blocks.push(best);
    });

    const unique = [];
    blocks.forEach((element) => { if (!unique.includes(element)) unique.push(element); });
    if (!unique.length) return null;
    unique.sort((a, b) => pageTop(b) - pageTop(a));
    return unique[0];
  }

  function createPartnersSection(partners) {
    const section = document.createElement("section");
    section.id = "industry-partners";
    section.className = "enervate-partners-section";
    section.setAttribute("aria-labelledby", "enervate-partners-heading");
    section.innerHTML = `<div class="enervate-partners-inner"><div class="enervate-partners-header"><h2 id="enervate-partners-heading" class="enervate-partners-title">Working across Alberta</h2></div><div class="enervate-partners-marquee" aria-label="Industry partner logos"><div class="enervate-partners-track"></div></div></div>`;

    const track = section.querySelector(".enervate-partners-track");
    partners.concat(partners).forEach((partner, index) => {
      const card = document.createElement("div");
      card.className = "enervate-partner-card";
      const img = document.createElement("img");
      img.src = partner.s;
      img.alt = index < partners.length ? partner.n : "";
      img.loading = "lazy";
      img.decoding = "async";
      if (index >= partners.length) img.setAttribute("aria-hidden", "true");
      card.appendChild(img);
      track.appendChild(card);
    });
    return section;
  }

  function placePartnersSection(partners) {
    addStyles();
    const ctaBlock = findBottomCtaBlock();
    if (!ctaBlock || !ctaBlock.parentElement) return;

    let section = document.getElementById("industry-partners");
    if (!section) section = createPartnersSection(partners);
    section.removeAttribute("data-enervate-bottom-ready");
    if (section.nextElementSibling !== ctaBlock) ctaBlock.parentElement.insertBefore(section, ctaBlock);

    Array.prototype.slice.call(document.querySelectorAll("#industry-partners")).forEach((other) => {
      if (other !== section) other.remove();
    });

    Array.prototype.slice.call(ctaBlock.querySelectorAll("h1,h2,h3")).forEach((heading) => {
      if (lower(heading.textContent) === "ready to get started?") {
        heading.style.setProperty("font-size", "clamp(1.8rem,3.8vw,3rem)", "important");
        heading.style.setProperty("line-height", "1.12", "important");
      }
    });

    section.setAttribute("data-enervate-bottom-ready", "true");
  }

  function findCompactMetricCard(labelElement) {
    let current = labelElement;
    let best = labelElement;
    let steps = 0;
    while (current && current.parentElement && current.parentElement !== document.body && current.parentElement.id !== "root" && steps < 5) {
      const parent = current.parentElement;
      const text = lower(parent.textContent);
      if (!text.includes("scientific publications")) break;
      if (text.length > 260) break;
      best = parent;
      current = parent;
      steps += 1;
    }
    return best;
  }

  function replaceScientificPublicationsMetric() {
    const textNodes = [];
    if (document.body && window.NodeFilter) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (/scientific\s+publications/i.test(node.nodeValue || "")) textNodes.push(node);
      }
    }

    textNodes.forEach((node) => {
      node.nodeValue = (node.nodeValue || "").replace(/Scientific\s+Publications/gi, "Decision frameworks delivered");
    });

    Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,p,span,div,li")).forEach((element) => {
      if (!lower(element.textContent).includes("decision frameworks delivered")) return;
      if (element.closest && element.closest("#industry-partners")) return;

      const card = findCompactMetricCard(element);
      Array.prototype.slice.call(card.querySelectorAll("h1,h2,h3,h4,p,span,div,strong")).forEach((item) => {
        const text = cleanText(item.textContent);
        if (/^4\+?$/.test(text)) item.textContent = "14";
      });

      const ownText = cleanText(card.textContent);
      if (/^4\s*Decision frameworks delivered$/i.test(ownText)) {
        card.textContent = "14 Decision frameworks delivered";
      }
    });
  }

  function run() {
    replaceScientificPublicationsMetric();
    loadPartnersData().then((partners) => {
      if (partners) placePartnersSection(partners);
      replaceScientificPublicationsMetric();
    });
  }

  function runRepeatedly() {
    run();
    [150, 350, 700, 1200, 2200, 4000, 6500, 9000].forEach((delay) => window.setTimeout(run, delay));
  }

  function scheduleRun() {
    if (runTimer) window.clearTimeout(runTimer);
    runTimer = window.setTimeout(run, 100);
  }

  function startObserver() {
    if (observerStarted || !window.MutationObserver) return;
    observerStarted = true;
    const target = document.getElementById("root") || document.body;
    new MutationObserver(scheduleRun).observe(target, { childList: true, subtree: true, characterData: true });
  }

  document.addEventListener("DOMContentLoaded", () => { runRepeatedly(); startObserver(); });
  window.addEventListener("load", () => { runRepeatedly(); startObserver(); });
  window.addEventListener("hashchange", runRepeatedly);
  window.addEventListener("popstate", runRepeatedly);
})();
