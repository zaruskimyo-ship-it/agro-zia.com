import { getCustomerFromSession } from "../auth/customer-repository.js";
import { CUSTOMER_SESSION_COOKIE } from "../auth/customer-contract.js";
import { createCheckout, getCheckout } from "./checkout-repository.js";

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

async function body(request) {
  if ((request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() !== "application/json") throw Object.assign(new Error("unsupported_media"), { status: 415 });
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > 16 * 1024) throw Object.assign(new Error("payload_too_large"), { status: 413 });
  try { return await request.json(); } catch { throw Object.assign(new Error("invalid_json"), { status: 400 }); }
}

export async function handleCheckout(request, env, pathname) {
  const method = request.method.toUpperCase();
  if (!(["POST", "GET"].includes(method))) return json({ ok: false, error: "method_not_allowed" }, 405);
  const customerRecord = await customer(request, env);
  if (!customerRecord) return json({ ok: false, error: "authentication_required" }, 401);

  try {
    if (pathname === "/api/checkout" && method === "POST") {
      const input = await body(request);
      const checkout = await createCheckout(env.STORE_DB, customerRecord, input);
      return json({ ok: true, checkout }, 201);
    }
    if (pathname.startsWith("/api/checkout/") && method === "GET") {
      const checkoutId = pathname.slice("/api/checkout/".length);
      const checkout = await getCheckout(env.STORE_DB, customerRecord, checkoutId);
      return json({ ok: true, checkout });
    }
    return json({ ok: false, error: "not_found" }, 404);
  } catch (error) {
    const known = new Set([
      "invalid_checkout_input", "cart_not_active", "cart_empty", "product_not_available",
      "product_not_direct_sale", "product_price_not_final", "product_currency_required",
      "invalid_cart_quantity", "price_precision_unsupported", "cart_currency_mismatch",
      "quantity_below_moq", "product_unavailable", "invalid_checkout_id", "checkout_not_found",
      "unsupported_media", "payload_too_large", "invalid_json"
    ]);
    const status = error?.status || (error?.message === "checkout_not_found" ? 404 : 400);
    return json({ ok: false, error: known.has(error?.message) ? error.message : "checkout_service_unavailable" }, status);
  }
}
