document.addEventListener("DOMContentLoaded", () => {
  const products = window.SAMRIDDHI_PRODUCTS || {};
  const workerOrigin = String(window.CHECKOUT_WORKER_ORIGIN || "").replace(/\/$/, "");
  const params = new URLSearchParams(window.location.search);
  const productCode = String(params.get("product") || "").trim();
  const product = products[productCode];

  const nameEl = document.getElementById("checkout-product-name");
  const priceEl = document.getElementById("checkout-price");
  const billingEl = document.getElementById("checkout-billing");
  const noteEl = document.getElementById("checkout-product-note");
  const form = document.getElementById("checkout-form");
  const statusEl = document.getElementById("checkout-status");
  const submitBtn = document.getElementById("checkout-submit");
  const submitLabel = submitBtn ? submitBtn.querySelector(".submit-label") : null;
  const submitSpinner = submitBtn ? submitBtn.querySelector(".submit-spinner") : null;

  const setStatus = (message, type) => {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.className = `checkout-status${type ? " " + type : ""}`;
  };

  const setFieldError = (id, message) => {
    const box = document.querySelector(`[data-error-for="${id}"]`);
    if (box) box.textContent = message || "";
  };

  const clearErrors = () => {
    document.querySelectorAll("[data-error-for]").forEach((el) => {
      el.textContent = "";
    });
  };

  if (!product) {
    if (nameEl) nameEl.textContent = "Product not found";
    if (priceEl) priceEl.textContent = "—";
    if (billingEl) billingEl.textContent = "—";
    if (noteEl) {
      noteEl.textContent =
        "Open Buy Now from a product card so the correct licence is selected.";
    }
    if (form) form.hidden = true;
    setStatus("Please return to the homepage and choose a product.", "error");
    return;
  }

  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = "₹" + Number(product.amount).toLocaleString("en-IN");
  if (billingEl) billingEl.textContent = product.billing;
  if (noteEl) noteEl.textContent = product.note;

  const formatINR = (amount) =>
    "₹" + Number(amount).toLocaleString("en-IN");

  const setBusy = (busy) => {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    if (submitLabel) {
      submitLabel.textContent = busy
        ? "Creating secure payment…"
        : "Proceed to Pay — " + formatINR(product.amount);
    }
    if (submitSpinner) submitSpinner.hidden = !busy;
  };

  if (submitLabel) {
    submitLabel.textContent = "Proceed to Pay — " + formatINR(product.amount);
  }

  const mobileInput = document.getElementById("customer-mobile");
  if (mobileInput) {
    mobileInput.addEventListener("input", () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    setStatus("");

    if (!workerOrigin || workerOrigin.includes("PASTE_")) {
      setStatus(
        "Checkout worker is not configured. Add CHECKOUT_WORKER_ORIGIN in assets/checkout-config.js.",
        "error"
      );
      return;
    }

    const name = String(form.customer_name.value || "").trim();
    const mobile = String(form.customer_phone.value || "").replace(/\D/g, "");
    const email = String(form.customer_email.value || "").trim().toLowerCase();
    const consent = document.getElementById("checkout-consent");

    let ok = true;
    if (name.length < 2 || name.length > 100) {
      setFieldError("customer-name", "Enter a valid customer name.");
      ok = false;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setFieldError("customer-mobile", "Enter a valid 10-digit Indian mobile number.");
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("customer-email", "Enter a valid email address.");
      ok = false;
    }
    if (!consent || !consent.checked) {
      setFieldError("checkout-consent", "Please confirm the details and accept the policies.");
      ok = false;
    }
    if (!ok) {
      setStatus("Please correct the highlighted fields.", "error");
      return;
    }

    setBusy(true);
    setStatus("Reserving licence and creating Cashfree order…", "sending");

    try {
      const response = await fetch(workerOrigin + "/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          product_code: product.code,
          customer_name: name,
          customer_phone: mobile,
          customer_email: email
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.payment_session_id) {
        throw new Error(
          data.error || data.message || "Unable to create payment order. Please try again."
        );
      }

      if (typeof Cashfree !== "function") {
        throw new Error("Cashfree SDK failed to load. Please refresh and try again.");
      }

      const cashfree = Cashfree({
        mode: data.cashfree_mode === "sandbox" ? "sandbox" : "production"
      });

      setStatus("Opening Cashfree secure checkout…", "sending");
      const result = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

      if (result && result.error) {
        throw new Error(result.error.message || "Checkout could not be opened.");
      }
    } catch (error) {
      setBusy(false);
      setStatus(error.message || "Payment could not be started.", "error");
    }
  });
});
