import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const live = fs.readFileSync(new URL("../src/site/account-rfqs-live-response.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../src/commerce/rfq-api.js", import.meta.url), "utf8");
const repository = fs.readFileSync(new URL("../src/commerce/rfq-repository.js", import.meta.url), "utf8");
const contract = fs.readFileSync(new URL("../src/commerce/rfq-contract.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../_worker.js", import.meta.url), "utf8");

test("account RFQs load only through the authenticated customer endpoint", () => {
  assert.match(live, /fetch\('\/api\/customer\/rfqs\?limit=50'/);
  assert.match(live, /credentials:'same-origin'/);
  assert.match(live, /status===401/);
});

test("account RFQs expose real request references and state", () => {
  assert.match(live, /rfq\.request_number/);
  assert.match(live, /rfq\.status/);
  assert.match(live, /rfq\.product_name/);
  assert.doesNotMatch(live, /AGZ-RFQ-\d{4,}/);
});

test("RFQ repository scopes listing by authenticated customer id", () => {
  assert.match(repository, /WHERE customer_id = \?/);
  assert.match(repository, /listCustomerRfqs\(db, customerId/);
});

test("RFQ API resolves the current customer session before listing", () => {
  assert.match(api, /getCustomerFromSession/);
  assert.match(api, /listCustomerRfqs\(env\.STORE_DB, customer\.id/);
});

test("public RFQ projection does not expose customer private identity fields", () => {
  assert.match(contract, /request_number/);
  assert.doesNotMatch(contract, /buyer_email/);
  assert.doesNotMatch(contract, /buyer_phone/);
});

test("worker routes account RFQs to the live response before structural account shell", () => {
  assert.match(worker, /accountRfqsLiveResponse/);
  assert.match(worker, /url\.pathname === "\/account\/rfqs"/);
});
