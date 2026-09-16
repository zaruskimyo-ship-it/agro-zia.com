import test from "node:test";
import assert from "node:assert/strict";
import { sha256Hex } from "../src/auth/admin-session.js";
import { handleStoreAdminMatches } from "../src/commerce/store-admin-match-api.js";

function mockDb(adminByTokenHash = new Map()) {
  return {
    prepare(sql) {
      return {
        async all() {
          if (sql.includes("commerce_rfq_supplier_matches")) {
            return { results: [] };
          }

          return { results: [] };
        },

        bind(...args) {
          return {
            async first() {
              if (sql.includes("store_admin_sessions")) {
                const tokenHash = args[0];
                return adminByTokenHash.get(tokenHash) ?? null;
              }

              return null;
            },

            async all() {
              return { results: [] };
            },

            async run() {
              return { success: true };
            }
          };
        }
      };
    }
  };
}

async function requestFor(role, method = "GET") {
  const token = `test-token-${role}`;
  const tokenHash = await sha256Hex(token);

  const admin = {
    id: `admin-${role}`,
    email: `${role}@example.test`,
    name: role,
    role,
    status: "active"
  };

  const request = new Request(
    "https://store.test/api/store-admin/matches",
    {
      method,
      headers: {
        Cookie: `agz_store_admin_session=${encodeURIComponent(token)}`
      }
    }
  );

  return {
    request,
    env: {
      STORE_DB: mockDb(new Map([[tokenHash, admin]]))
    }
  };
}

test("admin matches API rejects unauthenticated requests", async () => {
  const response = await handleStoreAdminMatches(
    new Request("https://store.test/api/store-admin/matches"),
    { STORE_DB: mockDb() },
    "/api/store-admin/matches"
  );

  assert.equal(response.status, 401);
});

test("admin matches API allows operator to read matches", async () => {
  const { request, env } = await requestFor("operator");

  const response = await handleStoreAdminMatches(
    request,
    env,
    "/api/store-admin/matches"
  );

  assert.equal(response.status, 200);
});

test("admin matches API allows manager to read matches", async () => {
  const { request, env } = await requestFor("manager");

  const response = await handleStoreAdminMatches(
    request,
    env,
    "/api/store-admin/matches"
  );

  assert.equal(response.status, 200);
});

test("admin matches API allows admin to read matches", async () => {
  const { request, env } = await requestFor("admin");

  const response = await handleStoreAdminMatches(
    request,
    env,
    "/api/store-admin/matches"
  );

  assert.equal(response.status, 200);
});

test("admin matches API forbids operator mutation", async () => {
  const { request, env } = await requestFor("operator");

  const mutationRequest = new Request(
    request.url,
    {
      method: "POST",
      headers: {
        Cookie: request.headers.get("Cookie"),
        "content-type": "application/json"
      },
      body: JSON.stringify({
        rfq_id: "rfq-test",
        supplier_id: "supplier-test"
      })
    }
  );

  const response = await handleStoreAdminMatches(
    mutationRequest,
    env,
    "/api/store-admin/matches"
  );

  assert.equal(response.status, 403);
});
