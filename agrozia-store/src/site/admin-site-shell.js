const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/suppliers", "Suppliers"],
  ["/admin/rfqs", "RFQs"],
  ["/admin/matches", "Matches"],
  ["/admin/quotes", "Quotes"],
  ["/admin/orders", "Orders"],
  ["/admin/customers", "Customers"],
];

const esc = (value = "") => String(value).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

function layout(title, body, active = "/admin") {
  const links = NAV.map(([href, label]) => `<a class="nav ${active === href ? "active" : ""}" href="${href}">${label}</a>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Agro-Zia Store Admin</title><style>
:root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17202a;background:#f5f7f9}*{box-sizing:border-box}body{margin:0}.top{height:64px;background:#fff;border-bottom:1px solid #dfe5ea;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:5}.brand{font-weight:800;letter-spacing:.08em;color:#173b2b}.brand small{display:block;font-size:9px;letter-spacing:.12em;color:#71808d}.shell{display:flex;min-height:calc(100vh - 64px)}aside{width:235px;background:#10251b;padding:18px 12px}.nav{display:block;color:#dce8e1;text-decoration:none;padding:11px 12px;border-radius:8px;margin:3px 0;font-size:14px}.nav:hover,.nav.active{background:#214a36;color:#fff}.content{flex:1;padding:30px;max-width:1400px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#71808d}.hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:24px}.hero h1{margin:6px 0;font-size:30px}.muted{color:#697782}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.card{background:#fff;border:1px solid #dfe5ea;border-radius:12px;padding:18px}.metric{font-size:28px;font-weight:750;margin:8px 0}.badge{display:inline-block;border:1px solid #cfd8d2;border-radius:999px;padding:4px 9px;font-size:11px}.actions{display:flex;gap:10px;flex-wrap:wrap}.button{display:inline-block;padding:10px 14px;border-radius:8px;background:#173b2b;color:#fff;text-decoration:none;font-size:13px}.button.secondary{background:#eef2f0;color:#173b2b}.table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #dfe5ea;border-radius:12px;overflow:hidden}.table th,.table td{text-align:left;padding:12px;border-bottom:1px solid #e7ebee;font-size:13px}.table th{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#687680}.notice{background:#fffdf4;border:1px solid #eadfb4;padding:13px;border-radius:10px;margin-top:18px;font-size:13px}.mobile{display:none}@media(max-width:850px){aside{display:none}.mobile{display:inline-block}.content{padding:20px}.grid{grid-template-columns:1fr 1fr}.hero{display:block}}@media(max-width:520px){.grid{grid-template-columns:1fr}.top{padding:0 15px}.content{padding:16px}}
</style></head><body><header class="top"><a class="brand" href="/admin">AGRO-ZIA<small>STORE ADMIN</small></a><div class="actions"><a class="button secondary" href="/">Store</a><a class="button" href="/account">Customer Portal</a></div></header><div class="shell"><aside>${links}</aside><main class="content">${body}</main></div></body></html>`;
}

function dashboard() {
  return layout("Dashboard", `<div class="hero"><div><div class="eyebrow">Agro-Zia Store</div><h1>Commerce Administration</h1><p class="muted">Operational control center for products, suppliers, RFQs, quotes, orders and customers.</p></div><span class="badge">Shell / structural</span></div><section class="grid"><div class="card"><div class="eyebrow">Products</div><div class="metric">—</div><p class="muted">Catalog management</p></div><div class="card"><div class="eyebrow">RFQs</div><div class="metric">—</div><p class="muted">Requests awaiting action</p></div><div class="card"><div class="eyebrow">Orders</div><div class="metric">—</div><p class="muted">Direct + B2B orders</p></div><div class="card"><div class="eyebrow">Customers</div><div class="metric">—</div><p class="muted">Customer accounts</p></div></section><div class="card" style="margin-top:18px"><h2>Administration Areas</h2><div class="actions">${NAV.slice(1).map(([h,l])=>`<a class="button secondary" href="${h}">${l}</a>`).join("")}</div><div class="notice">Live Store data is intentionally not connected to this shell yet. Existing repositories and APIs remain the backend foundation. Admin authentication and role policy stay separate from the customer session.</div></div>`, "/admin");
}

function resourcePage(label, path) {
  const descriptions = { Products:"Catalog, pricing visibility and publication", Suppliers:"Supplier profiles and publication status", RFQs:"Customer requests and commercial requirements", Matches:"RFQ-to-supplier matching workflow", Quotes:"Supplier commercial offers and acceptance", Orders:"Direct Sale and B2B order operations", Customers:"Customer accounts and commerce history" };
  return layout(label, `<div class="hero"><div><div class="eyebrow">Store Admin</div><h1>${label}</h1><p class="muted">${descriptions[label] || "Commerce administration"}.</p></div><span class="badge">Structural shell</span></div><div class="card"><div class="actions"><a class="button" href="${path}/new">Create / Add</a><a class="button secondary" href="${path}">Refresh</a></div><table class="table" style="margin-top:18px"><thead><tr><th>Record</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody><tr><td>Sample ${label} record</td><td><span class="badge">Pending live data</span></td><td>—</td><td><a href="${path}/sample">View</a></td></tr></tbody></table><div class="notice">This page is a navigation and interaction structure only. Live records will be connected after the complete site shell gate.</div></div>`, path);
}

function detailPage(label, path) {
  return layout(`${label} Detail`, `<div class="hero"><div><div class="eyebrow">Store Admin / ${label}</div><h1>${label} Detail</h1><p class="muted">Operational detail view placeholder.</p></div><span class="badge">Structural shell</span></div><div class="grid"><div class="card"><h2>Overview</h2><p class="muted">Identity, status and core commercial fields will appear here.</p></div><div class="card"><h2>Activity</h2><p class="muted">Timeline and operational events will appear here.</p></div><div class="card"><h2>Related</h2><p class="muted">Related RFQs, suppliers, quotes or orders will appear here.</p></div><div class="card"><h2>Actions</h2><div class="actions"><a class="button secondary" href="${path}">Back</a><a class="button" href="${path}/edit">Edit</a></div></div></div>`, path.split("/").slice(0,3).join("/"));
}

export function adminSiteShell(pathname = "/admin") {
  if (pathname === "/admin") return dashboard();
  const map = { "/admin/products":"Products", "/admin/suppliers":"Suppliers", "/admin/rfqs":"RFQs", "/admin/matches":"Matches", "/admin/quotes":"Quotes", "/admin/orders":"Orders", "/admin/customers":"Customers" };
  if (map[pathname]) return resourcePage(map[pathname], pathname);
  const match = pathname.match(/^\/admin\/(products|suppliers|rfqs|matches|quotes|orders|customers)\/[^/]+$/);
  if (match) return detailPage(map[`/admin/${match[1]}`], pathname);
  if (pathname === "/admin/login") return layout("Admin Login", `<div class="hero"><div><div class="eyebrow">Agro-Zia Store</div><h1>Admin Login</h1><p class="muted">Secure administration session entry.</p></div></div><div class="card"><p>Login form structure will be connected to the existing Store Admin authentication API during the integration phase.</p><a class="button" href="/admin">Continue to Admin Shell</a></div>`, "/admin");
  return null;
}

export function adminSiteResponse(pathname = "/admin") {
  const html = adminSiteShell(pathname);
  if (!html) return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}
