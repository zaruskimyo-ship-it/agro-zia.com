CREATE TABLE IF NOT EXISTS commerce_suppliers (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT,
  years_active INTEGER,
  description TEXT,
  product_categories_json TEXT NOT NULL DEFAULT '[]',
  production_capacity TEXT,
  moq TEXT,
  export_markets_json TEXT NOT NULL DEFAULT '[]',
  certifications_json TEXT NOT NULL DEFAULT '[]',
  factory_capability TEXT,
  quality_control TEXT,
  verification_level TEXT NOT NULL DEFAULT 'declared',
  verification_updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  CHECK (years_active IS NULL OR (years_active >= 0 AND years_active <= 200)),
  CHECK (verification_level IN ('declared', 'agrozia_checked', 'third_party_verified')),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_commerce_suppliers_status ON commerce_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_commerce_suppliers_country ON commerce_suppliers(country);
CREATE INDEX IF NOT EXISTS idx_commerce_suppliers_verification ON commerce_suppliers(verification_level);
CREATE INDEX IF NOT EXISTS idx_commerce_suppliers_published ON commerce_suppliers(status, published_at);
