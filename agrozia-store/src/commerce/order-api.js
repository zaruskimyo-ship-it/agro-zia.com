import { getCustomerFromSession } from "../auth/customer-repository.js";
import { CUSTOMER_SESSION_COOKIE } from "../auth/customer-contract.js";
import { createDirectOrder, getOrder } from "./order-repository.js";

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

async function customer(request, env) {
  const token = cookieToken(request);
  return token ? getCustomerFromSession(env.STORE_DB, token) : null;
}

export async function handleOrders(request, env, pathname) {
  const method = request.method.toUpperCase();
  if (!(method === "POST" || method === "GET")) return json({ ok: false, error: "method_not_allowed" }, 405);
  const customerRecord = await customer(request, env);
  if (!customerRecord) return json({ ok: false, error: "authentication_required" }, 401);

  try {
    if (method === "POST" && pathname.startsWith("/api/orders/from-checkout/")) {
      const checkoutId = pathname.slice("/api/orders/from-checkout/".length);
      const order = await createDirectOrder(env.STORE_DB, customerRecord, checkoutId);
      return json({ ok: true, order }, 201);
    }
    if (method === "GET" && pathname.startsWith("/api/orders/")) {
      const orderId = pathname.slice("/api/orders/".length);
      const order = await getOrder(env.STORE_DB, customerRecord, orderId);
      return json({ ok: true, order });
    }
    return json({ ok: false, error: "not_found" }, 404);
  } catch (error) {
    const known = new Set([
      "invalid_checkout_id", "checkout_not_found", "checkout_expired", "checkout_not_orderable",
      "checkout_empty", "invalid_order_id", "order_not_found"
    ]);
    const status = error?.status || (error?.message === "checkout_not_found" || error?.message === "order_not_found" ? 404 : 400);
    return json({ ok: false, error: known.has(error?.message) ? error.message : "order_service_unavailable" }, status);
  }
}
