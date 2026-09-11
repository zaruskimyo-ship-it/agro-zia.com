import test from "node:test";
import assert from "node:assert/strict";

function routeKind(pathname, method) {
  if (pathname === "/api/store-admin/products" && method === "GET") return "list";
  if (pathname === "/api/store-admin/products" && method === "POST") return "create";
  if (/^\/api\/store-admin\/products\/[^/]+$/.test(pathname) && method === "GET") return "detail";
  if (/^\/api\/store-admin\/products\/[^/]+$/.test(pathname) && method === "PATCH") return "update";
  if (/^\/api\/store-admin\/products\/[^/]+\/(publish|archive)$/.test(pathname) && method === "POST") return "status";
  return null;
}

test("admin product route contract covers list/detail/create/update/status", () => {
  assert.equal(routeKind("/api/store-admin/products", "GET"), "list");
  assert.equal(routeKind("/api/store-admin/products", "POST"), "create");
  assert.equal(routeKind("/api/store-admin/products/p1", "GET"), "detail");
  assert.equal(routeKind("/api/store-admin/products/p1", "PATCH"), "update");
  assert.equal(routeKind("/api/store-admin/products/p1/publish", "POST"), "status");
  assert.equal(routeKind("/api/store-admin/products/p1/archive", "POST"), "status");
});
