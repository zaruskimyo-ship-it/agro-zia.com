(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;", "'":"&#39;"}[c]));
  const empty = (message) => `<p class="z-muted">${esc(message)}</p>`;
  const list = (items, type) => {
    if (!items?.length) return empty(`No ${type} yet.`);
    return items.map((x) => {
      const number = x.request_number || x.quote_number || x.order_number || x.id;
      const title = x.product_name || "Commercial request";
      const party = x.supplier_name ? ` · ${x.supplier_name}` : "";
      return `<div class="z-mini-card"><strong>${esc(number)}</strong><div>${esc(title)}${esc(party)}</div><small>Status: ${esc(x.status || "—")} · ${esc(x.created_at || "")}</small></div>`;
    }).join("");
  };
  async function load() {
    const status = $("workspace-status"), login = $("workspace-login"), app = $("workspace-app");
    try {
      const response = await fetch("/api/customer/workspace", { credentials: "same-origin", headers: { accept: "application/json" } });
      if (response.status === 401) { status.textContent = "Sign in to access your private workspace."; login.hidden = false; return; }
      if (!response.ok) throw new Error("workspace_unavailable");
      const data = await response.json();
      status.innerHTML = `<strong>Signed in:</strong> ${esc(data.account?.name || data.account?.email || "Customer")}`;
      app.hidden = false;
      $("rfq-count").textContent = data.rfqs?.length || 0;
      $("quote-count").textContent = data.quotes?.length || 0;
      $("order-count").textContent = data.orders?.length || 0;
      $("rfq-list").innerHTML = list(data.rfqs, "RFQs");
      $("quote-list").innerHTML = list(data.quotes, "quotes");
      $("order-list").innerHTML = list(data.orders, "orders");
      $("account-profile").innerHTML = `<p><strong>${esc(data.account?.company || data.account?.name || "Customer")}</strong></p><p class="z-muted">${esc(data.account?.email || "")}${data.account?.country ? ` · ${esc(data.account.country)}` : ""}</p>`;
    } catch (_) { status.textContent = "The customer workspace is temporarily unavailable."; }
  }
  $("logout")?.addEventListener("click", async () => { await fetch("/api/customer/logout", { method: "POST", credentials: "same-origin" }); location.href = "/zarus.html"; });
  load();
})();
