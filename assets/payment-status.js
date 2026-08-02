document.addEventListener("DOMContentLoaded", () => {
  const workerOrigin = String(window.CHECKOUT_WORKER_ORIGIN || "").replace(/\/$/, "");
  const params = new URLSearchParams(window.location.search);
  const orderId =
    params.get("order_id") ||
    params.get("orderId") ||
    params.get("cf_order_id") ||
    "";

  const titleEl = document.getElementById("payment-status-title");
  const messageEl = document.getElementById("payment-status-message");
  const detailEl = document.getElementById("payment-status-detail");
  const cardEl = document.getElementById("payment-status-card");
  const downloadBtn = document.getElementById("payment-download-btn");

  const showDownloadFor = (productCode) => {
    if (!downloadBtn) return;
    const catalogue = window.SAMRIDDHI_PRODUCTS || {};
    const product = catalogue[productCode] || null;
    const url = product && product.downloadUrl ? String(product.downloadUrl).trim() : "";
    if (!url) {
      downloadBtn.hidden = true;
      return;
    }
    downloadBtn.href = url;
    downloadBtn.textContent = product.downloadLabel || "Download";
    downloadBtn.hidden = false;
  };

  const render = (title, message, detail, type) => {
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (detailEl) {
      detailEl.textContent = detail || "";
      detailEl.hidden = !detail;
    }
    if (cardEl) {
      cardEl.className = `card payment-status-card${type ? " " + type : ""}`;
    }
  };

  if (!orderId) {
    render(
      "Payment status unavailable",
      "No order reference was found in this page link.",
      "Return to the homepage and complete checkout again if needed.",
      "error"
    );
    return;
  }

  if (!workerOrigin || workerOrigin.includes("PASTE_")) {
    render(
      "Configuration pending",
      "Payment verification worker is not configured.",
      "Add CHECKOUT_WORKER_ORIGIN in assets/checkout-config.js.",
      "error"
    );
    return;
  }

  render(
    "Checking payment…",
    "Please wait while we verify your Cashfree payment.",
    "Order: " + orderId,
    "sending"
  );

  const poll = async (attempt) => {
    try {
      const response = await fetch(
        workerOrigin +
          "/order-status?order_id=" +
          encodeURIComponent(orderId) +
          "&fulfill=1",
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Unable to verify payment.");
      }

      const status = String(data.order_status || data.status || "").toUpperCase();

      if (status === "PAID") {
        const productCode =
          (data.license_result && data.license_result.product_code) || "";
        if (data.license_emailed) {
          showDownloadFor(productCode);
          render(
            "Payment Successful",
            "Thank you. Your payment is verified.",
            "Your licence key has been emailed to " +
              (data.customer_email || "your registered email") +
              ". Please also check Spam/Promotions. Order: " +
              orderId,
            "success"
          );
          return;
        }

        const err = String(
          data.license_error ||
            (data.license_result && data.license_result.error) ||
            ""
        ).trim();
        render(
          "Payment Successful — licence pending",
          "Payment is verified, but licence allotment/email is not confirmed.",
          (err ? "Error: " + err + " · " : "") +
            "Email: " +
            (data.customer_email || "—") +
            " · Order: " +
            orderId +
            " · Please contact support with this Order ID.",
          "error"
        );
        return;
      }

      if (status === "EXPIRED" || status === "TERMINATED" || status === "FAILED") {
        render(
          "Payment not completed",
          "This order was not paid successfully.",
          "Order: " + orderId,
          "error"
        );
        return;
      }

      if (attempt < 12) {
        render(
          "Waiting for payment confirmation…",
          "Cashfree has not marked this order as paid yet.",
          "Order: " + orderId + " · Status: " + (status || "PENDING"),
          "sending"
        );
        setTimeout(() => poll(attempt + 1), 2500);
        return;
      }

      render(
        "Still waiting for confirmation",
        "Payment verification is taking longer than expected.",
        "If money was deducted, contact +91-98299-27177 with order " + orderId + ".",
        "error"
      );
    } catch (error) {
      if (attempt < 8) {
        setTimeout(() => poll(attempt + 1), 2500);
        return;
      }
      render(
        "Verification error",
        error.message || "Could not verify payment status.",
        "Order: " + orderId,
        "error"
      );
    }
  };

  poll(0);
});
