CREATE TABLE IF NOT EXISTS commerce_categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES commerce_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_commerce_categories_parent
  ON commerce_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_commerce_categories_status
  ON commerce_categories(status);

CREATE TABLE IF NOT EXISTS commerce_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  origin_country TEXT,
  moq TEXT,
  unit TEXT,
  availability_status TEXT,
  lead_time TEXT,
  price_visibility TEXT NOT NULL DEFAULT 'rfq',
  currency TEXT,
  price_min REAL,
  price_max REAL,
  supply_capacity TEXT,
  incoterms TEXT,
  short_description TEXT,
  description TEXT,
  specifications_json TEXT NOT NULL DEFAULT '{}',
  packaging TEXT,
  application TEXT,
  supplier_id TEXT,
  origin_statement TEXT,
  verification_level TEXT NOT NULL DEFAULT 'declared',
  verification_updated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (category_id) REFERENCES commerce_categories(id),
  CHECK (status IN ('draft', 'published', 'archived')),
  CHECK (price_visibility IN ('hidden', 'starting_from', 'fixed', 'rfq')),
  CHECK (verification_level IN ('declared', 'agrozia_checked', 'third_party_verified')),
  CHECK (price_min IS NULL OR price_min >= 0),
  CHECK (price_max IS NULL OR price_max >= 0),
  CHECK (price_min IS NULL OR price_max IS NULL OR price_max >= price_min)
);

CREATE INDEX IF NOT EXISTS idx_commerce_products_status
  ON commerce_products(status);
CREATE INDEX IF NOT EXISTS idx_commerce_products_category
  ON commerce_products(category_id);
CREATE INDEX IF NOT EXISTS idx_commerce_products_supplier
  ON commerce_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_commerce_products_published
  ON commerce_products(status, published_at);
