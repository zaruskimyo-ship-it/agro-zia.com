import test from "node:test";
import assert from "node:assert/strict";
import { cartSiteShell } from "../src/site/cart-site-shell.js";

test("cart shell exposes commerce review structure", () => {
  const html = cartSiteShell("/cart");
  for (const text of ["Commerce Cart", "Cart Items", "Supplier", "Quantity", "Order Summary", "Continue Shopping", "Request a Quote Instead", "Proceed to Checkout"]) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /href="\/checkout"/);
  assert.match(html, /href="\/rfq"/);
});

test("cart shell preserves B2B quotation boundary", () => {
  const html = cartSiteShell("/cart");
  assert.match(html, /Direct-sale terms validated by commerce API/);
  assert.match(html, /B2B\/RFQ-only products remain on the quotation path/);
});

test("cart shell remains safe for its route", () => {
  const html = cartSiteShell("/cart");
  const visibleHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  assert.doesNotMatch(visibleHtml, /\bundefined\b/);
});
