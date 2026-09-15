import assert from "node:assert/strict";
import fs from "node:fs";

const contract = fs.readFileSync(new URL("../src/commerce/quote-contract.js", import.meta.url), "utf8");
const repo = fs.readFileSync(new URL("../src/commerce/quote-repository.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../src/commerce/quote-api.js", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../migrations/0006_commerce_quotes.sql", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/commerce-4-quotation.md", import.meta.url), "utf8");

for (const status of ["draft", "sent", "negotiating", "accepted", "rejected", "expired", "withdrawn"]) assert.match(migration, new RegExp(`'${status}'`));
for (const status of ["matched", "quoted", "negotiating"]) assert.match(contract, new RegExp(`"${status}"`));
assert.match(contract, /MAX_MONEY_MINOR/);
assert.match(contract, /Number\.isInteger/);
assert.match(contract, /total_amount_minor/);
assert.match(contract, /publicQuote/);
assert.match(contract, /notes/);
assert.match(repo, /status = 'published'/);
assert.match(repo, /WHERE id = \?/);
assert.match(repo, /FROM commerce_rfqs/);
assert.match(repo, /FROM commerce_suppliers/);
assert.match(repo, /FROM commerce_products/);
assert.match(repo, /crypto\.randomUUID/);
assert.match(repo, /const status = "draft"/);
assert.doesNotMatch(repo, /SELECT \*/);
assert.match(api, /authorized = false/);
assert.match(api, /if \(!authorized\) return json\(\{ error: "not_found" \}, 404\)/);
assert.match(api, /application\/json/);
assert.match(api, /payload_too_large/);
assert.match(api, /unsupported_media_type/);
assert.doesNotMatch(api, /TELEGRAM_BOT_TOKEN|ADMIN_PASSWORD|R2|EMAIL/);
assert.match(docs, /Non-goals/);
assert.match(docs, /Payment, escrow/);
assert.match(docs, /main.*untouched/);

console.log("Commerce-4 quotation contract/security gate: PASS");
