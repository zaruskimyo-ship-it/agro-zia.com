import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const live = fs.readFileSync(new URL("../src/site/rfq-live-response.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../src/commerce/rfq-api.js", import.meta.url), "utf8");
const contract = fs.readFileSync(new URL("../src/commerce/rfq-contract.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../_worker.js", import.meta.url), "utf8");

test("RFQ live shell uses the authenticated RFQ API", () => {
  assert.match(live, /fetch\('\/api\/rfqs'/);
  assert.match(live, /credentials:'same-origin'/);
  assert.match(live, /content-type.*application\/json/);
  assert.match(live, /status===401/);
});

test("RFQ live shell loads published products through the public catalog API", () => {
  assert.match(live, /fetch\('\/api\/products'/);
  assert.match(live, /No published products/);
  assert.match(live, /product_id/);
});

test("RFQ live shell has review, validation and failure states", () => {
  assert.match(live, /Review RFQ/);
  assert.match(live, /Please select a published product or enter a product name/);
  assert.match(live, /RFQ service is temporarily unavailable/);
  assert.match(live, /No RFQ was created/);
});

test("RFQ live shell does not manufacture a confirmation number", () => {
  assert.doesNotMatch(live, /AGZ-RFQ-\d{4,}/);
  assert.match(live, /out\.rfq\?\.request_number/);
});

test("RFQ API remains customer-authenticated and ownership-scoped", () => {
  assert.match(api, /getCustomerFromSession/);
  assert.match(api, /authentication_required/);
  assert.match(api, /createRfq\(env\.STORE_DB, customer, input\)/);
  assert.match(api, /listCustomerRfqs\(env\.STORE_DB, customer\.id/);
});

test("RFQ contract keeps published-product validation and attachment-count bounds", () => {
  assert.match(contract, /resolvePublishedProduct|published/);
  assert.match(contract, /MAX_ATTACHMENTS = 10/);
  assert.match(contract, /attachmentCount > MAX_ATTACHMENTS/);
});

test("worker routes RFQ UI and API through Store-only handlers", () => {
  assert.match(worker, /handleStoreRfqs/);
  assert.match(worker, /rfqLiveSiteResponse/);
  assert.match(worker, /url\.pathname === "\/api\/rfqs"/);
  assert.match(worker, /url\.pathname === "\/rfq"/);
});
