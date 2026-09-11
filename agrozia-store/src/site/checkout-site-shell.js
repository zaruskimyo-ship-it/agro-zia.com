const NAV = [
  ["Home", "/"], ["Products", "/products"], ["Suppliers", "/suppliers"],
  ["RFQ", "/rfq"], ["Cart", "/cart"], ["Orders", "/orders"], ["Account", "/account"]
];

function esc(value = "") {
  return String(value).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

function header() {
  return `<header class="site-header"><div class="nav-wrap"><a class="brand" href="/">AGRO-ZIA</a><nav>${NAV.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav><button class="menu" type="button">Menu</button></div></header>`;
}

function footer() {
  return `<footer><strong>AGRO-ZIA</strong><span>AGRICULTURE • ENGINEERING • TRADE</span><small>Agricultural Solutions Beyond Borders.</small></footer>`;
}

function layout(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — AGRO-ZIA</title><style>
  :root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17221b;background:#f6f7f4;line-height:1.5}*{box-sizing:border-box}body{margin:0}.site-header{background:#fff;border-bottom:1px solid #dfe5df;position:sticky;top:0;z-index:5}.nav-wrap{max-width:1180px;margin:auto;min-height:68px;padding:0 22px;display:flex;align-items:center;gap:24px}.brand{font-weight:800;letter-spacing:.08em;color:#17221b;text-decoration:none;font-size:20px}.site-header nav{display:flex;gap:16px;flex:1}.site-header nav a{color:#344239;text-decoration:none;font-size:14px}.menu{display:none;border:1px solid #cfd8d0;background:#fff;border-radius:8px;padding:8px 12px}.container{max-width:1180px;margin:auto;padding:44px 22px}.hero{padding:34px 0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:700;color:#64736a}.hero h1{font-size:clamp(32px,5vw,56px);line-height:1.05;max-width:800px;margin:10px 0 16px}.hero p{max-width:760px;color:#5d6a61}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{background:#fff;border:1px solid #dfe5df;border-radius:14px;padding:22px}.card h2,.card h3{margin-top:0}.field{display:grid;gap:7px;margin-bottom:16px}.field label{font-size:13px;font-weight:700}.field input,.field select,.field textarea{width:100%;padding:11px 12px;border:1px solid #ccd6ce;border-radius:8px;background:#fff;font:inherit}.field textarea{min-height:100px;resize:vertical}.btn{display:inline-block;border:0;border-radius:9px;padding:11px 16px;text-decoration:none;font-weight:700;cursor:pointer}.btn-primary{background:#17221b;color:#fff}.btn-secondary{background:#eef2ed;color:#26332b}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0}.step{padding:12px;border:1px solid #dfe5df;border-radius:9px;background:#fff;font-size:13px}.step.active{font-weight:800}.summary-row{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #e5e9e5;padding:10px 0}.notice{padding:14px;border-left:4px solid #6a786e;background:#eef2ed;border-radius:8px;margin:16px 0}.muted{color:#68756c}footer{margin-top:60px;padding:30px 22px;border-top:1px solid #dfe5df;background:#fff;display:flex;flex-wrap:wrap;gap:14px;justify-content:center}.container footer span{font-size:12px}.confirmation{max-width:720px;margin:30px auto;text-align:center}.reference{font-size:24px;font-weight:800;letter-spacing:.04em}@media(max-width:800px){.site-header nav{display:none}.menu{display:block;margin-left:auto}.grid{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr}.container{padding:30px 16px}}@media(max-width:480px){.steps{grid-template-columns:1fr}}
</style></head><body>${header()}<main class="container">${body}</main>${footer()}</body></html>`;
}

function checkoutLanding() {
  return layout("Checkout", `<section class="hero"><div class="eyebrow">Commerce Checkout</div><h1>Review the commercial details before placing your order.</h1><p>Checkout supports separate Direct Sale and B2B / Quote paths. Final price, availability, shipping and commercial terms are validated before order creation.</p></section>
  <div class="steps"><div class="step active">1. Customer</div><div class="step">2. Delivery</div><div class="step">3. Payment & Terms</div><div class="step">4. Review & Submit</div></div>
  <section class="grid"><div class="card"><h2>Customer / Company</h2><div class="field"><label>Company</label><input name="company" placeholder="Company name"></div><div class="field"><label>Contact name</label><input name="contact" placeholder="Contact person"></div><div class="field"><label>Email</label><input type="email" name="email" placeholder="business@example.com"></div><div class="field"><label>Phone</label><input name="phone" placeholder="Phone / WhatsApp"></div></div>
  <div class="card"><h2>Billing Information</h2><div class="field"><label>Billing country</label><select name="billing_country"><option>Select country</option><option>Iran</option><option>Iraq</option><option>Uzbekistan</option><option>Türkiye</option><option>United Arab Emirates</option></select></div><div class="field"><label>Billing address</label><textarea name="billing_address" placeholder="Full billing address"></textarea></div><div class="field"><label>Tax / registration reference</label><input name="tax_reference" placeholder="Optional"></div></div></section>
  <section class="card" style="margin-top:18px"><h2>Delivery & Commercial Terms</h2><div class="grid"><div><div class="field"><label>Delivery destination</label><textarea name="delivery_destination" placeholder="City, country, port or warehouse"></textarea></div><div class="field"><label>Shipping / Incoterms</label><select name="incoterms"><option>To be confirmed</option><option>EXW</option><option>FCA</option><option>FOB</option><option>CFR</option><option>CIF</option><option>DAP</option></select></div></div><div><div class="field"><label>Order type</label><select name="order_type"><option value="direct">Direct Sale</option><option value="b2b">B2B / Quote</option></select></div><div class="field"><label>Payment method</label><select name="payment_method"><option>To be confirmed</option><option>Bank transfer</option><option>Other agreed commercial method</option></select></div></div></div><div class="notice">For B2B / Quote orders, the accepted quotation and supplier confirmation remain the source of commercial truth. Checkout does not bypass RFQ or quote validation.</div><a class="btn btn-primary" href="/checkout/review">Continue to Order Review</a></section>`);
}

function reviewPage() {
  return layout("Checkout Review", `<section class="hero"><div class="eyebrow">Final Review</div><h1>Review your order before submission.</h1><p class="muted">This is the structural checkout review. Live cart, customer session and pricing will be connected after the site shell is complete.</p></section><section class="grid"><div class="card"><h2>Order Items</h2><div class="summary-row"><span>NPK Fertilizer</span><strong>Quantity: To be confirmed</strong></div><div class="summary-row"><span>Supplier</span><strong>Pending supplier confirmation</strong></div><div class="summary-row"><span>Commercial value</span><strong>Requires quotation</strong></div></div><div class="card"><h2>Commercial Summary</h2><div class="summary-row"><span>Subtotal</span><strong>Pending</strong></div><div class="summary-row"><span>Shipping</span><strong>To be confirmed</strong></div><div class="summary-row"><span>Total</span><strong>Pending validation</strong></div><p class="muted">Currency, taxes, logistics and payment conditions will be resolved by the connected commerce workflow.</p></div></section><div class="notice"><strong>Submission boundary:</strong> creating an order must validate the authenticated customer, cart contents, product status and the selected Direct Sale or accepted B2B Quote path.</div><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-secondary" href="/checkout">Edit Checkout</a><a class="btn btn-primary" href="/checkout/confirmation">Submit Order</a></div>`);
}

function confirmationPage() {
  return layout("Order Confirmation", `<section class="confirmation"><div class="eyebrow">Order Confirmation</div><h1>Order submission received.</h1><p>The live order reference will be generated by the order service after checkout integration. This shell intentionally does not create a real order.</p><div class="card"><div class="muted">Structural reference</div><div class="reference">AGZ-ORDER-PENDING</div><p class="muted">No production order has been created by this page.</p></div><p><a class="btn btn-primary" href="/orders">View Orders</a> <a class="btn btn-secondary" href="/products">Continue Shopping</a></p></section>`);
}

export function checkoutSiteShell(pathname = "/checkout") {
  if (pathname === "/checkout/review") return reviewPage();
  if (pathname === "/checkout/confirmation") return confirmationPage();
  return checkoutLanding();
}

export function checkoutSiteResponse(pathname = "/checkout") {
  return new Response(checkoutSiteShell(pathname), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}
