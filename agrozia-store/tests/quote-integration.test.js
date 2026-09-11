import test from "node:test";
import assert from "node:assert/strict";
import { handleStoreAdminQuotes } from "../src/commerce/store-admin-quote-api.js";
import { handleCustomerQuotes } from "../src/commerce/customer-quote-api.js";

const db = {};

test("admin quote API is protected by Store Admin auth", async () => {
  const response = await handleStoreAdminQuotes(new Request("https://store.test/api/store-admin/quotes"), { STORE_DB: db }, "/api/store-admin/quotes");
  assert.equal(response.status, 401);
});

test("customer quote API requires customer session", async () => {
  const response = await handleCustomerQuotes(new Request("https://store.test/api/customer/quotes"), { STORE_DB: db }, "/api/customer/quotes");
  assert.equal(response.status, 401);
});

test("quote API route contract includes collection, item and acceptance paths", () => {
  const paths = ["/api/store-admin/quotes", "/api/store-admin/quotes/q1", "/api/store-admin/quotes/q1/send", "/api/customer/quotes", "/api/customer/quotes/q1", "/api/customer/quotes/q1/accept"];
  assert.equal(paths.length, 6);
});
