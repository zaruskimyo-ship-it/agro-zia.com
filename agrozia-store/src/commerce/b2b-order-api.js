import { getCustomerFromSession } from "../auth/customer-repository.js";
import { CUSTOMER_SESSION_COOKIE } from "../auth/customer-contract.js";
import { createB2BOrder, getB2BOrder } from "./b2b-order-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  }});
}

function cookieToken(request) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${CUSTOMER_SESSION_COOKIE}=([^;]*)`));
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

export async function handleB2BOrders(request, env, pathname) {
  const customerToken = cookieToken(request);
  const customer = customerToken ? await getCustomerFromSession(env.STORE_DB, customerToken) : null;
  if (!customer) return json({ ok: false, error: "authentication_required" }, 401);

  try {
    if (request.method === "POST" && pathname.startsWith("/api/b2b-orders/from-quote/")) {
      const quoteId = pathname.slice("/api/b2b-orders/from-quote/".length);
      const order = await createB2BOrder(env.STORE_DB, customer, quoteId);
      return json({ ok: true, order }, 201);
    }
    if (request.method === "GET" && pathname.startsWith("/api/b2b-orders/")) {
      const orderId = pathname.slice("/api/b2b-orders/".length);
      const order = await getB2BOrder(env.STORE_DB, customer, orderId);
      return json({ ok: true, order });
    }
    return json({ ok: false, error: "not_found" }, 404);
  } catch (error) {
    const known = new Set([
      "invalid_quote_id", "quote_not_found", "quote_not_accepted", "quote_expired",
      "supplier_not_available", "supplier_match_required", "product_not_available",
      "invalid_order_product", "authentication_required", "invalid_order_id", "order_not_found",
    ]);
    const status = error?.message === "quote_not_found" || error?.message === "order_not_found" ? 404 :
      error?.message === "authentication_required" ? 401 : 400;
    return json({ ok: false, error: known.has(error?.message) ? error.message : "b2b_order_service_unavailable" }, status);
  }
}
