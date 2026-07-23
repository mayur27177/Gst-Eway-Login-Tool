document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("visitorContactForm");
  const iframe = document.getElementById("contactSubmitFrame");
  const statusBox = document.getElementById("contactFormStatus");
  const submitButton = document.getElementById("contactSubmitButton");
  const endpoint = String(window.CONTACT_FORM_WEB_APP_URL || "").trim();

  if (!form || !iframe || !statusBox || !submitButton) return;

  let submitted = false;

  const setStatus = (message, type) => {
    statusBox.textContent = message;
    statusBox.className = `form-status ${type || ""}`.trim();
    statusBox.hidden = false;
  };

  const normalizeMobile = (value) => value.replace(/[^\d+]/g, "");

  form.addEventListener("submit", (event) => {
    const name = form.elements.name.value.trim();
    const mobile = normalizeMobile(form.elements.mobile.value.trim());
    const email = form.elements.email.value.trim();
    const message = form.elements.customMessage.value.trim();
    const honey = form.elements.website.value.trim();

    form.elements.mobile.value = mobile;

    if (honey) {
      event.preventDefault();
      setStatus("Submission could not be processed.", "error");
      return;
    }

    if (!endpoint || endpoint.includes("PASTE_GOOGLE_APPS_SCRIPT")) {
      event.preventDefault();
      setStatus(
        "Contact form setup is pending. Add the Google Apps Script Web App URL.",
        "error"
      );
      return;
    }

    if (name.length < 2 || name.length > 100) {
      event.preventDefault();
      setStatus("Please enter a valid Visitor Name.", "error");
      form.elements.name.focus();
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(mobile)) {
      event.preventDefault();
      setStatus("Please enter a valid Mobile number.", "error");
      form.elements.mobile.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      event.preventDefault();
      setStatus("Please enter a valid Email address.", "error");
      form.elements.email.focus();
      return;
    }

    if (message.length < 3 || message.length > 2000) {
      event.preventDefault();
      setStatus("Custom Message must be between 3 and 2000 characters.", "error");
      form.elements.customMessage.focus();
      return;
    }

    form.action = endpoint;
    submitted = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    setStatus("Submitting your message...", "sending");
  });

  iframe.addEventListener("load", () => {
    if (!submitted) return;

    submitted = false;
    submitButton.disabled = false;
    submitButton.textContent = "OK — Send Message";
    form.reset();
    setStatus(
      "Thank you. Your message has been submitted successfully.",
      "success"
    );
  });
});
