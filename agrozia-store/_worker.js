import { handleCustomerAuth } from "./src/auth/customer-auth.js";
import { handleAdminAuth } from "./src/auth/admin-auth.js";
import { handleStoreAdminProducts } from "./src/commerce/store-admin-product-api.js";
import { handleStoreAdminSuppliers } from "./src/commerce/store-admin-supplier-api.js";
import { handleStoreAdminMatches } from "./src/commerce/store-admin-match-api.js";
import { handlePublicProducts } from "./src/commerce/product-api.js";
import { handleStoreRfqs } from "./src/commerce/rfq-api.js";
import { handleCart } from "./src/commerce/cart-api.js";
import { handleCheckout } from "./src/commerce/checkout-api.js";
import { handleOrders } from "./src/commerce/order-api.js";
import { handleB2BOrders } from "./src/commerce/b2b-order-api.js";
import { siteResponse } from "./src/site/store-site-shell.js";
import { supplierSiteResponse } from "./src/site/supplier-site-shell.js";
import { rfqSiteResponse } from "./src/site/rfq-site-shell.js";
import { cartSiteResponse } from "./src/site/cart-site-shell.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      let db = "not_checked";
      try { await env.STORE_DB.prepare("SELECT 1 AS ok").first(); db = "ok"; } catch { db = "unavailable"; }
      return json({ ok: true, service: "agrozia-store", environment: "foundation", database: db, timestamp: new Date().toISOString() });
    }
    if (url.pathname.startsWith("/api/store-admin/")) {
      try {
        const authResponse = await handleAdminAuth(request, env, url.pathname);
        if (authResponse) return authResponse;
        const productResponse = await handleStoreAdminProducts(request, env, url.pathname);
        if (productResponse) return productResponse;
        const supplierResponse = await handleStoreAdminSuppliers(request, env, url.pathname);
        if (supplierResponse) return supplierResponse;
        const matchResponse = await handleStoreAdminMatches(request, env, url.pathname);
        if (matchResponse) return matchResponse;
      } catch { return json({ ok: false, error: "store_admin_service_unavailable" }, 503); }
    }
    if (url.pathname.startsWith("/api/customer/") && url.pathname !== "/api/customer/rfqs") {
      try { const response = await handleCustomerAuth(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "customer_auth_unavailable" }, 503); }
    }
    if (url.pathname === "/api/products" || url.pathname.startsWith("/api/products/") || url.pathname === "/api/categories") {
      const response = await handlePublicProducts(request, env, url.pathname); if (response) return response;
    }
    if (url.pathname === "/api/rfqs" || url.pathname === "/api/customer/rfqs") {
      try { const response = await handleStoreRfqs(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "rfq_service_unavailable" }, 503); }
    }
    if (url.pathname === "/api/cart" || url.pathname === "/api/cart/items") {
      try { const response = await handleCart(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "cart_service_unavailable" }, 503); }
    }
    if (url.pathname === "/api/checkout" || url.pathname.startsWith("/api/checkout/")) {
      try { const response = await handleCheckout(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "checkout_service_unavailable" }, 503); }
    }
    if (url.pathname.startsWith("/api/orders/")) {
      try { const response = await handleOrders(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "order_service_unavailable" }, 503); }
    }
    if (url.pathname.startsWith("/api/b2b-orders/")) {
      try { const response = await handleB2BOrders(request, env, url.pathname); if (response) return response; }
      catch { return json({ ok: false, error: "b2b_order_service_unavailable" }, 503); }
    }
    if (request.method === "GET" && (url.pathname === "/suppliers" || url.pathname.startsWith("/suppliers/"))) return supplierSiteResponse(url.pathname);
    if (request.method === "GET" && (url.pathname === "/rfq" || url.pathname === "/rfq/review")) return rfqSiteResponse(url.pathname);
    if (request.method === "GET" && url.pathname === "/cart") return cartSiteResponse(url.pathname);
    if (request.method === "GET" && !url.pathname.startsWith("/api/")) return siteResponse(url.pathname);
    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
};
