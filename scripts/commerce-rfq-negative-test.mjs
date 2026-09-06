import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const contract = read("src/commerce/rfq-contract.js");
const repository = read("src/commerce/rfq-repository.js");
const api = read("src/commerce/rfq-api.js");
const worker = read("_worker.js");

// Negative input bounds must be enforced before persistence.
assert.match(contract, /product_name: 200/);
assert.match(contract, /description: 5000/);
assert.match(contract, /buyer_email: 254/);
assert.match(contract, /MAX_ATTACHMENTS = 10/);
assert.match(contract, /if \(attachmentCount < 0 \|\| attachmentCount > MAX_ATTACHMENTS\) return null/);

// Client-controlled workflow identity must never override server state.
assert.match(repository, /const id = crypto\.randomUUID\(\)/);
assert.match(repository, /const requestNumber = createRequestNumber\(now, id\)/);
assert.match(repository, /const status = "submitted"/);
assert.doesNotMatch(repository, /normalized\.request_number/);
assert.doesNotMatch(repository, /normalized\.status/);

// Oversized, malformed and wrong-method requests fail closed.
assert.match(api, /MAX_BODY_BYTES = 32 \* 1024/);
assert.match(api, /body\.byteLength > MAX_BODY_BYTES/);
assert.match(api, /request\.method !== "POST"/);
assert.match(api, /invalid_json/);
assert.match(api, /invalid_rfq/);
assert.match(api, /payload_too_large/);
assert.match(api, /return json\(\{ error: "rfq_service_unavailable" \}, 503\)/);

// Public RFQ responses must not expose buyer PII.
const publicContract = contract.slice(contract.indexOf("export function publicRfq"));
for (const privateField of ["buyer_company", "buyer_name", "buyer_email", "buyer_phone"]) {
  assert.doesNotMatch(publicContract, new RegExp(privateField));
}

// The public boundary must not gain direct privileged bindings.
assert.doesNotMatch(api, /AGROZIA_ATTACHMENTS/);
assert.doesNotMatch(api, /EMAIL/);
assert.doesNotMatch(api, /ADMIN_PASSWORD|ADMIN_SESSION_SECRET/);

// Route must remain POST-only and isolated from existing public boundaries.
assert.match(worker, /url\.pathname === "\/api\/rfqs" && request\.method === "POST"/);
assert.match(worker, /return handlePublicRfqs\(request, env\);/);
assert.match(worker, /url\.pathname === "\/api\/products" && request\.method === "GET"/);
assert.match(worker, /url\.pathname === "\/api\/inquiries" && request\.method === "POST"/);

console.log("Commerce-2 RFQ negative security checks: PREPARED (runtime execution pending)");
