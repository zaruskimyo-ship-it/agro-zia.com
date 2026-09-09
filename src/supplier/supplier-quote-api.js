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

async function supplierCanQuote(db, supplierId, rfqId, productId) {
  const rfq = await db.prepare(`
    SELECT id, supplier_id, product_id, status
    FROM commerce_rfqs
    WHERE id = ?
    LIMIT 1
  `).bind(rfqId).first();
  if (!rfq) return { ok: false, reason: "rfq_not_found" };
  if (rfq.status === "cancelled") return { ok: false, reason: "rfq_not_eligible" };
  if (!rfq.supplier_id || rfq.supplier_id !== supplierId) return { ok: false, reason: "supplier_forbidden" };
  if (rfq.product_id && productId && rfq.product_id !== productId) return { ok: false, reason: "product_mismatch" };
  if (rfq.product_id && !productId) return { ok: false, reason: "product_required" };
  return { ok: true };
}

function publicSupplierQuote(row) {
  if (!row) return null;
  return {
    id: row.id,
    quote_number: row.quote_number,
    rfq_id: row.rfq_id,
    supplier_id: row.supplier_id,
    product_id: row.product_id || null,
    product_name: row.product_name,
    quantity: row.quantity,
    unit_price_minor: row.unit_price_minor,
    currency: row.currency,
    packaging_cost_minor: row.packaging_cost_minor,
    shipping_cost_minor: row.shipping_cost_minor,
    insurance_cost_minor: row.insurance_cost_minor,
    other_fees_minor: row.other_fees_minor,
    total_amount_minor: row.total_amount_minor,
    lead_time: row.lead_time || null,
    validity_until: row.validity_until || null,
    payment_terms: row.payment_terms || null,
    incoterm: row.incoterm || null,
    destination: row.destination || null,
    notes: row.notes || null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ownedQuote(db, quoteId, supplierId) {
  return db.prepare(`
    SELECT id, quote_number, rfq_id, supplier_id, product_id, product_name, quantity,
           unit_price_minor, currency, packaging_cost_minor, shipping_cost_minor,
           insurance_cost_minor, other_fees_minor, total_amount_minor, lead_time,
           validity_until, payment_terms, incoterm, destination, notes, status,
           created_at, updated_at
    FROM commerce_quotes
    WHERE id = ? AND supplier_id = ?
    LIMIT 1
  `).bind(quoteId, supplierId).first();
}

function validityExpired(value, now) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.parse(now);
}

async function expireIfNeeded(db, quote, now) {
  if (!quote || !["sent", "negotiating"].includes(quote.status) || !validityExpired(quote.validity_until, now)) return quote;
  await db.prepare(
    "UPDATE commerce_quotes SET status='expired', updated_at=? WHERE id=? AND supplier_id=? AND status IN ('sent','negotiating')",
  ).bind(now, quote.id, quote.supplier_id).run();
  return { ...quote, status: "expired", updated_at: now };
}

async function quoteDetail(request, env, supplier, quoteId) {
  const quote = await ownedQuote(env.AGROZIA_DB, quoteId, supplier.supplier_id);
  if (!quote) return json({ error: "not_found" }, 404);
  const current = await expireIfNeeded(env.AGROZIA_DB, quote, new Date().toISOString());
  return json({ quote: publicSupplierQuote(current) });
}

async function quoteAction(request, env, supplier, quoteId) {
  let body;
  try {
    body = await parseBody(request);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const action = String(body?.action || "").trim().toLowerCase();
  const now = new Date().toISOString();
  let quote = await ownedQuote(env.AGROZIA_DB, quoteId, supplier.supplier_id);
  if (!quote) return json({ error: "not_found" }, 404);
  quote = await expireIfNeeded(env.AGROZIA_DB, quote, now);

  const transitions = {
    send: { from: ["draft"], to: "sent" },
    negotiate: { from: ["sent", "negotiating"], to: "negotiating" },
    withdraw: { from: ["draft", "sent", "negotiating"], to: "withdrawn" },
  };

  if (action === "expire") {
    if (!["sent", "negotiating"].includes(quote.status)) return json({ error: "quote_action_not_allowed" }, 409);
    if (!validityExpired(quote.validity_until, now)) return json({ error: "quote_not_expired" }, 409);
    const result = await env.AGROZIA_DB.prepare(
      "UPDATE commerce_quotes SET status='expired', updated_at=? WHERE id=? AND supplier_id=? AND status IN ('sent','negotiating')",
    ).bind(now, quote.id, supplier.supplier_id).run();
    if (!result?.meta?.changes) return json({ error: "quote_action_conflict" }, 409);
    return json({ ok: true, status: "expired", updated_at: now });
  }

  const transition = transitions[action];
  if (!transition) return json({ error: "unknown_action" }, 400);
  if (!transition.from.includes(quote.status)) return json({ error: "quote_action_not_allowed" }, 409);

  const result = await env.AGROZIA_DB.prepare(
    `UPDATE commerce_quotes
        SET status=?, updated_at=?
      WHERE id=? AND supplier_id=? AND status IN (${transition.from.map(() => "?").join(",")})`,
  ).bind(transition.to, now, quote.id, supplier.supplier_id, ...transition.from).run();
  if (!result?.meta?.changes) return json({ error: "quote_action_conflict" }, 409);

  return json({ ok: true, status: transition.to, updated_at: now });
}

export async function handleSupplierQuoteRoute(request, env) {
  const url = new URL(request.url);
  const detailMatch = url.pathname.match(/^\/api\/supplier\/quotes\/([^/]+)$/);
  const actionMatch = url.pathname.match(/^\/api\/supplier\/quotes\/([^/]+)\/actions$/);
  const collection = url.pathname === "/api/supplier/quotes";
  if (!collection && !detailMatch && !actionMatch) return null;
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const supplier = await requireSupplier(env.AGROZIA_DB, request, env);
  if (!supplier) return supplierUnauthorized();

  if (collection) {
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
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
      if (authorization.reason === "supplier_forbidden") return supplierForbidden();
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

  const quoteId = decodeURIComponent((detailMatch || actionMatch)[1]);
  if (detailMatch) {
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    return quoteDetail(request, env, supplier, quoteId);
  }

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  return quoteAction(request, env, supplier, quoteId);
}
