import assert from "node:assert/strict";
import test from "node:test";
import { checkoutSiteShell } from "../src/site/checkout-site-shell.js";

test("checkout landing exposes customer, delivery, payment and order type structure", async () => {
  const html = await checkoutSiteShell("/checkout");

  assert.match(html, /Customer/);
  assert.match(html, /Company/);
  assert.match(html, /Phone/);
  assert.match(html, /Delivery Address/);
  assert.match(html, /Country/);
  assert.match(html, /City/);
  assert.match(html, /Address/);
  assert.match(html, /Postal code/);
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B/);
  assert.match(html, /\/api\/checkout/);
});

test("checkout review preserves direct-sale and B2B boundaries", async () => {
  const html = await checkoutSiteShell("/checkout/review");

  assert.match(html, /Items/);
  assert.match(html, /Commercial Summary/);
  assert.match(html, /Delivery/);
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B/);
  assert.match(html, /Create Direct Sale Order/);
  assert.match(html, /\/api\/orders\/from-checkout\//);
});

test("checkout confirmation is structural and connected to the live order flow", async () => {
  const html = await checkoutSiteShell("/checkout/confirmation");

  assert.match(html, /Direct Sale Order/);
  assert.match(html, /Order creation is now connected to the live order API/);
  assert.match(html, /authenticated, orderable checkout/);
  assert.match(html, /order reference is returned by the API/);
  assert.match(html, /\/orders/);
  assert.match(html, /\/cart/);
});
