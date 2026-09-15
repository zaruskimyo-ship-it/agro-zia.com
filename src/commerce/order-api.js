import { createOrder } from "./order-repository.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function handleCreateOrder(request, env, { authorized = false } = {}) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!authorized) return json({ error: "not_found" }, 404);
  if (!env?.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ error: "unsupported_media_type" }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 16 * 1024) return json({ error: "payload_too_large" }, 413);

  let payload;
  try {
    const body = await request.text();
    if (body.length > 16 * 1024) return json({ error: "payload_too_large" }, 413);
    payload = JSON.parse(body);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  try {
    return json({ order: await createOrder(env.AGROZIA_DB, payload) }, 201);
  } catch (error) {
    const known = new Set([
      "invalid_order", "invalid_order_quote", "invalid_order_supplier", "invalid_order_product",
    ]);
    if (known.has(error?.message)) return json({ error: error.message }, 400);
    return json({ error: "internal_error" }, 503);
  }
}
