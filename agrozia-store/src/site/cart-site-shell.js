const header = () => `<header class="site-header"><a class="brand" href="/">AGRO-ZIA <span>AGRICULTURE • ENGINEERING • TRADE</span></a><nav><a href="/">Home</a><a href="/products">Products</a><a href="/suppliers">Suppliers</a><a href="/rfq">RFQ / Request</a><a class="active" href="/cart">Cart</a><a href="/orders">Orders</a><a href="/account">Account</a></nav></header>`;
const styles = `<style>*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;color:#17321f;background:#f7faf7;line-height:1.55}.site-header{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:18px 5%;background:#fff;border-bottom:1px solid #dfe8df;position:sticky;top:0;z-index:5}.brand{font-weight:800;color:#17321f;text-decoration:none;font-size:20px}.brand span{display:block;font-size:9px;letter-spacing:1.5px;font-weight:600;margin-top:3px}nav{display:flex;gap:16px;flex-wrap:wrap;justify-content:flex-end}nav a{color:#31513b;text-decoration:none;font-size:14px}.active{font-weight:800;color:#17321f}.wrap{max-width:1100px;margin:auto;padding:55px 5%}.hero{background:#eaf4eb;border-radius:22px;padding:38px;margin-bottom:28px}.eyebrow{font-size:12px;letter-spacing:1.8px;font-weight:800;text-transform:uppercase}.hero h1{font-size:42px;line-height:1.1;margin:10px 0 14px}.lead,.muted{color:#657569;font-size:14px}.grid{display:grid;grid-template-columns:2fr 1fr;gap:20px}.card{background:#fff;border:1px solid #dfe8df;border-radius:16px;padding:22px}.item{display:grid;grid-template-columns:1fr auto;gap:18px;padding:18px 0;border-bottom:1px solid #e5ece5}.item:last-child{border-bottom:0}.item h3{margin:0 0 5px}.qty{width:110px;padding:9px;border:1px solid #cbd8cc;border-radius:8px}.price{font-weight:800}.btn{display:inline-block;border:0;border-radius:9px;padding:11px 16px;text-decoration:none;cursor:pointer;font-weight:800}.primary{background:#17321f;color:#fff}.secondary{background:#edf4ee;color:#17321f}.danger{background:#fff0ee;color:#8b3026}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.state{padding:30px;border:1px dashed #cbd8cc;border-radius:12px;background:#fbfdfb}.error{color:#8b3026}.summary-row{display:flex;justify-content:space-between;gap:15px;padding:9px 0}.summary-total{border-top:1px solid #dfe8df;margin-top:12px;padding-top:16px;font-size:18px;font-weight:800}footer{padding:35px 5%;background:#17321f;color:#fff;margin-top:30px}footer p{opacity:.8}.small{font-size:12px;color:#657569}@media(max-width:760px){.site-header{display:block}.site-header nav{margin-top:15px;justify-content:flex-start}.hero h1{font-size:32px}.grid{grid-template-columns:1fr}.item{grid-template-columns:1fr}.site-header{position:static}}</style>`;

const clientScript = `<script>
(() => {
  const root = document.getElementById('cart-app');
  if (!root) return;
  const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const money = (value, currency) => {
    const n = Number(value);
    if (!Number.isFinite(n) || !currency) return 'Price validated at checkout';
    try { return new Intl.NumberFormat(undefined, { style:'currency', currency }).format(n); } catch { return `${esc(currency)} ${n}`; }
  };
  const state = { cart: null, loading: true, error: null, busy: false };
  function render() {
    if (state.loading) { root.innerHTML = '<div class="state">Loading your cart…</div>'; return; }
    if (state.error) { root.innerHTML = `<div class="state error"><strong>Cart service unavailable.</strong><p>${esc(state.error)}</p><a class="btn secondary" href="/products">Continue Shopping</a></div>`; return; }
    const cart = state.cart || { items: [] };
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      root.innerHTML = '<div class="state"><h2>Your cart is empty</h2><p class="lead">Add a published direct-sale product to continue.</p><a class="btn primary" href="/products">Browse Products</a></div>';
      return;
    }
    const currency = cart.currency || cart.items[0]?.currency || null;
    const items = cart.items.map(item => {
      const fixed = item.price_min != null && item.price_max != null && Number(item.price_min) === Number(item.price_max);
      const unitPrice = fixed ? money(item.price_min, item.currency || currency) : 'Price validated at checkout';
      return `<article class="item"><div><h3>${esc(item.name || 'Product')}</h3><p class="muted">${esc(item.brand || '')}${item.unit ? ` · Unit: ${esc(item.unit)}` : ''}</p><span class="price">${unitPrice}</span></div><div><label class="small" for="qty-${esc(item.product_id)}">Quantity</label><input id="qty-${esc(item.product_id)}" class="qty" data-qty="${esc(item.product_id)}" value="${esc(item.quantity)}" inputmode="decimal"><div class="actions"><button class="btn secondary" data-update="${esc(item.product_id)}">Update</button><button class="btn danger" data-remove="${esc(item.product_id)}">Remove</button></div></div></article>`;
    }).join('');
    root.innerHTML = `<div class="grid"><section class="card"><h2>Cart Items</h2>${items}<div class="actions"><a class="btn secondary" href="/products">Continue Shopping</a><a class="btn secondary" href="/rfq">Request a Quote Instead</a><button class="btn danger" data-clear>Clear Cart</button></div></section><aside class="card"><h2>Order Summary</h2><div class="summary-row"><span>Items</span><strong>${cart.items.length}</strong></div><div class="summary-row"><span>Currency</span><strong>${esc(currency || 'Pending')}</strong></div><div class="summary-total">Direct-sale terms validated by commerce API</div><div class="actions"><a class="btn primary" href="/checkout">Proceed to Checkout</a></div><p class="small">Only published products with final fixed pricing can enter this cart. B2B/RFQ-only products remain on the quotation path.</p></aside></div>`;
  }
  async function request(url, options = {}) {
    const response = await fetch(url, { credentials:'same-origin', ...options, headers:{ 'content-type':'application/json', ...(options.headers || {}) } });
    let data = null; try { data = await response.json(); } catch {}
    if (response.status === 401) throw new Error('Please sign in before using the cart.');
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'cart_service_unavailable');
    return data.cart;
  }
  async function load() {
    state.loading = true; state.error = null; render();
    try { state.cart = await request('/api/cart', { method:'GET', headers:{} }); }
    catch (error) { state.error = error.message || 'cart_service_unavailable'; }
    state.loading = false; render();
  }
  async function mutate(action) {
    if (state.busy) return;
    state.busy = true;
    try { state.cart = await action(); state.error = null; }
    catch (error) { state.error = error.message || 'cart_service_unavailable'; }
    state.busy = false; render();
  }
  root.addEventListener('click', event => {
    const update = event.target.closest('[data-update]');
    const remove = event.target.closest('[data-remove]');
    const clear = event.target.closest('[data-clear]');
    if (update) {
      const id = update.dataset.update;
      const input = root.querySelector(`[data-qty="${CSS.escape(id)}"]`);
      mutate(() => request('/api/cart/items', { method:'POST', body:JSON.stringify({ product_id:id, quantity:input?.value }) }));
    } else if (remove) {
      mutate(() => request('/api/cart/items', { method:'DELETE', body:JSON.stringify({ product_id:remove.dataset.remove }) }));
    } else if (clear) {
      mutate(() => request('/api/cart', { method:'DELETE', body:JSON.stringify({}) }));
    }
  });
  load();
})();
</script>`;

export function cartSiteShell(pathname = "/cart") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cart — AGRO-ZIA</title>${styles}</head><body>${header()}<main class="wrap"><section class="hero"><div class="eyebrow">Commerce Cart</div><h1>Your agricultural order</h1><p class="lead">Review your real cart, quantities and validated direct-sale terms before continuing to checkout.</p></section><div id="cart-app" aria-live="polite"><div class="state">Loading your cart…</div></div></main><footer><strong>AGRO-ZIA</strong><p>Agricultural Solutions Beyond Borders.</p></footer>${clientScript}</body></html>`;
}

export function cartSiteResponse(pathname = "/cart") { return new Response(cartSiteShell(pathname), {headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}}); }
