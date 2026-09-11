import test from "node:test";
import assert from "node:assert/strict";
import { handleB2BOrders } from "../src/commerce/b2b-order-api.js";

test("B2B order API exposes quote conversion route", async () => {
  const response = await handleB2BOrders(
    new Request("https://store.test/api/b2b-orders/from-quote/q-1", { method: "POST" }),
    { STORE_DB: {} },
    "/api/b2b-orders/from-quote/q-1"
  );
  assert.equal(response.status, 401);
});

test("quote-to-order UI uses the existing B2B order API", async () => {
  const { accountQuotesLiveResponse } = await import("../src/site/account-quotes-live-response.js");
  const response = accountQuotesLiveResponse();
  const html = await response.text();
  assert.match(html, /\/api\/b2b-orders\/from-quote\//);
  assert.match(html, /Create B2B Order/);
  assert.match(html, /credentials:'same-origin'/);
});

test("B2B order repository remains the conversion authority", async () => {
  const { createB2BOrder } = await import("../src/commerce/b2b-order-repository.js");
  assert.equal(typeof createB2BOrder, "function");
});
