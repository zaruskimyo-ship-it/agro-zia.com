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
  assert.match(html, /fetch\('\/api\/checkout\/'\+encodeURIComponent\(id\),/);
  assert.match(html, /Review your checkout before order creation/);
  assert.doesNotMatch(html, /Structural checkout review/);
});

test("checkout API remains authentication-gated", async () => {
  const response = await handleCheckout(new Request("https://example.test/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idempotency_key: "x", shipping_address: { name: "A", phone: "1", country: "TR", city: "Istanbul", address: "Street" } }) }), { STORE_DB: {} }, "/api/checkout");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "authentication_required" });
});

test("checkout confirmation is connected to the live order flow", async () => {
  const html = await checkoutSiteShell("/checkout/confirmation");

  assert.match(html, /Direct Sale Order/);
  assert.match(html, /Order creation is now connected to the live order API/);
  assert.match(html, /authenticated, orderable checkout/);
  assert.match(html, /order reference is returned by the API/);
  assert.match(html, /\/orders/);
  assert.match(html, /\/cart/);

  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});