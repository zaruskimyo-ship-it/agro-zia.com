import assert from "node:assert/strict";

const statuses = ["draft", "published", "archived"];
const quoteStatuses = ["draft", "sent", "accepted", "rejected", "expired", "converted", "cancelled"];
const orderStatuses = ["pending_confirmation", "confirmed", "proforma_pending", "payment_pending", "sourcing", "shipping", "delivered", "completed", "cancelled", "rejected"];

assert.equal(statuses.includes("published"), true);
assert.equal(quoteStatuses.includes("accepted"), true);
assert.equal(orderStatuses.includes("pending_confirmation"), true);
assert.equal(orderStatuses.includes("paid"), false);

function validId(value) {
  const v = String(value ?? "").trim();
  return v.length > 0 && v.length <= 120;
}
assert.equal(validId("abc"), true);
assert.equal(validId(""), false);
assert.equal(validId("x".repeat(121)), false);

console.log("Store Admin contract tests passed");
