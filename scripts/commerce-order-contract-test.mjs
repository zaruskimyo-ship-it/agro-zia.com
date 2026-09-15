import assert from "node:assert/strict";
import fs from "node:fs";

const contract = fs.readFileSync(new URL("../src/commerce/order-contract.js", import.meta.url), "utf8");
const repo = fs.readFileSync(new URL("../src/commerce/order-repository.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../src/commerce/order-api.js", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../migrations/0007_commerce_orders.sql", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/commerce-5-order.md", import.meta.url), "utf8");

for (const status of ["pending_confirmation", "confirmed", "proforma_pending", "payment_pending", "sourcing", "shipping", "delivered", "completed", "cancelled", "rejected"]) assert.match(migration, new RegExp(`'${status}'`));
assert.match(migration, /quote_id TEXT NOT NULL UNIQUE/);
assert.match(contract, /ORDER_STATUSES/);
assert.match(contract, /publicOrder/);
assert.match(repo, /status !== "accepted"/);
assert.match(repo, /status = 'published'/);
assert.match(repo, /crypto\.randomUUID/);
assert.match(repo, /const status = ORDER_STATUSES\[0\]/);
assert.doesNotMatch(repo, /SELECT \*/);
assert.match(api, /authorized = false/);
assert.match(api, /if \(!authorized\) return json\(\{ error: "not_found" \}, 404\)/);
assert.match(api, /application\/json/);
assert.match(api, /payload_too_large/);
assert.match(api, /unsupported_media_type/);
assert.doesNotMatch(api, /TELEGRAM_BOT_TOKEN|ADMIN_PASSWORD|R2|EMAIL/);
assert.match(docs, /payment, escrow/i);
assert.match(docs, /main.*untouched/i);
console.log("Commerce-5 order contract/security gate: PASS");
