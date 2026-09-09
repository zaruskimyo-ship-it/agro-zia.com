CREATE TABLE IF NOT EXISTS supplier_accounts (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  FOREIGN KEY (supplier_id) REFERENCES commerce_suppliers(id),
  CHECK (status IN ('active','blocked'))
);

CREATE INDEX IF NOT EXISTS idx_supplier_accounts_supplier ON supplier_accounts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_accounts_email ON supplier_accounts(email);
CREATE INDEX IF NOT EXISTS idx_supplier_accounts_status ON supplier_accounts(status);

CREATE TABLE IF NOT EXISTS supplier_login_challenges (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES supplier_accounts(id),
  CHECK (attempts >= 0 AND attempts <= 5)
);

CREATE INDEX IF NOT EXISTS idx_supplier_login_challenges_email ON supplier_login_challenges(email, created_at);
CREATE INDEX IF NOT EXISTS idx_supplier_login_challenges_expiry ON supplier_login_challenges(expires_at);
