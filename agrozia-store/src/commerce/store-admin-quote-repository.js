function nowIso() { return new Date().toISOString(); }
function clean(value) { return value == null || String(value).trim() === "" ? null : String(value).trim(); }
function id(value) { const v = String(value ?? "").trim(); return v && v.length <= 120 ? v : null; }
const STATUSES = ["draft", "sent", "accepted", "rejected", "expired", "converted", "cancelled"];
const COLUMNS = `id, quote_number, rfq_id, supplier_id, product_id, product_name, quantity,
  unit_price_minor, currency, packaging_cost_minor, shipping_cost_minor, insurance_cost_minor,
  other_fees_minor, total_amount_minor, lead_time, validity_until, payment_terms, incoterm,
  destination, notes, status, created_at, updated_at`;

export async function listQuotes(db) {
  const result = await db.prepare(`SELECT ${COLUMNS} FROM commerce_quotes ORDER BY created_at DESC`).all();
  return result.results ?? [];
}

export async function getQuoteById(db, quoteId) {
  const normalized = id(quoteId);
  if (!normalized) return null;
  return db.prepare(`SELECT ${COLUMNS} FROM commerce_quotes WHERE id=?1 LIMIT 1`).bind(normalized).first();
}

async function validateReferences(db, input) {
  const rfqId = id(input?.rfq_id);
  const supplierId = id(input?.supplier_id);
  if (!rfqId || !supplierId) throw new Error("invalid_quote_reference");
  const rfq = await db.prepare(`SELECT id, product_id, status FROM commerce_rfqs WHERE id=?1 LIMIT 1`).bind(rfqId).first();
  if (!rfq) throw new Error("rfq_not_found");
  const supplier = await db.prepare(`SELECT id, status FROM commerce_suppliers WHERE id=?1 LIMIT 1`).bind(supplierId).first();
  if (!supplier) throw new Error("supplier_not_found");
  if (supplier.status !== "published") throw new Error("supplier_not_available");
  const match = await db.prepare(`SELECT id FROM commerce_rfq_supplier_matches WHERE rfq_id=?1 AND supplier_id=?2 AND status='matched' LIMIT 1`).bind(rfqId, supplierId).first();
  if (!match) throw new Error("supplier_match_required");
  if (input?.product_id != null && input.product_id !== rfq.product_id) throw new Error("invalid_quote_product");
  return { rfq, supplier };
}

function money(value, fallback = 0) { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : fallback; }
function status(value, fallback = "draft") { return STATUSES.includes(value) ? value : fallback; }
function total(input) {
  const base = money(input?.unit_price_minor);
  return base + money(input?.packaging_cost_minor) + money(input?.shipping_cost_minor) + money(input?.insurance_cost_minor) + money(input?.other_fees_minor);
}

export async function createQuote(db, input) {
  await validateReferences(db, input);
  const productId = id(input?.product_id);
  const product = productId ? await db.prepare("SELECT id, name, status FROM commerce_products WHERE id=?1 LIMIT 1").bind(productId).first() : null;
  if (productId && (!product || product.status !== "published")) throw new Error("product_not_available");
  const quoteId = crypto.randomUUID();
  const quoteNumber = `AGZ-Q-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0,14)}-${quoteId.slice(0,8).toUpperCase()}`;
  const now = nowIso();
  const quantity = String(input?.quantity ?? "").trim();
  const productName = String(input?.product_name ?? product?.name ?? "").trim();
  if (!quantity || !productName || !String(input?.currency ?? "").trim()) throw new Error("invalid_quote_terms");
  const values = [quoteId, quoteNumber, id(input.rfq_id), id(input.supplier_id), productId, productName, quantity,
    money(input.unit_price_minor), String(input.currency).trim().toUpperCase(), money(input.packaging_cost_minor), money(input.shipping_cost_minor),
    money(input.insurance_cost_minor), money(input.other_fees_minor), total(input), clean(input.lead_time), clean(input.validity_until),
    clean(input.payment_terms), clean(input.incoterm), clean(input.destination), clean(input.notes), status(input.status), now];
  await db.prepare(`INSERT INTO commerce_quotes (${COLUMNS.replace(/,\s+/g, ", ")}) VALUES (${values.map((_, i) => `?${i+1}`).join(", ")})`).bind(...values).run();
  return getQuoteById(db, quoteId);
}

export async function updateQuote(db, quoteId, input) {
  const current = await getQuoteById(db, quoteId);
  if (!current) return null;
  const merged = { ...current, ...input };
  await validateReferences(db, merged);
  const productId = id(merged.product_id);
  if (productId) {
    const product = await db.prepare("SELECT id, name, status FROM commerce_products WHERE id=?1 LIMIT 1").bind(productId).first();
    if (!product || product.status !== "published") throw new Error("product_not_available");
  }
  const productName = String(merged.product_name ?? "").trim();
  const quantity = String(merged.quantity ?? "").trim();
  const currency = String(merged.currency ?? "").trim().toUpperCase();
  if (!productName || !quantity || !currency) throw new Error("invalid_quote_terms");
  const nextStatus = status(merged.status, current.status);
  const unit = money(merged.unit_price_minor), packaging = money(merged.packaging_cost_minor), shipping = money(merged.shipping_cost_minor), insurance = money(merged.insurance_cost_minor), other = money(merged.other_fees_minor);
  await db.prepare(`UPDATE commerce_quotes SET rfq_id=?1,supplier_id=?2,product_id=?3,product_name=?4,quantity=?5,unit_price_minor=?6,currency=?7,
    packaging_cost_minor=?8,shipping_cost_minor=?9,insurance_cost_minor=?10,other_fees_minor=?11,total_amount_minor=?12,lead_time=?13,
    validity_until=?14,payment_terms=?15,incoterm=?16,destination=?17,notes=?18,status=?19,updated_at=?20 WHERE id=?21`)
    .bind(id(merged.rfq_id), id(merged.supplier_id), productId, productName, quantity, unit, currency, packaging, shipping, insurance, other,
      unit + packaging + shipping + insurance + other, clean(merged.lead_time), clean(merged.validity_until), clean(merged.payment_terms),
      clean(merged.incoterm), clean(merged.destination), clean(merged.notes), nextStatus, nowIso(), id(quoteId)).run();
  return getQuoteById(db, quoteId);
}

export async function setQuoteStatus(db, quoteId, nextStatus) {
  if (!STATUSES.includes(nextStatus)) return null;
  const current = await getQuoteById(db, quoteId);
  if (!current) return null;
  if (nextStatus === "accepted") throw new Error("customer_acceptance_required");
  await db.prepare("UPDATE commerce_quotes SET status=?1, updated_at=?2 WHERE id=?3").bind(nextStatus, nowIso(), current.id).run();
  return getQuoteById(db, current.id);
}
