import { publicOrder } from "./order-contract.js";

function nowIso() { return new Date().toISOString(); }

function requireCustomer(customer) {
  if (!customer || customer.role !== "customer" || customer.status !== "active") throw new Error("authentication_required");
}

async function loadCheckout(db, customerId, checkoutId) {
  return db.prepare(`SELECT id, customer_id, cart_id, status, currency, subtotal,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code,
      expires_at, created_at, updated_at
    FROM commerce_checkouts WHERE id = ?1 AND customer_id = ?2 LIMIT 1`).bind(checkoutId, customerId).first();
}

async function loadCheckoutItems(db, checkoutId) {
  const result = await db.prepare(`SELECT product_id, product_slug, product_name, quantity, unit,
      unit_price, currency, line_total
    FROM commerce_checkout_items WHERE checkout_id = ?1 ORDER BY created_at ASC`).bind(checkoutId).all();
  return result?.results || [];
}

async function loadOrder(db, orderId, customerId) {
  return db.prepare(`SELECT id, order_number, customer_id, checkout_id, status, currency, subtotal, total,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code, created_at, updated_at
    FROM commerce_orders WHERE id = ?1 AND customer_id = ?2 LIMIT 1`).bind(orderId, customerId).first();
}

async function readOrder(db, order) {
  const result = await db.prepare(`SELECT product_id, product_slug, product_name, quantity, unit,
      unit_price, currency, line_total FROM commerce_order_items WHERE order_id = ?1 ORDER BY created_at ASC`).bind(order.id).all();
  return publicOrder(order, result?.results || []);
}

function validOrderableCheckout(checkout) {
  if (!checkout) throw new Error("checkout_not_found");
  if (checkout.status === "expired") throw new Error("checkout_expired");
  if (checkout.status !== "open") throw new Error("checkout_not_orderable");
  if (!checkout.expires_at || new Date(checkout.expires_at).getTime() <= Date.now()) throw new Error("checkout_expired");
}

export async function createDirectOrder(db, customer, checkoutId) {
  requireCustomer(customer);
  const id = typeof checkoutId === "string" ? checkoutId.trim() : "";
  if (!id) throw new Error("invalid_checkout_id");

  const checkout = await loadCheckout(db, customer.id, id);
  validOrderableCheckout(checkout);

  const existing = await db.prepare(`SELECT id, order_number, customer_id, checkout_id, status, currency, subtotal, total,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code, created_at, updated_at
    FROM commerce_orders WHERE checkout_id = ?1 AND customer_id = ?2 LIMIT 1`).bind(id, customer.id).first();
  if (existing) return readOrder(db, existing);

  const items = await loadCheckoutItems(db, id);
  if (!items.length) throw new Error("checkout_empty");

  const orderId = crypto.randomUUID();
  const orderNumber = `AGZ-ORD-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}-${orderId.slice(0, 8).toUpperCase()}`;
  const created = nowIso();

  const orderStatement = db.prepare(`INSERT INTO commerce_orders
    (id, order_number, customer_id, checkout_id, status, currency, subtotal, total,
     customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
     shipping_country, shipping_city, shipping_address, shipping_postal_code, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, 'pending_confirmation', ?5, ?6, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?16)`)
    .bind(orderId, orderNumber, customer.id, id, checkout.currency, checkout.subtotal,
      checkout.customer_name, checkout.customer_email, checkout.customer_phone || null,
      checkout.shipping_name, checkout.shipping_phone, checkout.shipping_country,
      checkout.shipping_city, checkout.shipping_address, checkout.shipping_postal_code || null, created);

  const itemStatements = items.map((item) => db.prepare(`INSERT INTO commerce_order_items
    (id, order_id, product_id, product_slug, product_name, quantity, unit, unit_price, currency, line_total, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`)
    .bind(crypto.randomUUID(), orderId, item.product_id, item.product_slug, item.product_name,
      item.quantity, item.unit || null, item.unit_price, item.currency, item.line_total, created));

  const completeCheckout = db.prepare(`UPDATE commerce_checkouts SET status = 'completed', updated_at = ?2
    WHERE id = ?1 AND customer_id = ?3 AND status = 'open'`).bind(id, created, customer.id);
  const convertCart = db.prepare(`UPDATE commerce_carts SET status = 'converted', updated_at = ?2
    WHERE id = ?1 AND customer_id = ?3 AND status = 'active'`).bind(checkout.cart_id, created, customer.id);

  try {
    await db.batch([orderStatement, ...itemStatements, completeCheckout, convertCart]);
  } catch (error) {
    const raced = await db.prepare(`SELECT id, order_number, customer_id, checkout_id, status, currency, subtotal, total,
        customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
        shipping_country, shipping_city, shipping_address, shipping_postal_code, created_at, updated_at
      FROM commerce_orders WHERE checkout_id = ?1 AND customer_id = ?2 LIMIT 1`).bind(id, customer.id).first();
    if (raced) return readOrder(db, raced);
    throw error;
  }

  const order = await loadOrder(db, orderId, customer.id);
  return readOrder(db, order);
}

export async function getOrder(db, customer, orderId) {
  requireCustomer(customer);
  const id = typeof orderId === "string" ? orderId.trim() : "";
  if (!id) throw new Error("invalid_order_id");
  const order = await loadOrder(db, id, customer.id);
  if (!order) throw new Error("order_not_found");
  return readOrder(db, order);
}
