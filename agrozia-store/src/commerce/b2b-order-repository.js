import { normalizeB2BOrderId, publicB2BOrder, publicB2BOrderItem } from "./b2b-order-contract.js";

function requireCustomer(customer) {
  if (!customer || customer.role !== "customer" || customer.status !== "active") throw new Error("authentication_required");
}

function nowIso() { return new Date().toISOString(); }

async function loadQuote(db, customerId, quoteId) {
  return db.prepare(`SELECT q.id, q.quote_number, q.rfq_id, q.supplier_id, q.product_id, q.product_name,
      q.quantity, q.unit_price_minor, q.currency, q.packaging_cost_minor, q.shipping_cost_minor,
      q.insurance_cost_minor, q.other_fees_minor, q.total_amount_minor, q.lead_time, q.validity_until,
      q.payment_terms, q.incoterm, q.destination, q.notes, q.status,
      r.customer_id AS rfq_customer_id, r.status AS rfq_status,
      s.status AS supplier_status,
      p.status AS product_status
    FROM commerce_quotes q
    JOIN commerce_rfqs r ON r.id = q.rfq_id
    JOIN commerce_suppliers s ON s.id = q.supplier_id
    LEFT JOIN commerce_products p ON p.id = q.product_id
    WHERE q.id = ?1 AND r.customer_id = ?2 LIMIT 1`).bind(quoteId, customerId).first();
}

async function hasActiveMatch(db, rfqId, supplierId) {
  return db.prepare(`SELECT id FROM commerce_rfq_supplier_matches
    WHERE rfq_id = ?1 AND supplier_id = ?2 AND status = 'matched' LIMIT 1`).bind(rfqId, supplierId).first();
}

async function loadOrder(db, orderId, customerId) {
  return db.prepare(`SELECT id, order_number, customer_id, rfq_id, quote_id, supplier_id, status,
      currency, subtotal_minor, total_minor, product_id, product_name, quantity, unit_price_minor,
      lead_time, incoterm, destination, payment_terms, notes, customer_name, customer_email,
      customer_phone, created_at, updated_at
    FROM commerce_b2b_orders WHERE id = ?1 AND customer_id = ?2 LIMIT 1`).bind(orderId, customerId).first();
}

async function readOrder(db, order) {
  const result = await db.prepare(`SELECT product_id, product_name, quantity, unit_price_minor,
      currency, line_total_minor FROM commerce_b2b_order_items WHERE order_id = ?1 ORDER BY created_at ASC`)
    .bind(order.id).all();
  return publicB2BOrder(order, (result?.results || []).map(publicB2BOrderItem));
}

function quoteStillValid(quote) {
  if (!quote) throw new Error("quote_not_found");
  if (quote.status !== "accepted") throw new Error("quote_not_accepted");
  if (quote.validity_until && new Date(quote.validity_until).getTime() <= Date.now()) throw new Error("quote_expired");
  if (quote.supplier_status !== "published") throw new Error("supplier_not_available");
  if (quote.product_id && quote.product_status !== "published") throw new Error("product_not_available");
  if (!quote.rfq_customer_id) throw new Error("invalid_quote_rfq");
}

export async function createB2BOrder(db, customer, quoteId) {
  requireCustomer(customer);
  const id = normalizeB2BOrderId(quoteId);
  if (!id) throw new Error("invalid_quote_id");

  const existing = await db.prepare(`SELECT id, order_number, customer_id, rfq_id, quote_id, supplier_id, status,
      currency, subtotal_minor, total_minor, product_id, product_name, quantity, unit_price_minor,
      lead_time, incoterm, destination, payment_terms, notes, customer_name, customer_email,
      customer_phone, created_at, updated_at
    FROM commerce_b2b_orders WHERE quote_id = ?1 AND customer_id = ?2 LIMIT 1`).bind(id, customer.id).first();
  if (existing) return readOrder(db, existing);

  const quote = await loadQuote(db, customer.id, id);
  quoteStillValid(quote);
  const match = await hasActiveMatch(db, quote.rfq_id, quote.supplier_id);
  if (!match) throw new Error("supplier_match_required");
  if (quote.product_id) {
    const rfq = await db.prepare(`SELECT product_id FROM commerce_rfqs WHERE id = ?1 LIMIT 1`).bind(quote.rfq_id).first();
    if (rfq?.product_id && rfq.product_id !== quote.product_id) throw new Error("invalid_order_product");
  }

  const orderId = crypto.randomUUID();
  const orderNumber = `AGZ-B2B-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}-${orderId.slice(0, 8).toUpperCase()}`;
  const created = nowIso();
  const itemId = crypto.randomUUID();
  const orderStatement = db.prepare(`INSERT INTO commerce_b2b_orders
    (id, order_number, customer_id, rfq_id, quote_id, supplier_id, status, currency,
     subtotal_minor, total_minor, product_id, product_name, quantity, unit_price_minor,
     lead_time, incoterm, destination, payment_terms, notes, customer_name, customer_email,
     customer_phone, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending_confirmation', ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?22)`)
    .bind(orderId, orderNumber, customer.id, quote.rfq_id, quote.id, quote.supplier_id, quote.currency,
      quote.total_amount_minor, quote.total_amount_minor, quote.product_id || null, quote.product_name,
      quote.quantity, quote.unit_price_minor, quote.lead_time || null, quote.incoterm || null,
      quote.destination || null, quote.payment_terms || null, quote.notes || null, customer.name,
      customer.email, customer.phone || null, created);

  const itemStatement = db.prepare(`INSERT INTO commerce_b2b_order_items
    (id, order_id, product_id, product_name, quantity, unit_price_minor, currency, line_total_minor, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`)
    .bind(itemId, orderId, quote.product_id || null, quote.product_name, quote.quantity,
      quote.unit_price_minor, quote.currency, quote.total_amount_minor, created);

  const quoteUpdate = db.prepare(`UPDATE commerce_quotes SET status = 'converted', updated_at = ?2
    WHERE id = ?1 AND status = 'accepted'` ).bind(quote.id, created);
  const rfqUpdate = db.prepare(`UPDATE commerce_rfqs SET status = 'converted', updated_at = ?2
    WHERE id = ?1 AND status IN ('quoted','negotiating','matched')` ).bind(quote.rfq_id, created);

  try {
    await db.batch([orderStatement, itemStatement, quoteUpdate, rfqUpdate]);
  } catch (error) {
    const raced = await db.prepare(`SELECT id, order_number, customer_id, rfq_id, quote_id, supplier_id, status,
        currency, subtotal_minor, total_minor, product_id, product_name, quantity, unit_price_minor,
        lead_time, incoterm, destination, payment_terms, notes, customer_name, customer_email,
        customer_phone, created_at, updated_at
      FROM commerce_b2b_orders WHERE quote_id = ?1 AND customer_id = ?2 LIMIT 1`).bind(id, customer.id).first();
    if (raced) return readOrder(db, raced);
    throw error;
  }

  const order = await loadOrder(db, orderId, customer.id);
  return readOrder(db, order);
}

export async function getB2BOrder(db, customer, orderId) {
  requireCustomer(customer);
  const id = normalizeB2BOrderId(orderId);
  if (!id) throw new Error("invalid_order_id");
  const order = await loadOrder(db, id, customer.id);
  if (!order) throw new Error("order_not_found");
  return readOrder(db, order);
}
