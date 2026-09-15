import assert from "node:assert/strict";
import { handlePublicSuppliers } from "../src/commerce/supplier-api.js";

function responseJson(response) {
  return response.json();
}

function makeDb({ supplier = null, products = [] } = {}) {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              assert.match(sql, /FROM commerce_suppliers/);
              assert.equal(params.length, 1);
              return supplier;
            },
            async all() {
              assert.match(sql, /FROM commerce_products/);
              assert.equal(params.length, 1);
              return { results: products };
            },
          };
        },
      };
    },
  };
}

const supplier = {
  id: "sup-1",
  slug: "green-fields",
  name: "Green Fields",
  country: "TR",
  years_active: 12,
  description: "Published supplier",
  product_categories_json: '["fertilizer","irrigation"]',
  production_capacity: "1000 MT/month",
  moq: "10 MT",
  export_markets_json: '["AZ","UZ"]',
  certifications_json: '["ISO 9001"]',
  factory_capability: "Blending and packing",
  quality_control: "Batch QC",
  verification_level: "agrozia_checked",
  verification_updated_at: "2026-09-06T00:00:00Z",
};

const products = Array.from({ length: 20 }, (_, index) => ({
  slug: `product-${index + 1}`,
  name: `Product ${index + 1}`,
  brand: "Green Fields",
  origin_country: "TR",
  moq: "1 MT",
  unit: "MT",
  availability_status: "in_stock",
  lead_time: "7 days",
  price_visibility: "rfq",
  currency: "USD",
  price_min: 100,
  price_max: 120,
  short_description: "Published product",
}));

const env = { AGROZIA_DB: makeDb({ supplier, products }) };

const okResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/green-fields", { method: "GET" }),
  env,
  "green-fields",
);
assert.equal(okResponse.status, 200);
assert.equal(okResponse.headers.get("content-type"), "application/json; charset=utf-8");
assert.equal(okResponse.headers.get("x-content-type-options"), "nosniff");
assert.match(okResponse.headers.get("cache-control"), /max-age=60/);
const payload = await responseJson(okResponse);
assert.equal(payload.item.slug, "green-fields");
assert.equal(payload.item.verification.level, "agrozia_checked");
assert.equal(payload.item.products.length, 12, "public product list must be bounded to 12");
assert.equal(payload.item.products[0].slug, "product-1");
assert.equal("id" in payload.item, false);
assert.equal("buyer_email" in payload.item, false);
assert.equal("admin_notes" in payload.item, false);
assert.equal("supplier_id" in payload.item.products[0], false);

const methodResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/green-fields", { method: "POST" }),
  env,
  "green-fields",
);
assert.equal(methodResponse.status, 405);
assert.equal((await responseJson(methodResponse)).error, "method_not_allowed");

const missingResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/missing", { method: "GET" }),
  { AGROZIA_DB: makeDb({ supplier: null }) },
  "missing",
);
assert.equal(missingResponse.status, 404);
assert.equal((await responseJson(missingResponse)).error, "not_found");

const invalidSlugResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/Bad_Slug", { method: "GET" }),
  env,
  "Bad_Slug",
);
assert.equal(invalidSlugResponse.status, 404);

const noDbResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/green-fields", { method: "GET" }),
  {},
  "green-fields",
);
assert.equal(noDbResponse.status, 503);
assert.equal((await responseJson(noDbResponse)).error, "supplier_service_unavailable");

const failingDb = {
  prepare() {
    return {
      bind() {
        return { async first() { throw new Error("simulated_d1_failure"); } };
      },
    };
  },
};
const failureResponse = await handlePublicSuppliers(
  new Request("https://example.test/api/suppliers/green-fields", { method: "GET" }),
  { AGROZIA_DB: failingDb },
  "green-fields",
);
assert.equal(failureResponse.status, 503);
assert.equal((await responseJson(failureResponse)).error, "supplier_service_unavailable");

console.log("Commerce-3 supplier mock-D1 runtime gate: PASS");
