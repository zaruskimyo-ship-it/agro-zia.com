-- Stage 9: independent checkout session for agrozia.ir.
-- Checkout never creates an order and never touches legacy commerce data.
CREATE TABLE IF NOT EXISTS commerce_checkouts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  cart_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  currency TEXT NOT NULL,
  subtotal TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_postal_code TEXT,
  idempotency_key TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (cart_id) REFERENCES commerce_carts(id) ON DELETE RESTRICT,
  UNIQUE (customer_id, idempotency_key),
  CHECK (status IN ('open','expired','completed','cancelled')),
  CHECK (length(currency) BETWEEN 3 AND 10),
  CHECK (length(subtotal) BETWEEN 1 AND 80)
);

CREATE TABLE IF NOT EXISTS commerce_checkout_items (
  id TEXT PRIMARY KEY,
  checkout_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT,
  unit_price TEXT NOT NULL,
  currency TEXT NOT NULL,
  line_total TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (checkout_id) REFERENCES commerce_checkouts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_store_checkouts_customer ON commerce_checkouts(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_store_checkouts_status ON commerce_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_store_checkouts_expires ON commerce_checkouts(expires_at);
CREATE INDEX IF NOT EXISTS idx_store_checkout_items_checkout ON commerce_checkout_items(checkout_id);
