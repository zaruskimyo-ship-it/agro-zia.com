import {
  RFQ_QUOTE_ELIGIBLE_STATUSES,
  calculateTotalMinor,
  normalizeQuote,
  publicQuote,
} from "./quote-contract.js";

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function createQuoteNumber(now, id) {
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AGZ-QUOTE-${stamp}-${id.slice(0, 8).toUpperCase()}`;
}

async function resolveRfq(db, rfqId) {
  const row = await db.prepare(
    `SELECT id, status, product_id, product_name, quantity, destination_country, destination_location
       FROM commerce_rfqs
      WHERE id = ?
      LIMIT 1`,
  ).bind(rfqId).first();
  if (!row || !RFQ_QUOTE_ELIGIBLE_STATUSES.includes(row.status)) throw new Error("invalid_quote_rfq");
  return row;
}

async function resolveSupplier(db, supplierId) {
  const row = await db.prepare(
    `SELECT id, status, name
       FROM commerce_suppliers
      WHERE id = ? AND status = 'published'
      LIMIT 1`,
  ).bind(supplierId).first();
  if (!row) throw new Error("invalid_quote_supplier");
  return row;
}

async function resolveProduct(db, productId) {
  if (!productId) return null;
  const row = await db.prepare(
    `SELECT id, name, status, supplier_id
       FROM commerce_products
      WHERE id = ? AND status = 'published'
      LIMIT 1`,
  ).bind(productId).first();
  if (!row) throw new Error("invalid_quote_product");
  return row;
}

export async function createQuote(db, input, now = new Date().toISOString()) {
  requireDb(db);
  const normalized = normalizeQuote(input);
  if (!normalized) throw new Error("invalid_quote");

  const rfq = await resolveRfq(db, normalized.rfq_id);
  const supplier = await resolveSupplier(db, normalized.supplier_id);
  const product = await resolveProduct(db, normalized.product_id);

  if (product && product.supplier_id !== supplier.id) throw new Error("quote_supplier_product_mismatch");
  if (rfq.product_id && product && rfq.product_id !== product.id) throw new Error("quote_rfq_product_mismatch");

  const productName = product?.name || rfq.product_name;
  const quantity = normalized.quantity || rfq.quantity || "";
  const total = calculateTotalMinor(normalized);
  if (total == null) throw new Error("invalid_quote_total");

  const id = crypto.randomUUID();
  const quoteNumber = createQuoteNumber(now, id);
  const status = "draft";

  await db.prepare(
    `INSERT INTO commerce_quotes (
      id, quote_number, rfq_id, supplier_id, product_id, product_name, quantity,
      unit_price_minor, currency, packaging_cost_minor, shipping_cost_minor,
      insurance_cost_minor, other_fees_minor, total_amount_minor, lead_time,
      validity_until, payment_terms, incoterm, destination, notes, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id, quoteNumber, rfq.id, supplier.id, product?.id || null, productName, quantity,
    normalized.unit_price_minor, normalized.currency, normalized.packaging_cost_minor,
    normalized.shipping_cost_minor, normalized.insurance_cost_minor, normalized.other_fees_minor,
    total, normalized.lead_time, normalized.validity_until, normalized.payment_terms,
    normalized.incoterm, normalized.destination || rfq.destination_location || rfq.destination_country || null,
    normalized.notes, status, now, now,
  ).run();

  return publicQuote({
    ...normalized,
    rfq_id: rfq.id,
    product_id: product?.id || null,
    product_name: productName,
    quantity,
    quote_number: quoteNumber,
    total_amount_minor: total,
    status,
    created_at: now,
    updated_at: now,
  });
}
