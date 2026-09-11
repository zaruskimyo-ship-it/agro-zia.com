import test from "node:test";
import assert from "node:assert/strict";
import { publicOrder, ORDER_STATUSES } from "../src/commerce/order-contract.js";

test("order statuses include the direct-sale lifecycle", () => {
  assert.ok(ORDER_STATUSES.includes("pending_confirmation"));
  assert.ok(ORDER_STATUSES.includes("payment_pending"));
  assert.ok(ORDER_STATUSES.includes("completed"));
  assert.ok(ORDER_STATUSES.includes("cancelled"));
});

test("public order projection keeps the immutable commercial snapshot", () => {
  const result = publicOrder({
    id: "o1", order_number: "AGZ-ORD-1", customer_id: "private-customer", customer_email: "private@example.com",
    status: "pending_confirmation", currency: "USD", subtotal: "1250.00", total: "1250.00",
    shipping_name: "Buyer", shipping_phone: "+1", shipping_country: "TR", shipping_city: "Istanbul",
    shipping_address: "Address", shipping_postal_code: "34000", created_at: "2026-09-10T00:00:00Z", updated_at: "2026-09-10T00:00:00Z"
  }, [{ product_id: "p1", product_slug: "npk", product_name: "NPK", quantity: "10", unit: "MT", unit_price: "125.00", currency: "USD", line_total: "1250.00", supplier_id: "private-supplier" }]);

  assert.equal(result.order_number, "AGZ-ORD-1");
  assert.equal(result.total, "1250.00");
  assert.equal(result.items[0].product_name, "NPK");
  assert.equal(result.customer_id, undefined);
  assert.equal(result.customer_email, undefined);
  assert.equal(result.items[0].supplier_id, undefined);
});
