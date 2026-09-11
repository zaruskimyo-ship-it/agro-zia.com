import test from "node:test";
import assert from "node:assert/strict";
import { normalizeB2BOrderId, publicB2BOrder, publicB2BOrderItem } from "../src/commerce/b2b-order-contract.js";

test("B2B order id normalization rejects empty and oversized values", () => {
  assert.equal(normalizeB2BOrderId("  quote-1  "), "quote-1");
  assert.equal(normalizeB2BOrderId(""), null);
  assert.equal(normalizeB2BOrderId("x".repeat(121)), null);
});

test("public B2B order projection excludes customer email", () => {
  const order = publicB2BOrder({
    id: "o1", order_number: "AGZ-B2B-1", status: "pending_confirmation",
    rfq_id: "r1", quote_id: "q1", supplier_id: "s1", currency: "USD",
    subtotal_minor: 100, total_minor: 100, product_id: "p1", product_name: "NPK",
    quantity: "10", unit_price_minor: 10, customer_name: "Buyer", customer_phone: null,
    customer_email: "private@example.com", created_at: "now", updated_at: "now",
  }, [publicB2BOrderItem({ product_id: "p1", product_name: "NPK", quantity: "10", unit_price_minor: 10, currency: "USD", line_total_minor: 100 })]);
  assert.equal(order.customer_name, "Buyer");
  assert.equal("customer_email" in order, false);
  assert.equal(order.items[0].line_total_minor, 100);
});
