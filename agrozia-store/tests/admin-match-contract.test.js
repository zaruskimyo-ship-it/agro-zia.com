import test from "node:test";
import assert from "node:assert/strict";
import { handleStoreAdminMatches } from "../src/commerce/store-admin-match-api.js";

test("match API module exports handler", () => {
  assert.equal(typeof handleStoreAdminMatches, "function");
});

test("match routes are protected when unauthenticated", async () => {
  const response = await handleStoreAdminMatches(
    new Request("https://store.test/api/store-admin/matches"),
    { STORE_DB: {} },
    "/api/store-admin/matches"
  );
  assert.equal(response.status, 401);
});
