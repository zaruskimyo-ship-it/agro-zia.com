import { getCustomerFromSession } from "../auth/customer-repository.js";
import { CUSTOMER_SESSION_COOKIE } from "../auth/customer-contract.js";
import { addCartItem, clearCart, getCart, removeCartItem } from "./cart-repository.js";

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
  return match ? decodeURIComponent(match[1]) : null;
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

export async function handleCart(request, env, pathname) {
  const method = request.method.toUpperCase();
  if (!["GET", "POST", "DELETE"].includes(method)) return json({ ok: false, error: "method_not_allowed" }, 405);
  const customerRecord = await customer(request, env);
  if (!customerRecord) return json({ ok: false, error: "authentication_required" }, 401);

  try {
    if (pathname === "/api/cart" && method === "GET") return json({ ok: true, cart: await getCart(env.STORE_DB, customerRecord) });
    if (pathname === "/api/cart/items" && method === "POST") {
      const input = await body(request);
      return json({ ok: true, cart: await addCartItem(env.STORE_DB, customerRecord, input) }, 201);
    }
    if (pathname === "/api/cart/items" && method === "DELETE") {
      const input = await body(request);
      return json({ ok: true, cart: await removeCartItem(env.STORE_DB, customerRecord, input?.product_id) });
    }
    if (pathname === "/api/cart" && method === "DELETE") return json({ ok: true, cart: await clearCart(env.STORE_DB, customerRecord) });
    return json({ ok: false, error: "not_found" }, 404);
  } catch (error) {
    const status = error?.status || 400;
    const known = new Set(["invalid_cart_item", "product_not_available", "cart_not_active", "unsupported_media", "payload_too_large", "invalid_json"]);
    return json({ ok: false, error: known.has(error?.message) ? error.message : "cart_service_unavailable" }, status === 400 ? 400 : status);
  }
}
