import assert from "node:assert/strict";
import test from "node:test";
import { checkoutSiteShell } from "../src/site/checkout-site-shell.js";
import { handleCheckout } from "../src/commerce/checkout-api.js";

test("checkout landing is connected to the live checkout API", async () => {
  const html = await checkoutSiteShell("/checkout");
  assert.match(html, /fetch\('\/api\/checkout'/);
  assert.match(html, /credentials:'same-origin'/);
  assert.match(html, /idempotency_key/);
  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});

test("checkout review reads the real checkout resource", async () => {
  const html = await checkoutSiteShell("/checkout/review");
  assert.match(html, /fetch\('\/api\/checkout\/'+encodeURIComponent\(id\)/);
  assert.match(html, /Live Checkout Review/);
  assert.doesNotMatch(html, /Structural checkout review/);
});

test("checkout API remains authentication-gated", async () => {
  const response = await handleCheckout(new Request("https://example.test/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idempotency_key: "x", shipping_address: { name: "A", phone: "1", country: "TR", city: "Istanbul", address: "Street" } }) }), { STORE_DB: {} }, "/api/checkout");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "authentication_required" });
});

test("checkout confirmation does not invent an order reference", async () => {
  const html = await checkoutSiteShell("/checkout/confirmation");
  assert.match(html, /does not create a final order/);
  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});
