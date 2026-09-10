const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

const state = { rfqs: [], quotes: [], orders: [] };

function api(path, options = {}) {
  return fetch(path, { credentials: 'include', ...options }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `request_failed_${response.status}`);
    return data;
  });
}

function renderList(target, items, empty) {
  const node = document.querySelector(target);
  if (!node) return;
  if (!items.length) {
    node.innerHTML = `<div class="empty-state">${esc(empty)}</div>`;
    return;
  }
  node.innerHTML = items.map((item) => `<article class="ops-card">
    <div><strong>${esc(item.request_number || item.reference || item.quote_number || item.order_number || item.id)}</strong></div>
    <div>${esc(item.product_name || item.company || '')}</div>
    <span class="status-pill">${esc(item.status || 'pending')}</span>
    ${target === '#supplier-rfqs' ? `<div style="margin-top:10px"><button type="button" class="z-btn z-small" data-rfq-quote="${esc(item.id)}">Create draft quote</button></div>` : ''}
    ${target === '#supplier-quotes' ? `<div style="margin-top:10px"><button type="button" class="z-btn z-small" data-quote-view="${esc(item.id)}">View quote</button></div>` : ''}
  </article>`).join('');
}

function positiveMinor(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new Error(`${label}_invalid`);
  return n;
}

async function createDraftQuote(rfq) {
  const productId = rfq.product_id || prompt('Product ID:', '');
  if (rfq.product_id && !productId) return;
  const unitPrice = prompt('Unit price (minor currency units):', '');
  if (unitPrice === null) return;
  const currency = prompt('Currency (e.g. USD):', 'USD');
  if (currency === null) return;
  const leadTime = prompt('Lead time:', '');
  if (leadTime === null) return;
  const validityUntil = prompt('Validity until (ISO date/time, optional):', '');
  if (validityUntil === null) return;
  const paymentTerms = prompt('Payment terms (optional):', '');
  if (paymentTerms === null) return;
  const incoterm = prompt('Incoterm (optional):', '');
  if (incoterm === null) return;
  const destination = prompt('Destination (optional):', rfq.destination_country || '');
  if (destination === null) return;
  const notes = prompt('Quote notes (optional):', '');
  if (notes === null) return;

  const body = {
    rfq_id: rfq.id,
    product_id: productId || null,
    product_name: rfq.product_name || 'RFQ',
    quantity: rfq.quantity || '',
    unit_price_minor: positiveMinor(unitPrice, 'unit_price'),
    currency: String(currency).trim().toUpperCase(),
    packaging_cost_minor: 0,
    shipping_cost_minor: 0,
    insurance_cost_minor: 0,
    other_fees_minor: 0,
    lead_time: leadTime.trim() || null,
    validity_until: validityUntil.trim() || null,
    payment_terms: paymentTerms.trim() || null,
    incoterm: incoterm.trim() || null,
    destination: destination.trim() || null,
    notes: notes.trim() || null,
  };

  const result = await api('/api/supplier/quotes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return result.quote;
}

async function sendQuote(id) {
  return api(`/api/supplier/quotes/${encodeURIComponent(id)}/actions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'send' }),
  });
}

async function quoteDetail(id) {
  return api(`/api/supplier/quotes/${encodeURIComponent(id)}`);
}

function showError(message) {
  const node = document.querySelector('#supplier-error');
  if (node) node.textContent = message || 'The supplier operation failed.';
}

async function openQuote(id) {
  try {
    const data = await quoteDetail(id);
    const q = data.quote;
    const action = q.status === 'draft' ? confirm(`Quote ${q.quote_number} is a draft. Send it to the customer now?`) : false;
    if (action) await sendQuote(id);
    await loadWorkspace();
  } catch (error) {
    showError(error.message);
  }
}

async function loadWorkspace() {
  try {
    const data = await api('/api/supplier/workspace');
    state.rfqs = data.rfqs || [];
    state.quotes = data.quotes || [];
    state.orders = data.orders || [];
    renderList('#supplier-rfqs', state.rfqs, 'No RFQs are available.');
    renderList('#supplier-quotes', state.quotes, 'No quotes are available.');
    renderList('#supplier-orders', state.orders, 'No orders are available.');
    const identity = document.querySelector('#supplier-identity');
    if (identity) identity.textContent = data.supplier?.name || 'Supplier workspace';

    document.querySelectorAll('[data-rfq-quote]').forEach((button) => {
      button.addEventListener('click', async () => {
        const rfq = state.rfqs.find((item) => item.id === button.dataset.rfqQuote);
        if (!rfq) return;
        try {
          button.disabled = true;
          const quote = await createDraftQuote(rfq);
          if (confirm(`Draft ${quote.quote_number} created. Send to customer now?`)) await sendQuote(quote.id);
          await loadWorkspace();
        } catch (error) {
          showError(error.message);
          button.disabled = false;
        }
      });
    });

    document.querySelectorAll('[data-quote-view]').forEach((button) => {
      button.addEventListener('click', () => openQuote(button.dataset.quoteView));
    });
  } catch (error) {
    showError(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadWorkspace);
