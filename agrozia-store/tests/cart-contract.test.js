import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCartItem, publicCart } from "../src/commerce/cart-contract.js";

test("cart item accepts positive numeric quantity", () => {
  assert.deepEqual(normalizeCartItem({ product_id: "p1", quantity: 25 }), { product_id: "p1", quantity: "25" });
});

test("cart item rejects zero, negative, malformed, and missing quantity", () => {
  for (const quantity of [0, -1, "0", "-2", "abc", ""]) {
    assert.equal(normalizeCartItem({ product_id: "p1", quantity }), null);
  }
  assert.equal(normalizeCartItem({ quantity: 2 }), null);
});

test("public cart exposes only commerce-safe fields", () => {
  const result = publicCart(
    { id: "c1", status: "active", currency: "USD", updated_at: "now", customer_id: "private" },
    [{ id: "i1", product_id: "p1", slug: "npk", name: "NPK", brand: "AGZ", quantity: "10", unit: "MT", price_visibility: "rfq", currency: "USD", price_min: null, price_max: null, supplier_id: "private" }]
  );
  assert.equal(result.id, "c1");
  assert.equal(result.items[0].product_id, "p1");
  assert.equal("customer_id" in result, false);
  assert.equal("supplier_id" in result.items[0], false);
});
