(function () {
  "use strict";

  function isConfiguredCashfreeUrl(value) {
    if (!value || typeof value !== "string") return false;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:") return false;
      const host = url.hostname.toLowerCase();
      return host === "payments.cashfree.com" || host.endsWith(".cashfree.com") || host === "cf.pay";
    } catch (_) {
      return false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const links = window.CASHFREE_PAYMENT_LINKS || {};
    document.querySelectorAll("[data-payment-product]").forEach(function (button) {
      const productKey = button.getAttribute("data-payment-product");
      const paymentUrl = links[productKey];
      const contactUrl = button.getAttribute("data-contact-url") || "contact.html";

      if (isConfiguredCashfreeUrl(paymentUrl)) {
        button.href = paymentUrl.trim();
        button.target = "_self";
        button.rel = "noopener";
        button.classList.remove("payment-pending");
        button.setAttribute("aria-label", "Buy now using Cashfree secure checkout");
        button.title = "Pay securely using Cashfree";
      } else {
        // Safe fallback until the public Cashfree form URL is pasted in payment-links.js.
        button.href = contactUrl;
        button.classList.add("payment-pending");
        button.setAttribute("aria-label", "Contact Samriddhi Associates to purchase");
        button.title = "Cashfree checkout activation pending — contact us to purchase";
      }
    });
  });
})();
