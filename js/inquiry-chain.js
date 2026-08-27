(() => {
  'use strict';

  const form = document.getElementById('rfq');
  const result = document.getElementById('result');
  if (!form || !result) return;

  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  let lastPayload = null;
  let lastResponse = null;
  let submitting = false;

  function text(value) {
    return value == null ? '' : String(value);
  }

  function getLanguage() {
    return document.documentElement.lang || document.body?.dataset?.lang || 'en';
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return text(value);
    try {
      return new Intl.DateTimeFormat(getLanguage(), {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (_) {
      return date.toLocaleString();
    }
  }

  function escapeHtml(value) {
    return text(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function render(message, requestNumber, createdAt, emailHref) {
    result.innerHTML = `
      <div class="inquiry-success" role="status" aria-live="polite">
        <p><strong>${escapeHtml(message)}</strong></p>
        <p><strong>Request Reference:</strong> ${escapeHtml(requestNumber)}</p>
        <p><strong>Date:</strong> ${escapeHtml(formatDate(createdAt))}</p>
        ${emailHref ? `<p><a class="inquiry-email-action" href="${escapeHtml(emailHref)}">Open Email Draft</a></p>` : ''}
      </div>`;
    result.hidden = false;
  }

  function error(message) {
    result.innerHTML = `<p role="alert">${escapeHtml(message || 'Submission failed. Please try again.')}</p>`;
    result.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (submitting) return;
    submitting = true;
    if (submitButton) submitButton.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.idempotencyKey = payload.idempotencyKey || crypto.randomUUID();
      lastPayload = payload;

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-store'
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });

      const data = await response.json();
      lastResponse = data;
      if (!response.ok || !data.ok || !data.request_number || !data.created_at) {
        throw new Error(data.error || 'The request could not be confirmed.');
      }

      // First show and let the customer verify the server-issued reference/date.
      // Email is deliberately NOT opened automatically.
      const email = 'export@agro-zia.com';
      const subject = `Inquiry ${data.request_number}`;
      const body = [
        `Request Reference: ${data.request_number}`,
        `Date: ${formatDate(data.created_at)}`,
        '',
        ...Object.entries(payload)
          .filter(([key]) => key !== 'idempotencyKey')
          .map(([key, value]) => `${key}: ${value}`))
      ].join('\n');
      const emailHref = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      render('Inquiry submitted successfully', data.request_number, data.created_at, emailHref);
      form.setAttribute('aria-hidden', 'true');
    } catch (err) {
      console.error('[Agro-Zia Inquiry]', err);
      error(err.message);
    } finally {
      submitting = false;
      if (submitButton) submitButton.disabled = false;
    }
  }, { capture: true });

  window.AgroZiaInquiry = {
    getLastPayload: () => lastPayload,
    getLastResponse: () => lastResponse
  };
})();
