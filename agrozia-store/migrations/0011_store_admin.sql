CREATE TABLE IF NOT EXISTS store_admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL DEFAULT 310000,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','manager','operator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS store_admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES store_admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_store_admin_sessions_admin
  ON store_admin_sessions(admin_id);

CREATE INDEX IF NOT EXISTS idx_store_admin_sessions_expires
  ON store_admin_sessions(expires_at);
