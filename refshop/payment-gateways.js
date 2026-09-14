(() => {
  'use strict';

  const API_BASE = '/api/payments';
  let config = {
    loaded: false,
    reachable: false,
    environment: 'unavailable',
    stripe: { configured: false },
    paypal: { configured: false, clientId: '' },
    offline: { bankTransfer: true, purchaseOrder: true, storeValue: true }
  };

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    let body = {};
    try { body = await response.json(); } catch { /* preserve HTTP status below */ }
    if (!response.ok) throw new Error(body.error || body.message || `Payment service returned ${response.status}`);
    return body;
  }

  async function loadConfig() {
    try {
      const remote = await request('/config');
      config = { ...config, ...remote, loaded: true, reachable: true };
    } catch (error) {
      config = { ...config, loaded: true, reachable: false, error: error.message };
    }
    window.dispatchEvent(new CustomEvent('refshop:payments-config', { detail: config }));
    return config;
  }

  async function startStripeCheckout(payload) {
    const result = await request('/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!result.url) throw new Error('Stripe Checkout did not return a redirect URL.');
    window.location.assign(result.url);
  }

  async function verifyStripeSession(sessionId) {
    return request(`/stripe/session/${encodeURIComponent(sessionId)}`);
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (window.paypal) return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load the PayPal JavaScript SDK.'));
      document.head.appendChild(script);
    });
  }

  async function mountPayPal(container, payload) {
    if (!container) throw new Error('PayPal button container is unavailable.');
    if (!config.loaded) await loadConfig();
    if (!config.paypal?.configured || !config.paypal?.clientId) {
      throw new Error('PayPal is installed but not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the payment server environment.');
    }

    const currency = encodeURIComponent(payload.currency || 'USD');
    const clientId = encodeURIComponent(config.paypal.clientId);
    await loadScript(`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons`, 'refshop-paypal-sdk');
    container.innerHTML = '';

    if (!window.paypal?.Buttons) throw new Error('PayPal Buttons did not initialize.');

    const buttons = window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'paypal', height: 48 },
      createOrder: async () => {
        const result = await request('/paypal/order', { method: 'POST', body: JSON.stringify(payload) });
        return result.id;
      },
      onApprove: async (data) => {
        const result = await request(`/paypal/order/${encodeURIComponent(data.orderID)}/capture`, { method: 'POST', body: JSON.stringify({ checkoutId: payload.checkoutId }) });
        if (typeof window.RefShopPaymentCompleted === 'function') {
          window.RefShopPaymentCompleted({ ...result, checkoutId: payload.checkoutId, customer: payload.customer }, 'paypal');
        }
      },
      onCancel: () => {
        window.dispatchEvent(new CustomEvent('refshop:payment-message', { detail: { type: 'info', message: 'PayPal checkout was cancelled. Your cart has not been changed.' } }));
      },
      onError: (error) => {
        window.dispatchEvent(new CustomEvent('refshop:payment-message', { detail: { type: 'error', message: error?.message || 'PayPal could not complete the payment.' } }));
      }
    });

    if (!buttons.isEligible()) throw new Error('PayPal is not eligible in this browser or merchant configuration.');
    await buttons.render(container);
  }

  window.RefShopPayments = {
    loadConfig,
    startStripeCheckout,
    verifyStripeSession,
    mountPayPal,
    get config() { return config; }
  };
})();
