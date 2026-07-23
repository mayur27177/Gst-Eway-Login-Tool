(() => {
  "use strict";

  const STORAGE_KEY = "samriddhi_visitor_counted_date_v1";
  const SOURCE = "samriddhi-site";

  function indiaDateKey() {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
      return `${map.year}-${map.month}-${map.day}`;
    } catch (_) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function isLiveWebsite() {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "gstewaylogin.in" ||
      host === "www.gstewaylogin.in" ||
      host.endsWith(".github.io");
  }

  async function recordVisit() {
    if (!isLiveWebsite()) return;

    const endpoint = String(window.VISITOR_COUNT_WEB_APP_URL || "").trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(endpoint)) return;

    const today = indiaDateKey();
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === today) return;
      window.localStorage.setItem(STORAGE_KEY, today);
    } catch (_) {
      // Continue even if browser storage is unavailable.
    }

    const requestUrl = new URL(endpoint);
    requestUrl.searchParams.set("action", "visit");
    requestUrl.searchParams.set("source", SOURCE);

    try {
      await fetch(requestUrl.toString(), {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        keepalive: true
      });
    } catch (_) {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", recordVisit, { once: true });
  } else {
    recordVisit();
  }
})();
