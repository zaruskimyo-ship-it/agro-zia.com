import assert from "node:assert/strict";
import { handlePublicRfqs } from "../src/commerce/rfq-api.js";
import { createCustomerSession, customerSessionCookie } from "../src/customer/customer-auth.js";

const ENV = { CUSTOMER_SESSION_SECRET: "01234567890123456789012345678901" };
const IDS = { customerA: "customer-a", customerB: "customer-b", product: "product-1", supplier: "supplier-1" };

function makeDb({ accountStatuses = {}, inserted = [] } = {}) {
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.includes("FROM commerce_products")) return { id: IDS.product, name: "NPK 15-15-15", status: "published" };
              if (sql.includes("FROM commerce_suppliers")) return { id: IDS.supplier, name: "Supplier One", status: "published" };
              if (sql.includes("FROM customer_accounts")) {
                const id = args[0];
                const status = accountStatuses[id] ?? "active";
                return status === "active" ? { id, status } : null;
              }
              return null;
            },
            async run() {
              inserted.push({ sql, args });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

function request(body, cookie) {
  return new Request("https://example.test/api/rfqs", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

const base = {
  product_id: IDS.product,
  supplier_id: IDS.supplier,
  product_name: "NPK 15-15-15",
  quantity: "100 MT",
  destination_country: "Turkey",
  buyer_company: "Zarus",
  buyer_email: "buyer@example.test",
};

const now = Date.parse("2026-09-10T12:00:00.000Z");
const tokenA = await createCustomerSession(ENV, IDS.customerA, now);
assert.ok(tokenA);

{
  const inserted = [];
  const db = makeDb({ inserted });
  const forged = { ...base, customer_account_id: IDS.customerB };
  const response = await handlePublicRfqs(request(forged, customerSessionCookie(tokenA)), { ...ENV, AGROZIA_DB: db });
  assert.equal(response.status, 201);
  assert.equal(inserted.length, 1);
  const accountIndex = inserted[0].sql.split("VALUES")[0].split(",").indexOf("customer_account_id");
  assert.ok(accountIndex >= 0);
  assert.equal(inserted[0].args[accountIndex], IDS.customerA, "browser-supplied customer_account_id must be ignored");
}

{
  const inserted = [];
  const db = makeDb({ inserted });
  const response = await handlePublicRfqs(request(base), { ...ENV, AGROZIA_DB: db });
  assert.equal(response.status, 201);
  const accountIndex = inserted[0].sql.split("VALUES")[0].split(",").indexOf("customer_account_id");
  assert.equal(inserted[0].args[accountIndex], null, "anonymous RFQ must remain unowned");
}

{
  const inserted = [];
  const db = makeDb({ accountStatuses: { [IDS.customerA]: "blocked" }, inserted });
  const response = await handlePublicRfqs(request(base, customerSessionCookie(tokenA)), { ...ENV, AGROZIA_DB: db });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "invalid_rfq" });
  assert.equal(inserted.length, 0);
}

{
  const inserted = [];
  const db = makeDb({ inserted });
  const expiredToken = await createCustomerSession(ENV, IDS.customerA, now - (8 * 60 * 60 * 1000) - 2000);
  const response = await handlePublicRfqs(request(base, customerSessionCookie(expiredToken)), { ...ENV, AGROZIA_DB: db });
  assert.equal(response.status, 201);
  const accountIndex = inserted[0].sql.split("VALUES")[0].split(",").indexOf("customer_account_id");
  assert.equal(inserted[0].args[accountIndex], null, "expired session must not confer ownership");
}

console.log("CUSTOMER OWNERSHIP RUNTIME GATE: PASS (mock-D1)");
