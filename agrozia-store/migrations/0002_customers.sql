-- Stage 5: independent customer identity for agrozia.ir.
-- No data is copied from the existing agro-zia.com database.
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL DEFAULT 310000,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  country TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role = 'customer'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  email_verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
