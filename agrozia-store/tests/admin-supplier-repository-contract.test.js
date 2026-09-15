import test from "node:test";
import assert from "node:assert/strict";

function supplierInput(input = {}) {
  const name = String(input?.name ?? "").trim();
  if (!name) throw new Error("invalid_supplier_name");
  const status = ["draft", "published", "archived"].includes(input?.status) ? input.status : "draft";
  return { name, status, country: input?.country == null || String(input.country).trim() === "" ? null : String(input.country).trim() };
}

test("supplier normalization defaults new suppliers to draft", () => {
  assert.deepEqual(supplierInput({ name: "Supplier A" }), { name: "Supplier A", status: "draft", country: null });
});

test("supplier normalization preserves supported status and country", () => {
  assert.deepEqual(supplierInput({ name: "Supplier A", status: "published", country: "Uzbekistan" }), {
    name: "Supplier A", status: "published", country: "Uzbekistan"
  });
});

test("supplier normalization rejects missing name", () => {
  assert.throws(() => supplierInput({ name: "  " }), /invalid_supplier_name/);
});
