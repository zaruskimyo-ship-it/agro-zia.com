ALTER TABLE commerce_quotes ADD COLUMN inflation_adjustment_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE commerce_quotes ADD COLUMN inflation_adjustment_bps INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_commerce_quotes_inflation_bps ON commerce_quotes(inflation_adjustment_bps);
