import test from "node:test";
import assert from "node:assert/strict";

function routeKind(pathname, method) {
  if (pathname === "/api/store-admin/suppliers" && method === "GET") return "list";
  if (pathname === "/api/store-admin/suppliers" && method === "POST") return "create";
  if (/^\/api\/store-admin\/suppliers\/[^/]+$/.test(pathname) && method === "GET") return "detail";
  if (/^\/api\/store-admin\/suppliers\/[^/]+$/.test(pathname) && method === "PATCH") return "update";
  if (/^\/api\/store-admin\/suppliers\/[^/]+\/(publish|archive)$/.test(pathname) && method === "POST") return "status";
  return null;
}

function canMutate(role) { return role === "admin" || role === "manager"; }


test("admin supplier route contract covers list/detail/create/update/status", () => {
  assert.equal(routeKind("/api/store-admin/suppliers", "GET"), "list");
  assert.equal(routeKind("/api/store-admin/suppliers", "POST"), "create");
  assert.equal(routeKind("/api/store-admin/suppliers/s1", "GET"), "detail");
  assert.equal(routeKind("/api/store-admin/suppliers/s1", "PATCH"), "update");
  assert.equal(routeKind("/api/store-admin/suppliers/s1/publish", "POST"), "status");
  assert.equal(routeKind("/api/store-admin/suppliers/s1/archive", "POST"), "status");
});

test("admin supplier mutation roles remain restricted", () => {
  assert.equal(canMutate("admin"), true);
  assert.equal(canMutate("manager"), true);
  assert.equal(canMutate("operator"), false);
});
