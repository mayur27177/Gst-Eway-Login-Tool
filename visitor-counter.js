(() => {
  'use strict';

  const WORKER_ORIGIN = 'https://cashfree-license-webhook.mayurgupta9829927177.workers.dev';
  const params = new URLSearchParams(window.location.search);
  const orderId = String(params.get('order_id') || sessionStorage.getItem('samriddhi_last_order_id') || '').trim();
  const card = document.getElementById('payment-status-card');
  const icon = document.getElementById('payment-result-icon');
  const heading = document.getElementById('payment-result-heading');
  const message = document.getElementById('payment-result-message');
  const note = document.getElementById('payment-status-note');
  const details = document.getElementById('payment-order-details');
  const recheck = document.getElementById('payment-recheck');
  let attempts = 0;
  const maxAutomaticAttempts = 8;

  if (!orderId || !/^[A-Za-z0-9_-]{3,45}$/.test(orderId)) {
    render('unknown', null, 'Order ID was not found. Open the payment confirmation from the same browser or contact support with your Cashfree transaction reference.');
    return;
  }

  document.getElementById('status-order-id').textContent = orderId;
  recheck.addEventListener('click', () => {
    attempts = 0;
    recheck.hidden = true;
    checkStatus();
  });

  checkStatus();

  async function checkStatus() {
    attempts += 1;
    renderChecking();
    try {
      const response = await fetch(`${WORKER_ORIGIN}/order-status?order_id=${encodeURIComponent(orderId)}`, { cache: 'no-store' });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'Unable to verify payment status.');

      fillDetails(result);
      const status = String(result.order_status || '').toUpperCase();
      if (status === 'PAID') {
        render('paid', result);
        sessionStorage.removeItem('samriddhi_last_order_id');
        sessionStorage.removeItem('samriddhi_last_product');
        return;
      }
      if (['EXPIRED', 'TERMINATED'].includes(status)) {
        render('failed', result);
        return;
      }
      if (attempts < maxAutomaticAttempts) {
        render('pending', result);
        window.setTimeout(checkStatus, 3000);
      } else {
        render('pending-final', result);
      }
    } catch (error) {
      console.error('Payment status check failed', error);
      if (attempts < 3) {
        window.setTimeout(checkStatus, 2500);
      } else {
        render('error', null, error instanceof Error ? error.message : 'Unable to verify payment status.');
      }
    }
  }

  function fillDetails(result) {
    details.hidden = false;
    document.getElementById('status-order-id').textContent = result.order_id || orderId;
    document.getElementById('status-product').textContent = result.product_name || sessionStorage.getItem('samriddhi_last_product') || 'Software licence';
    document.getElementById('status-amount').textContent = `${result.currency || 'INR'} ₹${Number(result.amount || 0).toLocaleString('en-IN')}`;
  }

  function renderChecking() {
    card.className = 'policy payment-result-card payment-checking';
    icon.textContent = '…';
    heading.textContent = 'Verifying your payment';
    message.textContent = 'Please wait while we check the final Cashfree order status.';
    note.hidden = true;
  }

  function render(state, result, customMessage = '') {
    note.hidden = false;
    recheck.hidden = true;
    if (result) fillDetails(result);

    if (state === 'paid') {
      document.title = 'Payment Successful | Samriddhi Associates';
      document.getElementById('payment-page-title').textContent = 'Payment Successful';
      document.getElementById('payment-page-subtitle').textContent = 'Your Cashfree order has been verified as paid.';
      card.className = 'policy payment-result-card payment-paid';
      icon.textContent = '✓';
      heading.textContent = 'Thank you for your payment';
      message.textContent = 'Your licence key is being allotted and emailed to the address entered during checkout.';
      note.className = 'notice';
      note.innerHTML = '<strong>Check your inbox and Spam folder.</strong> Email delivery may take a few minutes. Do not make another payment for the same order.';
      return;
    }

    if (state === 'failed') {
      document.getElementById('payment-page-title').textContent = 'Payment Not Completed';
      document.getElementById('payment-page-subtitle').textContent = 'Cashfree did not mark this order as paid.';
      card.className = 'policy payment-result-card payment-failed';
      icon.textContent = '×';
      heading.textContent = 'Payment was not completed';
      message.textContent = 'No licence key will be allotted for this unpaid order.';
      note.className = 'notice warning';
      note.textContent = 'Return to the product page and try again. If money was debited, contact support with the order ID before making another payment.';
      return;
    }

    if (state === 'pending' || state === 'pending-final') {
      document.getElementById('payment-page-title').textContent = 'Payment Processing';
      document.getElementById('payment-page-subtitle').textContent = 'Cashfree has not yet confirmed the final paid status.';
      card.className = 'policy payment-result-card payment-pending-result';
      icon.textContent = '⌛';
      heading.textContent = 'Payment is still processing';
      message.textContent = state === 'pending' ? 'We are checking again automatically.' : 'The payment is taking longer than expected.';
      note.className = 'notice warning';
      note.textContent = 'Do not make another payment yet. Wait a few minutes and check again, or contact support with the order ID.';
      recheck.hidden = state !== 'pending-final';
      return;
    }

    document.getElementById('payment-page-title').textContent = 'Payment Status Unavailable';
    document.getElementById('payment-page-subtitle').textContent = 'We could not verify this order automatically.';
    card.className = 'policy payment-result-card payment-error';
    icon.textContent = '!';
    heading.textContent = 'Unable to verify payment';
    message.textContent = customMessage || 'Please try again or contact support.';
    note.className = 'notice warning';
    note.textContent = 'Do not rely on this page alone. Keep your Cashfree transaction reference and contact support if payment was debited.';
    recheck.hidden = false;
  }
})();
