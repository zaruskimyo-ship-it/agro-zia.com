import assert from "node:assert/strict";
import { createRfq } from "../src/commerce/rfq-repository.js";
import { handlePublicRfqs } from "../src/commerce/rfq-api.js";

const calls = [];
const db = {
  prepare(sql) {
    return {
      bind(...params) {
        calls.push({ sql, params });
        return {
          first: async () =>
            sql.includes("FROM commerce_products")
              ? { id: "prod-001", name: "Canonical Urea 46%", status: "published" }
              : null,
          run: async () => ({ success: true }),
        };
      },
    };
  },
};

const baseInput = {
  product_id: "prod-001",
  product_name: "Client-Supplied Name",
  quantity: "100 MT",
  destination_country: "Turkey",
  destination_location: "Mersin",
  packaging: "50 kg bags",
  private_label: "No",
  sample_required: true,
  documents_required: "COA, SDS",
  target_timing: "Within 30 days",
  description: "B2B sourcing request",
  buyer_company: "Example Buyer",
  buyer_name: "Buyer Name",
  buyer_email: "buyer@example.com",
  buyer_phone: "+90 555 000 0000",
  attachment_count: 2,
};

const created = await createRfq(db, {
  ...baseInput,
  request_number: "CLIENT-CONTROLLED",
  status: "converted",
}, "2026-09-06T12:34:56.000Z");

assert.equal(created.status, "submitted");
assert.match(created.request_number, /^AGZ-RFQ-20260906123456-[A-F0-9]{8}$/);
assert.equal(created.product_name, "Canonical Urea 46%");
assert.equal(created.sample_required, true);
assert.equal(created.attachment_count, 2);
for (const privateField of ["buyer_company", "buyer_name", "buyer_email", "buyer_phone"]) {
  assert.equal(Object.hasOwn(created, privateField), false, `${privateField} leaked`);
}
assert.equal(calls.length, 2);
assert.equal(calls[0].params[0], "prod-001");
assert.equal(calls[1].params[2], "submitted");
assert.notEqual(calls[1].params[1], "CLIENT-CONTROLLED");

const response = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(baseInput),
  }),
  { AGROZIA_DB: db },
);
assert.equal(response.status, 201);
const payload = await response.json();
assert.equal(payload.rfq.status, "submitted");
assert.equal(payload.rfq.product_name, "Canonical Urea 46%");
assert.equal(Object.hasOwn(payload.rfq, "buyer_email"), false);

const wrongMethod = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs"),
  { AGROZIA_DB: db },
);
assert.equal(wrongMethod.status, 405);

const unsupportedMediaType = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: JSON.stringify(baseInput),
  }),
  { AGROZIA_DB: db },
);
assert.equal(unsupportedMediaType.status, 415);
assert.deepEqual(await unsupportedMediaType.json(), { error: "unsupported_media_type" });

const invalidJson = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "not-json",
  }),
  { AGROZIA_DB: db },
);
assert.equal(invalidJson.status, 400);
assert.deepEqual(await invalidJson.json(), { error: "invalid_json" });

const invalidRfq = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ product_name: "" }),
  }),
  { AGROZIA_DB: db },
);
assert.equal(invalidRfq.status, 400);
assert.deepEqual(await invalidRfq.json(), { error: "invalid_rfq" });

const oversized = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ product_name: "Urea", description: "x".repeat(33 * 1024) }),
  }),
  { AGROZIA_DB: db },
);
assert.equal(oversized.status, 413);
assert.deepEqual(await oversized.json(), { error: "payload_too_large" });

const unavailable = await handlePublicRfqs(
  new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }),
  {},
);
assert.equal(unavailable.status, 503);
assert.deepEqual(await unavailable.json(), { error: "rfq_service_unavailable" });

console.log("Commerce-2 RFQ runtime harness: PREPARED (Node/mock-D1 execution pending)");
console.log("Cloudflare Preview/Production runtime: PENDING");
