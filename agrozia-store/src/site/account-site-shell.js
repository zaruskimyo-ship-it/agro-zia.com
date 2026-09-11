const sections = [
  ["/account", "Overview"],
  ["/account/profile", "Profile"],
  ["/account/rfqs", "RFQs"],
  ["/account/quotes", "Quotes"],
  ["/account/orders", "Orders"],
  ["/account/documents", "Documents"],
  ["/account/settings", "Settings"]
];

function nav(active) {
  return sections.map(([href, label]) => `<a class="nav-link ${active === href ? "active" : ""}" href="${href}">${label}</a>`).join("");
}

function page(title, body, active = "/account") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | AGRO-ZIA</title><style>
:root{--ink:#17352d;--muted:#64756f;--line:#dce7e2;--bg:#f6f9f7;--card:#fff;--accent:#2f6f58}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg)}a{color:inherit;text-decoration:none}.header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.header-inner{max-width:1180px;margin:auto;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{font-weight:800;letter-spacing:.08em}.brand small{display:block;font-size:9px;letter-spacing:.16em;color:var(--muted);margin-top:3px}.nav{display:flex;gap:6px;flex-wrap:wrap}.nav-link{padding:8px 10px;border-radius:8px;color:var(--muted);font-size:14px}.nav-link.active,.nav-link:hover{background:#edf5f1;color:var(--ink)}.wrap{max-width:1180px;margin:auto;padding:38px 20px 70px}.hero{margin-bottom:26px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700}.hero h1{font-size:34px;margin:8px 0}.hero p{color:var(--muted);max-width:720px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;box-shadow:0 4px 16px rgba(20,50,40,.04)}.card h2,.card h3{margin:0 0 9px}.card p{color:var(--muted);line-height:1.55}.pill{display:inline-block;padding:5px 9px;border-radius:999px;background:#edf5f1;color:var(--accent);font-size:12px;font-weight:700}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.btn{display:inline-block;padding:10px 14px;border-radius:9px;background:var(--accent);color:#fff;font-size:14px}.btn.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.footer{max-width:1180px;margin:auto;padding:20px;color:var(--muted);font-size:12px;border-top:1px solid var(--line)}ul{padding-left:20px;color:var(--muted);line-height:1.8}@media(max-width:760px){.header-inner{align-items:flex-start;flex-direction:column}.nav{width:100%;overflow:auto;flex-wrap:nowrap}.grid{grid-template-columns:1fr}.hero h1{font-size:28px}}
</style></head><body><header class="header"><div class="header-inner"><a class="brand" href="/">AGRO-ZIA<small>AGRICULTURE • ENGINEERING • TRADE</small></a><nav class="nav">${nav(active)}</nav></div></header><main class="wrap">${body}</main><footer class="footer">AGRO-ZIA — Agricultural Solutions Beyond Borders.</footer></body></html>`;
}

function overview() { return page("Customer Account", `<section class="hero"><span class="eyebrow">Customer Portal</span><h1>My Agro-Zia Account</h1><p>A structured customer workspace for agricultural commerce, RFQs, quotations, orders and commercial documents.</p></section><section class="grid"><article class="card"><span class="pill">Profile</span><h2>Company & Contact</h2><p>Customer identity, company information and contact details.</p><a class="btn secondary" href="/account/profile">Open Profile</a></article><article class="card"><span class="pill">RFQs</span><h2>Business Requests</h2><p>Track submitted requests, supplier matching and RFQ status.</p><a class="btn secondary" href="/account/rfqs">View RFQs</a></article><article class="card"><span class="pill">Quotes</span><h2>Supplier Quotations</h2><p>Review commercial quotations connected to your requests.</p><a class="btn secondary" href="/account/quotes">View Quotes</a></article><article class="card"><span class="pill">Orders</span><h2>Order History</h2><p>Direct Sale and B2B orders remain visibly separated.</p><a class="btn secondary" href="/account/orders">View Orders</a></article></section>`); }

function detail(title, label, text, links = []) { return page(title, `<section class="hero"><span class="eyebrow">Customer Portal</span><h1>${label}</h1><p>${text}</p></section><section class="card"><h2>${label}</h2><p>Live authenticated customer data is intentionally not connected in the site-shell stage.</p><ul>${links.map(x=>`<li>${x}</li>`).join("")}</ul><div class="actions"><a class="btn secondary" href="/account">Back to Account</a><a class="btn" href="/account/settings">Account Settings</a></div></section>`, `/account/${label.toLowerCase()}`); }

export function accountSiteShell(pathname = "/account") {
  if (pathname === "/account") return overview();
  if (pathname === "/account/profile") return detail("Profile", "Profile", "Manage customer and company information used across commercial requests.", ["Company identity", "Contact information", "Business destination preferences"]);
  if (pathname === "/account/rfqs") return detail("RFQs", "RFQs", "Review business requests and their supplier-matching lifecycle.", ["Submitted RFQs", "Supplier match status", "Request details and timing"]);
  if (pathname === "/account/quotes") return detail("Quotes", "Quotes", "Review supplier quotations associated with accepted or pending RFQs.", ["Quote status", "Supplier reference", "Commercial terms and expiry"]);
  if (pathname === "/account/orders") return detail("Orders", "Orders", "Review order history while preserving separate Direct Sale and B2B order paths.", ["Direct Sale orders", "B2B orders from accepted quotes", "Order status and timeline"]);
  if (pathname === "/account/documents") return detail("Documents", "Documents", "A dedicated place for commercial and order-related documents.", ["RFQ documents", "Quotation documents", "Order documents"]);
  if (pathname === "/account/settings") return detail("Settings", "Settings", "Customer portal preferences and session controls.", ["Language preference", "Notification preferences", "Session and logout controls"]);
  return null;
}

export function accountSiteResponse(pathname = "/account") {
  const html = accountSiteShell(pathname);
  if (!html) return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}
