import test from "node:test";
import assert from "node:assert/strict";
import { suppliersLiveShell } from "../src/site/suppliers-live-response.js";
import { handlePublicSuppliers } from "../src/commerce/supplier-public-api.js";

function mockDb(rows = []) {
  return { prepare() { return { all: async () => ({ results: rows }), first: async () => rows[0] ?? null }; } };
}

test("public supplier repository shape is limited to published supplier fields", async () => {
  const response = await handlePublicSuppliers(new Request("https://example.com/api/suppliers"), { STORE_DB: mockDb([{ id: "s1", name: "Supplier One", country: "Uzbekistan", status: "published", created_at: "x", updated_at: "x" }]) }, "/api/suppliers");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.items[0], { id: "s1", name: "Supplier One", country: "Uzbekistan", status: "published" });
  assert.equal("created_at" in body.items[0], false);
});

test("unpublished supplier is not exposed through public detail API", async () => {
  const response = await handlePublicSuppliers(new Request("https://example.com/api/suppliers/s2"), { STORE_DB: mockDb([]) }, "/api/suppliers/s2");
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error, "not_found");
});

test("supplier live shell uses API states and does not present mock supplier records", () => {
  const html = suppliersLiveShell("/suppliers");
  assert.match(html, /fetch\('\/api\/suppliers'\)/);
  assert.match(html, /No published suppliers are currently available/);
  assert.match(html, /No sample supplier is shown as confirmed data/);
  assert.doesNotMatch(html, /Zarus Agricultural Supply/);
  assert.doesNotMatch(html, /Agro Trade Partner/);
});

test("supplier detail shell uses supplier API and safe not-found state", () => {
  const html = suppliersLiveShell("/suppliers/s1");
  assert.match(html, /fetch\('\/api\/suppliers\//);
  assert.match(html, /Supplier not available/);
  assert.match(html, /Request a Quote/);
});
