-- Stage 11: independent B2B supplier/quote layer for agrozia.ir.
-- No legacy commerce tables or production data are referenced.
CREATE TABLE IF NOT EXISTS commerce_suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  country TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (status IN ('draft','published','archived'))
);

CREATE TABLE IF NOT EXISTS commerce_rfq_supplier_matches (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'matched',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (rfq_id) REFERENCES commerce_rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id) ON DELETE RESTRICT,
  UNIQUE (rfq_id, supplier_id),
  CHECK (status IN ('matched','declined','removed'))
);

CREATE TABLE IF NOT EXISTS commerce_quotes (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  rfq_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  packaging_cost_minor INTEGER NOT NULL DEFAULT 0,
  shipping_cost_minor INTEGER NOT NULL DEFAULT 0,
  insurance_cost_minor INTEGER NOT NULL DEFAULT 0,
  other_fees_minor INTEGER NOT NULL DEFAULT 0,
  total_amount_minor INTEGER NOT NULL,
  lead_time TEXT,
  validity_until TEXT,
  payment_terms TEXT,
  incoterm TEXT,
  destination TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (rfq_id) REFERENCES commerce_rfqs(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id) ON DELETE RESTRICT,
  FOREIGN KEY (product_id) REFERENCES commerce_products(id) ON DELETE RESTRICT,
  CHECK (status IN ('draft','sent','accepted','rejected','expired','converted','cancelled')),
  CHECK (unit_price_minor >= 0),
  CHECK (packaging_cost_minor >= 0),
  CHECK (shipping_cost_minor >= 0),
  CHECK (insurance_cost_minor >= 0),
  CHECK (other_fees_minor >= 0),
  CHECK (total_amount_minor >= 0)
);

CREATE INDEX IF NOT EXISTS idx_store_matches_rfq ON commerce_rfq_supplier_matches(rfq_id);
CREATE INDEX IF NOT EXISTS idx_store_matches_supplier ON commerce_rfq_supplier_matches(supplier_id);
CREATE INDEX IF NOT EXISTS idx_store_quotes_rfq ON commerce_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_store_quotes_supplier ON commerce_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_store_quotes_status ON commerce_quotes(status);
