import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const contract = read("src/commerce/product-contract.js");
const repository = read("src/commerce/product-repository.js");
const api = read("src/commerce/product-api.js");
const migration = read("migrations/0003_commerce_products.sql");
const worker = read("_worker.js");

// Contract allowlists and bounded fields.
assert.match(contract, /PRODUCT_STATUSES = new Set\(\["draft", "published", "archived"\]\)/);
assert.match(contract, /PRICE_VISIBILITY = new Set\(\["hidden", "starting_from", "fixed", "rfq"\]\)/);
assert.match(contract, /VERIFICATION_LEVELS = new Set\(\["declared", "agrozia_checked", "third_party_verified"\]\)/);
assert.match(contract, /description: 5000/);
assert.match(contract, /shortDescription: 500/);
assert.match(contract, /specifications: safeJson\(input\.specifications\)/);

// Public repository must fail closed to published products and bound list inputs.
assert.match(repository, /status = 'published'/);
assert.match(repository, /const MAX_LIMIT = 50/);
assert.match(repository, /const MAX_SEARCH = 120/);
assert.match(repository, /Math\.min\(10000, Math\.max\(0, offsetRaw\)\)/);
assert.match(repository, /LIMIT \? OFFSET \?/);
assert.match(repository, /WHERE slug = \? AND status = 'published'/);
assert.doesNotMatch(repository, /SELECT \* FROM commerce_products/);

// Public API is read-only and does not accept or expose R2/private bindings.
assert.match(api, /request\.method !== "GET"/);
assert.match(api, /method_not_allowed/);
assert.match(api, /env\.AGROZIA_DB/);
assert.doesNotMatch(api, /AGROZIA_ATTACHMENTS/);
assert.doesNotMatch(api, /EMAIL/);
assert.doesNotMatch(api, /ADMIN_PASSWORD|ADMIN_SESSION_SECRET/);
assert.match(api, /not_found/);

// Schema constraints required for the first public product surface.
assert.match(migration, /CREATE TABLE IF NOT EXISTS commerce_products/);
assert.match(migration, /status TEXT NOT NULL DEFAULT 'draft'/);
assert.match(migration, /CHECK \(status IN \('draft', 'published', 'archived'\)\)/);
assert.match(migration, /CHECK \(price_visibility IN \('hidden', 'starting_from', 'fixed', 'rfq'\)\)/);
assert.match(migration, /CHECK \(verification_level IN \('declared', 'agrozia_checked', 'third_party_verified'\)\)/);
assert.match(migration, /CHECK \(price_min IS NULL OR price_min >= 0\)/);
assert.match(migration, /CHECK \(price_max IS NULL OR price_max >= 0\)/);

// Integration gate: Commerce-1 public API must not silently alter Worker routing yet.
assert.doesNotMatch(worker, /handlePublicProducts/);

console.log("Commerce-1 product API contract/security checks: PASS (static contract gate)");
