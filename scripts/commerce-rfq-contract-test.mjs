import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const contract = read("src/commerce/rfq-contract.js");
const repository = read("src/commerce/rfq-repository.js");
const api = read("src/commerce/rfq-api.js");
const migration = read("migrations/0004_commerce_rfqs.sql");
const worker = read("_worker.js");

// RFQ status and input bounds are explicit and bounded.
assert.match(contract, /RFQ_STATUSES = Object\.freeze\(\[/);
for (const status of ["submitted", "reviewing", "matched", "quoted", "negotiating", "converted", "cancelled"]) {
  assert.match(contract, new RegExp(`"${status}"`));
}
assert.match(contract, /product_name: 200/);
assert.match(contract, /description: 5000/);
assert.match(contract, /buyer_email: 254/);
assert.match(contract, /MAX_ATTACHMENTS = 10/);

// Public RFQ responses must not expose buyer PII.
const publicContract = contract.slice(contract.indexOf("export function publicRfq"));
for (const privateField of ["buyer_company", "buyer_name", "buyer_email", "buyer_phone"]) {
  assert.doesNotMatch(publicContract, new RegExp(privateField));
}

// Repository must server-generate identity and force the initial workflow state.
assert.match(repository, /crypto\.randomUUID\(\)/);
assert.match(repository, /const status = "submitted"/);
assert.match(repository, /const requestNumber = createRequestNumber\(now, id\)/);
assert.match(repository, /INSERT INTO commerce_rfqs/);
assert.match(repository, /\.bind\(/);
assert.doesNotMatch(repository, /normalized\.status/);
assert.doesNotMatch(repository, /normalized\.request_number/);

// Public API accepts JSON creation only, requires D1, bounds the body, and fails closed.
assert.match(api, /request\.method !== "POST"/);
assert.match(api, /method_not_allowed/);
assert.match(api, /application\\\/json/);
assert.match(api, /unsupported_media_type/);
assert.match(api, /MAX_BODY_BYTES = 32 \* 1024/);
assert.match(api, /payload_too_large/);
assert.match(api, /invalid_json/);
assert.match(api, /invalid_rfq/);
assert.match(api, /env\?\.AGROZIA_DB/);
assert.doesNotMatch(api, /AGROZIA_ATTACHMENTS/);
assert.doesNotMatch(api, /EMAIL/);
assert.doesNotMatch(api, /ADMIN_PASSWORD|ADMIN_SESSION_SECRET/);
assert.match(api, /return json\(\{ rfq \}, 201\)/);

// Worker integration must expose RFQ creation without bypassing the API boundary.
assert.match(worker, /import \{ handlePublicRfqs \} from "\.\/src\/commerce\/rfq-api\.js";/);
assert.match(worker, /url\.pathname === "\/api\/rfqs" && request\.method === "POST"/);
assert.match(worker, /return handlePublicRfqs\(request, env\);/);

// Existing public product and inquiry boundaries remain wired.
assert.match(worker, /handlePublicProducts/);
assert.match(worker, /url\.pathname === "\/api\/products" && request\.method === "GET"/);
assert.match(worker, /url\.pathname === "\/api\/inquiries" && request\.method === "POST"/);

// D1 schema constrains status, boolean semantics and attachment count.
assert.match(migration, /CREATE TABLE IF NOT EXISTS commerce_rfqs/);
assert.match(migration, /CHECK \(status IN \('submitted','reviewing','matched','quoted','negotiating','converted','cancelled'\)\)/);
assert.match(migration, /CHECK \(sample_required IN \(0,1\)\)/);
assert.match(migration, /CHECK \(attachment_count >= 0 AND attachment_count <= 10\)/);
assert.match(migration, /request_number TEXT NOT NULL UNIQUE/);

console.log("Commerce-2 RFQ contract/security checks: PREPARED (runtime execution pending)");
