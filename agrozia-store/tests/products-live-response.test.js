import test from "node:test";
import assert from "node:assert/strict";
import { productsSiteResponse } from "../src/site/products-live-response.js";

test("Products listing is wired to the live Store Product API", async () => {
  const response = productsSiteResponse("/products");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /data-live-products/);
  assert.match(html, /\/api\/products\?limit=50/);
  assert.match(html, /Source: Store Product API/);
  assert.match(html, /No sample catalog data is presented as live inventory/);
});

test("Product detail is wired to a published product slug", async () => {
  const response = productsSiteResponse("/products/example-product");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /data-live-product/);
  assert.match(html, /\/api\/products\//);
  assert.match(html, /Product not found/);
});

test("Live integration keeps the Store API boundary explicit", async () => {
  const html = await productsSiteResponse("/products").then((r) => r.text());
  assert.match(html, /fetch\('\/api\/products\?limit=50'/);
  assert.doesNotMatch(html, /\/api\/inquiries|TELEGRAM_BOT_TOKEN_V2|agrozia-db11/);
});
