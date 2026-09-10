import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCheckoutInput, decimalToMicros, multiplyDecimalToMicros, microsToDecimal, publicCheckout } from "../src/commerce/checkout-contract.js";

test("checkout input requires idempotency and complete shipping address", () => {
  assert.equal(normalizeCheckoutInput({ idempotency_key: "abc" }), null);
  const value = normalizeCheckoutInput({
    idempotency_key: "order-001",
    shipping_address: { name: "Buyer", phone: "+123", country: "TR", city: "Istanbul", address: "Street 1" }
  });
  assert.equal(value.idempotency_key, "order-001");
  assert.equal(value.shipping_address.city, "Istanbul");
});

test("decimal money helpers avoid floating-point arithmetic", () => {
  assert.equal(decimalToMicros("0.10"), 100000n);
  assert.equal(multiplyDecimalToMicros("3", "0.10"), 300000n);
  assert.equal(microsToDecimal(300000n), "0.3");
  assert.equal(multiplyDecimalToMicros("0.333333", "3"), 999999n);
});

test("public checkout projection excludes private customer fields", () => {
  const result = publicCheckout({
    id: "c1", status: "open", currency: "USD", subtotal: "25",
    customer_name: "Private", customer_email: "private@example.com", customer_phone: "x",
    shipping_name: "Buyer", shipping_phone: "y", shipping_country: "TR", shipping_city: "Istanbul",
    shipping_address: "Street", shipping_postal_code: "34000", expires_at: "later", created_at: "now"
  }, [{ product_id: "p1", product_slug: "npk", product_name: "NPK", quantity: "2", unit: "MT", unit_price: "12.5", currency: "USD", line_total: "25", supplier_id: "private" }]);
  assert.equal(result.subtotal, "25");
  assert.equal(result.items[0].line_total, "25");
  assert.equal("customer_email" in result, false);
  assert.equal("supplier_id" in result.items[0], false);
});

test("checkout public projection preserves terminal status", () => {
  const result = publicCheckout({
    id: "c2", status: "expired", currency: "USD", subtotal: "10",
    shipping_name: "Buyer", shipping_phone: "+123", shipping_country: "TR", shipping_city: "Istanbul",
    shipping_address: "Street", shipping_postal_code: null, expires_at: "past", created_at: "now"
  }, []);
  assert.equal(result.status, "expired");
});
