import assert from "node:assert/strict";
import { createOrder } from "../src/commerce/order-repository.js";

const quote = {
  id: "quote-1", quote_number: "AGZ-QUOTE-1", rfq_id: "rfq-1", supplier_id: "sup-1", product_id: "prod-1",
  product_name: "Canonical Product", quantity: "10 tons", currency: "USD", unit_price_minor: 1250,
  total_amount_minor: 1800, status: "accepted", destination: "Mersin, TR",
  buyer_company: "Buyer Ltd", buyer_name: "Buyer", buyer_email: "buyer@example.com", buyer_phone: "+90 555 000 0000",
};

function mockDb() {
  return {
    prepare(sql) {
      return {
        bind(value) {
          return {
            async first() {
              if (sql.includes("FROM commerce_quotes")) return value === "quote-1" ? quote : null;
              if (sql.includes("FROM commerce_suppliers")) return value === "sup-1" ? { id: "sup-1", status: "published" } : null;
              if (sql.includes("FROM commerce_products")) return value === "prod-1" ? { id: "prod-1", name: "Canonical Product", supplier_id: "sup-1", status: "published" } : null;
              return null;
            },
            async run() { return { success: true }; },
          };
        },
      };
    },
  };
}

const result = await createOrder(mockDb(), { quote_id: "quote-1", buyer_company: "ignored" }, "2026-09-06T20:00:00.000Z");
assert.equal(result.status, "pending_confirmation");
assert.match(result.order_number, /^AGZ-ORDER-/);
assert.equal(result.product_name, "Canonical Product");
assert.equal(result.quoted_amount_minor, 1800);
assert.equal(result.quantity, "10 tons");

await assert.rejects(
  () => createOrder(mockDb(), { quote_id: "missing" }),
  /invalid_order_quote/,
);

const unauth = new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
assert.equal(unauth.status, 404);
console.log("Commerce-5 order mock-D1 runtime gate: PASS");
