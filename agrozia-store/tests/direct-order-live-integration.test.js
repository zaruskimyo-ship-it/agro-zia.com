import assert from "node:assert/strict";
import test from "node:test";
import { checkoutSiteShell } from "../src/site/checkout-site-shell.js";
import { ordersLiveResponse } from "../src/site/orders-live-response.js";
import { handleOrders } from "../src/commerce/order-api.js";

test("checkout review creates a Direct Sale Order through the dedicated order endpoint", async () => {
  const html = await checkoutSiteShell("/checkout/review");
  assert.match(html, /fetch\('\/api\/orders\/from-checkout\/'+encodeURIComponent\(id\)/);
  assert.match(html, /Create Direct Sale Order/);
  assert.match(html, /credentials:'same-origin'/);
  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});

test("Orders page reads authenticated live order data", async () => {
  const response = ordersLiveResponse();
  const html = await response.text();
  assert.match(html, /fetch\('\/api\/orders\/'+encodeURIComponent\(id\)/);
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B orders remain/);
  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});

test("Direct Sale order creation remains authentication-gated", async () => {
  const response = await handleOrders(new Request("https://example.test/api/orders/from-checkout/c1", { method: "POST" }), { STORE_DB: {} }, "/api/orders/from-checkout/c1");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "authentication_required" });
});

test("Order lookup remains authentication-gated", async () => {
  const response = await handleOrders(new Request("https://example.test/api/orders/o1", { method: "GET" }), { STORE_DB: {} }, "/api/orders/o1");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "authentication_required" });
});
