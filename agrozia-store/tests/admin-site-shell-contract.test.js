import assert from "node:assert/strict";
import test from "node:test";
import { adminSiteShell, adminSiteResponse } from "../src/site/admin-site-shell.js";

const routes = [
  "/admin",
  "/admin/products",
  "/admin/suppliers",
  "/admin/rfqs",
  "/admin/matches",
  "/admin/quotes",
  "/admin/orders",
  "/admin/customers",
  "/admin/login",
];

test("admin shell exposes all core commerce areas", () => {
  for (const route of routes) {
    const html = adminSiteShell(route);
    assert.equal(typeof html, "string");
    assert.match(html, /AGRO-ZIA/);
    assert.match(html, /Store Admin/);
  }
});

test("admin shell preserves direct sale and B2B order administration boundary", () => {
  const html = adminSiteShell("/admin/orders");
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B/);
});

test("admin detail routes are structurally supported", () => {
  const html = adminSiteShell("/admin/products/sample");
  assert.match(html, /Products Detail/);
  assert.match(html, /Overview/);
  assert.match(html, /Activity/);
});

test("unknown admin route is safe", () => {
  assert.equal(adminSiteShell("/admin/unknown"), null);
});

test("response returns html for public login, redirects protected admin, and 404s unknown routes", async () => {
  const request = new Request("https://store.test/admin/login");
  const ok = await adminSiteResponse("/admin/login", request, { STORE_DB: {} });
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-type"), /text\/html/);

  const protectedRequest = new Request("https://store.test/admin");
  const protectedResponse = await adminSiteResponse("/admin", protectedRequest, { STORE_DB: {} });
  assert.equal(protectedResponse.status, 302);
  assert.equal(protectedResponse.headers.get("location"), "https://store.test/admin/login");

  const missingRequest = new Request("https://store.test/admin/unknown");
  const missing = await adminSiteResponse("/admin/unknown", missingRequest, { STORE_DB: {} });
  assert.equal(missing.status, 404);
});
