-- Stage 4 foundation only.
-- Commerce/customer tables are intentionally deferred to later stages.
-- This migration verifies that the new Store D1 is independently owned by agrozia.ir.
CREATE TABLE IF NOT EXISTS store_foundation (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  service_name TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO store_foundation (id, service_name, schema_version, created_at)
VALUES (1, 'agrozia-store', 'stage-4-foundation', datetime('now'));
