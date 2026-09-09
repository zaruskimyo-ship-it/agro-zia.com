import { requireSupplier, supplierUnauthorized } from "./supplier-ownership.js";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_MESSAGE_LENGTH = 4000;

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
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error("body_too_large");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("invalid_json");
  }
}

async function ownedQuote(db, quoteId, supplierId) {
  return db.prepare(`
    SELECT id, supplier_id, rfq_id, status
    FROM commerce_quotes
    WHERE id = ? AND supplier_id = ?
    LIMIT 1
  `).bind(quoteId, supplierId).first();
}

async function thread(db, quoteId) {
  const [customer, supplier] = await Promise.all([
    db.prepare(`
      SELECT id, message, created_at, 'customer' AS sender_type
      FROM commerce_quote_messages
      WHERE quote_id = ?
      ORDER BY created_at ASC
      LIMIT 200
    `).bind(quoteId).all(),
    db.prepare(`
      SELECT id, message, created_at, 'supplier' AS sender_type
      FROM commerce_supplier_quote_messages
      WHERE quote_id = ?
      ORDER BY created_at ASC
      LIMIT 200
    `).bind(quoteId).all(),
  ]);
  return [...(customer.results || []), ...(supplier.results || [])]
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)))
    .slice(-200);
}

export async function handleSupplierMessagingRoute(request, env) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/supplier\/quotes\/([^/]+)\/messages$/);
  if (!match) return null;
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const supplier = await requireSupplier(env.AGROZIA_DB, request, env);
  if (!supplier) return supplierUnauthorized();

  const quoteId = decodeURIComponent(match[1]);
  const quote = await ownedQuote(env.AGROZIA_DB, quoteId, supplier.supplier_id);
  if (!quote) return json({ error: "not_found" }, 404);

  if (request.method === "GET") {
    return json({ messages: await thread(env.AGROZIA_DB, quoteId) });
  }

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body;
  try {
    body = await parseBody(request);
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!message) return json({ error: "message_required" }, 400);
  if (message.length > MAX_MESSAGE_LENGTH) return json({ error: "message_too_long", max_length: MAX_MESSAGE_LENGTH }, 400);
  if (!["sent", "negotiating"].includes(quote.status)) return json({ error: "quote_action_not_allowed" }, 409);

  const now = new Date().toISOString();
  const result = await env.AGROZIA_DB.prepare(
    "UPDATE commerce_quotes SET status='negotiating', updated_at=? WHERE id=? AND supplier_id=? AND status IN ('sent','negotiating')",
  ).bind(now, quoteId, supplier.supplier_id).run();
  if (!result?.meta?.changes) return json({ error: "quote_action_conflict" }, 409);

  const id = crypto.randomUUID();
  await env.AGROZIA_DB.prepare(`
    INSERT INTO commerce_supplier_quote_messages
      (id, quote_id, supplier_account_id, supplier_id, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, quoteId, supplier.account_id, supplier.supplier_id, message, now).run();

  return json({ ok: true, status: "negotiating", message: { id, message, created_at: now, sender_type: "supplier" } }, 201);
}
