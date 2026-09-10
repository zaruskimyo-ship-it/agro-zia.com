import assert from "node:assert/strict";
import { normalizeRfq, publicRfq, RFQ_STATUSES, MAX_ATTACHMENTS } from "../src/commerce/rfq-contract.js";

const normalized = normalizeRfq({
  language: "en",
  product_id: "product-1",
  product_name: "NPK 20-20-20",
  quantity: "500 MT",
  destination_country: "Turkey",
  target_timing: "4 weeks",
  description: "Technical grade required",
  sample_required: true,
  attachment_count: 2,
  buyer_email: "private@example.com",
  buyer_company: "Private Co",
});

assert.ok(normalized);
assert.equal(normalized.product_name, "NPK 20-20-20");
assert.equal(normalized.sample_required, true);
assert.equal(normalized.attachment_count, 2);
assert.equal("buyer_email" in normalized, false);
assert.equal("buyer_company" in normalized, false);
assert.equal(RFQ_STATUSES.includes("submitted"), true);
assert.equal(MAX_ATTACHMENTS, 10);

const publicView = publicRfq({
  request_number: "AGZ-RFQ-TEST",
  status: "submitted",
  language: "en",
  product_id: "product-1",
  product_name: "NPK 20-20-20",
  quantity: "500 MT",
  destination_country: "Turkey",
  buyer_email: "private@example.com",
  buyer_company: "Private Co",
  buyer_name: "Private Buyer",
  buyer_phone: "+000000",
  attachment_count: 0,
});

assert.equal(publicView.request_number, "AGZ-RFQ-TEST");
assert.equal("buyer_email" in publicView, false);
assert.equal("buyer_company" in publicView, false);
assert.equal("buyer_name" in publicView, false);
assert.equal("buyer_phone" in publicView, false);
assert.equal(normalizeRfq({ product_name: "" }), null);
assert.equal(normalizeRfq({ product_name: "Valid", attachment_count: 11 }), null);
assert.equal(normalizeRfq({ product_name: "Valid", attachment_count: -1 }), null);
console.log("Store RFQ contract tests: PASS");
