import { normalizeCartItem, publicCart } from "./cart-contract.js";

function nowIso() { return new Date().toISOString(); }

async function ensureCart(db, customerId) {
  const existing = await db.prepare("SELECT id, customer_id, status, currency, created_at, updated_at FROM commerce_carts WHERE customer_id = ?1 LIMIT 1")
    .bind(customerId).first();
  if (existing) return existing;
  const id = crypto.randomUUID();
  const now = nowIso();
  await db.prepare(`INSERT INTO commerce_carts (id, customer_id, status, created_at, updated_at) VALUES (?1, ?2, 'active', ?3, ?3)`)
    .bind(id, customerId, now).run();
  return { id, customer_id: customerId, status: "active", currency: null, created_at: now, updated_at: now };
}

async function readCart(db, customerId) {
  const cart = await ensureCart(db, customerId);
  const rows = await db.prepare(`SELECT i.id, i.product_id, p.slug, p.name, p.brand, i.quantity, i.unit,
    p.price_visibility, p.currency, p.price_min, p.price_max
    FROM commerce_cart_items i
    JOIN commerce_products p ON p.id = i.product_id
    WHERE i.cart_id = ?1 AND p.status = 'published'
    ORDER BY i.created_at ASC`).bind(cart.id).all();
  return publicCart(cart, rows?.results || []);
}

function requireCustomer(customer) {
  if (!customer || customer.role !== "customer" || customer.status !== "active") throw new Error("authentication_required");
}

export async function getCart(db, customer) {
  requireCustomer(customer);
  return readCart(db, customer.id);
}

export async function addCartItem(db, customer, input) {
  requireCustomer(customer);
  const item = normalizeCartItem(input);
  if (!item) throw new Error("invalid_cart_item");

  const product = await db.prepare(`SELECT id, unit, currency FROM commerce_products WHERE id = ?1 AND status = 'published' LIMIT 1`)
    .bind(item.product_id).first();
  if (!product) throw new Error("product_not_available");

  const cart = await ensureCart(db, customer.id);
  if (cart.status !== "active") throw new Error("cart_not_active");
  const now = nowIso();
  const existing = await db.prepare("SELECT id FROM commerce_cart_items WHERE cart_id = ?1 AND product_id = ?2 LIMIT 1")
    .bind(cart.id, product.id).first();
  if (existing) {
    await db.prepare("UPDATE commerce_cart_items SET quantity = ?1, unit = ?2, updated_at = ?3 WHERE id = ?4")
      .bind(item.quantity, product.unit || null, now, existing.id).run();
  } else {
    await db.prepare(`INSERT INTO commerce_cart_items (id, cart_id, product_id, quantity, unit, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)`).bind(crypto.randomUUID(), cart.id, product.id, item.quantity, product.unit || null, now).run();
  }
  await db.prepare("UPDATE commerce_carts SET currency = COALESCE(currency, ?1), updated_at = ?2 WHERE id = ?3")
    .bind(product.currency || null, now, cart.id).run();
  return readCart(db, customer.id);
}

export async function removeCartItem(db, customer, productId) {
  requireCustomer(customer);
  const id = typeof productId === "string" ? productId.trim().slice(0, 128) : "";
  if (!id) throw new Error("invalid_cart_item");
  const cart = await ensureCart(db, customer.id);
  const now = nowIso();
  await db.prepare("DELETE FROM commerce_cart_items WHERE cart_id = ?1 AND product_id = ?2")
    .bind(cart.id, id).run();
  await db.prepare("UPDATE commerce_carts SET updated_at = ?1 WHERE id = ?2").bind(now, cart.id).run();
  return readCart(db, customer.id);
}

export async function clearCart(db, customer) {
  requireCustomer(customer);
  const cart = await ensureCart(db, customer.id);
  const now = nowIso();
  await db.prepare("DELETE FROM commerce_cart_items WHERE cart_id = ?1").bind(cart.id).run();
  await db.prepare("UPDATE commerce_carts SET updated_at = ?1 WHERE id = ?2").bind(now, cart.id).run();
  return readCart(db, customer.id);
}
