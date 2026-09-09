const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

const state = {
  rfqs: [],
  quotes: [],
  orders: [],
};

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
    <div><strong>${esc(item.reference || item.quote_number || item.order_number || item.id)}</strong></div>
    <div>${esc(item.product_name || item.company || '')}</div>
    <span class="status-pill">${esc(item.status || 'pending')}</span>
  </article>`).join('');
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
  } catch (error) {
    const node = document.querySelector('#supplier-error');
    if (node) node.textContent = error.message;
  }
}

document.addEventListener('DOMContentLoaded', loadWorkspace);
