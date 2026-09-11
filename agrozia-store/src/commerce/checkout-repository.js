import { normalizeCheckoutInput, publicCheckout, multiplyDecimalToMicros, microsToDecimal, CHECKOUT_TTL_MINUTES } from "./checkout-contract.js";

function nowIso() { return new Date().toISOString(); }
function requireCustomer(customer) {
  if (!customer || customer.role !== "customer" || customer.status !== "active") throw new Error("authentication_required");
}

async function loadCart(db, customerId) {
  return db.prepare(`SELECT c.id, c.customer_id, c.status, c.currency
    FROM commerce_carts c WHERE c.customer_id = ?1 LIMIT 1`).bind(customerId).first();
}

async function loadCurrentLines(db, cartId) {
  const result = await db.prepare(`SELECT i.id, i.product_id, i.quantity, i.unit,
      p.slug, p.name, p.status, p.moq, p.availability_status, p.price_visibility,
      p.currency, p.price_min, p.price_max
    FROM commerce_cart_items i
    JOIN commerce_products p ON p.id = i.product_id
    WHERE i.cart_id = ?1 ORDER BY i.created_at ASC`).bind(cartId).all();
  return result?.results || [];
}

function validateProductLine(row) {
  if (!row || row.status !== "published") throw new Error("product_not_available");
  if (row.price_visibility !== "fixed") throw new Error("product_not_direct_sale");
  if (row.price_min == null || row.price_max == null || Number(row.price_min) !== Number(row.price_max)) throw new Error("product_price_not_final");
  if (!row.currency) throw new Error("product_currency_required");
  const quantity = String(row.quantity ?? "").trim();
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(quantity) || Number(quantity) <= 0 || Number(quantity) > 1000000000) throw new Error("invalid_cart_quantity");
  const unitPrice = String(row.price_min);
  const lineMicros = multiplyDecimalToMicros(quantity, unitPrice);
  if (lineMicros === null) throw new Error("price_precision_unsupported");
  return { quantity, unitPrice, lineMicros };
}

async function readCheckoutWithItems(db, checkout) {
  const items = await db.prepare(`SELECT product_id, product_slug, product_name, quantity, unit, unit_price, currency, line_total
    FROM commerce_checkout_items WHERE checkout_id = ?1 ORDER BY created_at ASC`).bind(checkout.id).all();
  return publicCheckout(checkout, items?.results || []);
}

async function expireIfNeeded(db, checkout) {
  if (checkout.status !== "open") return checkout;
  if (!checkout.expires_at || new Date(checkout.expires_at).getTime() > Date.now()) return checkout;
  const updatedAt = nowIso();
  await db.prepare(`UPDATE commerce_checkouts SET status = 'expired', updated_at = ?2
    WHERE id = ?1 AND status = 'open'`).bind(checkout.id, updatedAt).run();
  return { ...checkout, status: "expired", updated_at: updatedAt };
}

async function findExistingByIdempotency(db, customerId, key) {
  return db.prepare(`SELECT id, customer_id, cart_id, status, currency, subtotal,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code,
      idempotency_key, expires_at, created_at, updated_at
    FROM commerce_checkouts WHERE customer_id = ?1 AND idempotency_key = ?2 LIMIT 1`)
    .bind(customerId, key).first();
}

export async function createCheckout(db, customer, input) {
  requireCustomer(customer);
  const normalized = normalizeCheckoutInput(input);
  if (!normalized) throw new Error("invalid_checkout_input");

  let existing = await findExistingByIdempotency(db, customer.id, normalized.idempotency_key);
  if (existing) {
    existing = await expireIfNeeded(db, existing);
    return readCheckoutWithItems(db, existing);
  }

  const cart = await loadCart(db, customer.id);
  if (!cart || cart.status !== "active") throw new Error("cart_not_active");
  const rows = await loadCurrentLines(db, cart.id);
  if (!rows.length) throw new Error("cart_empty");

  let currency = null;
  let subtotalMicros = 0n;
  const lines = [];
  for (const row of rows) {
    const checked = validateProductLine(row);
    if (!currency) currency = row.currency;
    if (currency !== row.currency) throw new Error("cart_currency_mismatch");
    if (cart.currency && cart.currency !== row.currency) throw new Error("cart_currency_mismatch");
    if (row.moq) {
      const moq = String(row.moq).match(/^(?:\d+(?:\.\d+)?|\.\d+)$/)?.[0];
      if (moq && Number(checked.quantity) < Number(moq)) throw new Error("quantity_below_moq");
    }
    if (["out_of_stock", "discontinued", "unavailable"].includes(String(row.availability_status || "").toLowerCase())) throw new Error("product_unavailable");
    subtotalMicros += checked.lineMicros;
    lines.push({
      product_id: row.product_id,
      product_slug: row.slug,
      product_name: row.name,
      quantity: checked.quantity,
      unit: row.unit || null,
      unit_price: checked.unitPrice,
      currency: row.currency,
      line_total: microsToDecimal(checked.lineMicros),
    });
  }

  const created = nowIso();
  const expires = new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000).toISOString();
  const checkoutId = crypto.randomUUID();
  const subtotal = microsToDecimal(subtotalMicros);
  const checkoutStatement = db.prepare(`INSERT INTO commerce_checkouts
    (id, customer_id, cart_id, status, currency, subtotal, customer_name, customer_email, customer_phone,
     shipping_name, shipping_phone, shipping_country, shipping_city, shipping_address, shipping_postal_code,
     idempotency_key, expires_at, created_at, updated_at)
    VALUES (?1, ?2, ?3, 'open', ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?17)`)
    .bind(checkoutId, customer.id, cart.id, currency, subtotal, customer.name, customer.email, customer.phone || null,
      normalized.shipping_address.name, normalized.shipping_address.phone, normalized.shipping_address.country,
      normalized.shipping_address.city, normalized.shipping_address.address, normalized.shipping_address.postal_code || null,
      normalized.idempotency_key, expires, created);

  const itemStatements = lines.map((line) => db.prepare(`INSERT INTO commerce_checkout_items
      (id, checkout_id, product_id, product_slug, product_name, quantity, unit, unit_price, currency, line_total, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`)
    .bind(crypto.randomUUID(), checkoutId, line.product_id, line.product_slug, line.product_name, line.quantity,
      line.unit, line.unit_price, line.currency, line.line_total, created));

  try {
    await db.batch([checkoutStatement, ...itemStatements]);
  } catch (error) {
    // The unique customer/idempotency constraint closes the concurrent-request race.
    // If another request won the race, return that checkout instead of leaking a 500.
    const raced = await findExistingByIdempotency(db, customer.id, normalized.idempotency_key);
    if (raced) {
      const current = await expireIfNeeded(db, raced);
      return readCheckoutWithItems(db, current);
    }
    throw error;
  }

  const checkout = await db.prepare(`SELECT id, customer_id, cart_id, status, currency, subtotal,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code,
      idempotency_key, expires_at, created_at, updated_at
    FROM commerce_checkouts WHERE id = ?1`).bind(checkoutId).first();
  return publicCheckout(checkout, lines);
}

export async function getCheckout(db, customer, checkoutId) {
  requireCustomer(customer);
  const id = typeof checkoutId === "string" ? checkoutId.trim() : "";
  if (!id) throw new Error("invalid_checkout_id");
  let checkout = await db.prepare(`SELECT id, customer_id, cart_id, status, currency, subtotal,
      customer_name, customer_email, customer_phone, shipping_name, shipping_phone,
      shipping_country, shipping_city, shipping_address, shipping_postal_code,
      idempotency_key, expires_at, created_at, updated_at
    FROM commerce_checkouts WHERE id = ?1 AND customer_id = ?2 LIMIT 1`).bind(id, customer.id).first();
  if (!checkout) throw new Error("checkout_not_found");
  checkout = await expireIfNeeded(db, checkout);
  return readCheckoutWithItems(db, checkout);
}
