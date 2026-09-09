import { createQuote } from "../commerce/quote-repository.js";
import { requireSupplier, supplierForbidden, supplierUnauthorized } from "./supplier-ownership.js";

const MAX_BODY_BYTES = 16 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function parseBody(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) throw new Error("body_too_large");
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error("body_too_large");
    return JSON.parse(text || "{}");
  } catch (error) {
    if (error?.message === "body_too_large") throw error;
    throw new Error("invalid_json");
  }
}

async function loadSupplier(db, request, env) {
  return requireSupplier(db, request, env);
}

async function supplierCanQuote(db, supplierId, rfqId, productId) {
  const rfq = await db.prepare(`
    SELECT id, product_id, status
    FROM commerce_rfqs
    WHERE id = ?
    LIMIT 1
  `).bind(rfqId).first();
  if (!rfq) return { ok: false, reason: "rfq_not_found" };
  if (rfq.status === "cancelled") return { ok: false, reason: "rfq_not_eligible" };
  if (rfq.supplier_id && rfq.supplier_id !== supplierId) return { ok: false, reason: "supplier_forbidden" };
  if (!rfq.supplier_id) return { ok: false, reason: "supplier_not_assigned" };
  if (rfq.product_id && productId && rfq.product_id !== productId) return { ok: false, reason: "product_mismatch" };
  if (rfq.product_id && !productId) return { ok: false, reason: "product_required" };
  return { ok: true };
}

export async function handleSupplierQuoteRoute(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/supplier/quotes") return null;
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const supplier = await loadSupplier(env.AGROZIA_DB, request, env);
  if (!supplier) return supplierUnauthorized();

  let body;
  try {
    body = await parseBody(request);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const rfqId = typeof body?.rfq_id === "string" ? body.rfq_id.trim() : "";
  const productId = typeof body?.product_id === "string" ? body.product_id.trim() : "";
  if (!rfqId) return json({ error: "rfq_required" }, 400);

  const authorization = await supplierCanQuote(env.AGROZIA_DB, supplier.supplier_id, rfqId, productId);
  if (!authorization.ok) {
    if (authorization.reason === "supplier_forbidden" || authorization.reason === "supplier_not_assigned") return supplierForbidden();
    return json({ error: authorization.reason }, 400);
  }

  try {
    const quote = await createQuote(env.AGROZIA_DB, {
      ...body,
      rfq_id: rfqId,
      product_id: productId || null,
      supplier_id: supplier.supplier_id,
    });
    return json({ ok: true, quote }, 201);
  } catch (error) {
    const code = String(error?.message || "");
    const clientErrors = new Set([
      "invalid_quote", "invalid_quote_rfq", "invalid_quote_supplier", "invalid_quote_product",
      "quote_supplier_product_mismatch", "quote_rfq_product_mismatch", "invalid_quote_total",
    ]);
    return json({ error: clientErrors.has(code) ? code : "quote_create_failed" }, clientErrors.has(code) ? 400 : 503);
  }
}
