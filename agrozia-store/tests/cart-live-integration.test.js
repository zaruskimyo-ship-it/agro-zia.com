import assert from "node:assert/strict";
import test from "node:test";
import { cartSiteShell } from "../src/site/cart-site-shell.js";
import { handleCart } from "../src/commerce/cart-api.js";

test("cart page is a live integration surface, not a structural mock", () => {
  const html = cartSiteShell("/cart");
  assert.match(html, /request\('\/api\/cart'/);
  assert.match(html, /fetch\(url, \{ credentials:'same-origin'/);
  assert.match(html, /\/api\/cart\/items/);
  assert.doesNotMatch(html, /NPK Fertilizer — Structural Product/);
  assert.doesNotMatch(html, /Agricultural Input — Sample/);
});

test("cart UI preserves authenticated same-origin session and live mutation paths", () => {
  const html = cartSiteShell("/cart");
  assert.match(html, /credentials:'same-origin'/);
  assert.match(html, /method:'POST'/);
  assert.match(html, /method:'DELETE'/);
  assert.match(html, /data-update/);
  assert.match(html, /data-remove/);
  assert.match(html, /data-clear/);
});

test("cart API remains authentication-gated", async () => {
  const response = await handleCart(new Request("https://example.test/api/cart", { method: "GET" }), { STORE_DB: {} }, "/api/cart");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { ok: false, error: "authentication_required" });
});
