import assert from "node:assert/strict";
import test from "node:test";
import { checkoutSiteShell } from "../src/site/checkout-site-shell.js";

test("checkout landing exposes customer, delivery, payment and order type structure", () => {
  const html = checkoutSiteShell("/checkout");
  assert.match(html, /Customer \/ Company/);
  assert.match(html, /Billing Information/);
  assert.match(html, /Delivery & Commercial Terms/);
  assert.match(html, /Shipping \/ Incoterms/);
  assert.match(html, /Payment method/);
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B \/ Quote/);
  assert.match(html, /Continue to Order Review/);
});

test("checkout review preserves direct-sale and B2B boundaries", () => {
  const html = checkoutSiteShell("/checkout/review");
  assert.match(html, /Order Items/);
  assert.match(html, /Commercial Summary/);
  assert.match(html, /accepted B2B Quote/);
  assert.match(html, /Submit Order/);
  assert.doesNotMatch(html, /undefined/);
});

test("checkout confirmation is structural and cannot imply a production order", () => {
  const html = checkoutSiteShell("/checkout/confirmation");
  assert.match(html, /Order Confirmation/);
  assert.match(html, /AGZ-ORDER-PENDING/);
  assert.match(html, /No production order has been created/);
});
