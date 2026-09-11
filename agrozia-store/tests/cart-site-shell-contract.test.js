import test from "node:test";
import assert from "node:assert/strict";
import { cartSiteShell } from "../src/site/cart-site-shell.js";

test("cart shell exposes commerce review structure", () => {
  const html = cartSiteShell("/cart");
  for (const text of ["Commerce Cart", "Cart Items", "Supplier", "Quantity", "Order Summary", "Continue Shopping", "Request a Quote Instead", "Proceed to Checkout"]) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  }
  assert.match(html, /href="\/checkout"/);
  assert.match(html, /href="\/rfq"/);
});

test("cart shell preserves B2B quotation boundary", () => {
  const html = cartSiteShell("/cart");
  assert.match(html, /Direct sale and B2B order paths remain separate/);
  assert.match(html, /Pending supplier confirmation/);
});

test("cart shell remains safe for its route", () => {
  const html = cartSiteShell("/cart");
  assert.doesNotMatch(html, /undefined/);
});
