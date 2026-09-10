import { ORDER_STATUSES, normalizeOrderInput, publicOrder } from "./order-contract.js";

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function createOrderNumber(now, id) {
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AGZ-ORDER-${stamp}-${id.slice(0, 8).toUpperCase()}`;
}

export async function createOrder(db, input, now = new Date().toISOString()) {
  requireDb(db);
  const normalized = normalizeOrderInput(input);
  if (!normalized) throw new Error("invalid_order");

  const quote = await db.prepare(
    `SELECT q.id, q.quote_number, q.rfq_id, q.supplier_id, q.product_id, q.product_name,
            q.quantity, q.currency, q.unit_price_minor, q.total_amount_minor, q.status,
            q.destination, r.product_id AS rfq_product_id, r.product_name AS rfq_product_name,
            r.buyer_company, r.buyer_name, r.buyer_email, r.buyer_phone
       FROM commerce_quotes q
       JOIN commerce_rfqs r ON r.id = q.rfq_id
      WHERE q.id = ?
      LIMIT 1`,
  ).bind(normalized.quote_id).first();
  if (!quote || quote.status !== "accepted") throw new Error("invalid_order_quote");

  if (quote.rfq_product_id && quote.product_id !== quote.rfq_product_id) {
    throw new Error("invalid_order_product");
  }

  const supplier = await db.prepare(
    `SELECT id, status FROM commerce_suppliers WHERE id = ? AND status = 'published' LIMIT 1`,
  ).bind(quote.supplier_id).first();
  if (!supplier) throw new Error("invalid_order_supplier");

  if (quote.product_id) {
    const product = await db.prepare(
      `SELECT id, name, supplier_id, status FROM commerce_products WHERE id = ? AND status = 'published' LIMIT 1`,
    ).bind(quote.product_id).first();
    if (!product || product.supplier_id !== supplier.id) throw new Error("invalid_order_product");
  }

  const existing = await db.prepare(
    `SELECT id, order_number, quote_id, rfq_id, supplier_id, product_id, product_name,
            quantity, currency, unit_price_minor, quoted_amount_minor, destination,
            status, buyer_company, buyer_name, buyer_email, buyer_phone, created_at, updated_at
       FROM commerce_orders
      WHERE quote_id = ?
      LIMIT 1`,
  ).bind(quote.id).first();
  if (existing) return publicOrder(existing);

  const id = crypto.randomUUID();
  const orderNumber = createOrderNumber(now, id);
  const status = ORDER_STATUSES[0];
  const destination = quote.destination || null;

  try {
    await db.prepare(
      `INSERT INTO commerce_orders (
        id, order_number, quote_id, rfq_id, supplier_id, product_id, product_name,
        quantity, currency, unit_price_minor, quoted_amount_minor, destination,
        status, buyer_company, buyer_name, buyer_email, buyer_phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id, orderNumber, quote.id, quote.rfq_id, supplier.id, quote.product_id || null,
      quote.product_name || quote.rfq_product_name, quote.quantity, quote.currency,
      quote.unit_price_minor, quote.total_amount_minor, destination, status,
      quote.buyer_company || null, quote.buyer_name || null, quote.buyer_email || null,
      quote.buyer_phone || null, now, now,
    ).run();
  } catch (error) {
    const duplicate = await db.prepare(
      `SELECT id, order_number, quote_id, rfq_id, supplier_id, product_id, product_name,
              quantity, currency, unit_price_minor, quoted_amount_minor, destination,
              status, buyer_company, buyer_name, buyer_email, buyer_phone, created_at, updated_at
         FROM commerce_orders
        WHERE quote_id = ?
        LIMIT 1`,
    ).bind(quote.id).first();
    if (duplicate) return publicOrder(duplicate);
    throw error;
  }

  return publicOrder({
    id,
    order_number: orderNumber,
    quote_id: quote.id,
    rfq_id: quote.rfq_id,
    supplier_id: supplier.id,
    product_id: quote.product_id || null,
    product_name: quote.product_name || quote.rfq_product_name,
    quantity: quote.quantity,
    currency: quote.currency,
    unit_price_minor: quote.unit_price_minor,
    quoted_amount_minor: quote.total_amount_minor,
    destination,
    status,
    created_at: now,
    updated_at: now,
  });
}
