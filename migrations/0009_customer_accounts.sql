CREATE TABLE IF NOT EXISTS customer_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  phone TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  CHECK (status IN ('active','blocked'))
);

CREATE INDEX IF NOT EXISTS idx_customer_accounts_email ON customer_accounts(email);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_status ON customer_accounts(status);

CREATE TABLE IF NOT EXISTS customer_login_challenges (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES customer_accounts(id),
  CHECK (attempts >= 0 AND attempts <= 5)
);

CREATE INDEX IF NOT EXISTS idx_customer_login_challenges_email ON customer_login_challenges(email, created_at);
CREATE INDEX IF NOT EXISTS idx_customer_login_challenges_expiry ON customer_login_challenges(expires_at);

ALTER TABLE commerce_rfqs ADD COLUMN customer_account_id TEXT REFERENCES customer_accounts(id);
CREATE INDEX IF NOT EXISTS idx_commerce_rfqs_customer_account ON commerce_rfqs(customer_account_id);
