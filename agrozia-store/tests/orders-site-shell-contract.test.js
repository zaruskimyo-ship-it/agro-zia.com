import assert from "node:assert/strict";
import test from "node:test";
import { ordersSiteShell } from "../src/site/orders-site-shell.js";

test("orders shell exposes direct sale and B2B paths", () => {
  const html = ordersSiteShell("/orders");
  assert.match(html, /Direct Sale/);
  assert.match(html, /B2B Orders/);
  assert.match(html, /RFQ \/ Quotes/);
  assert.match(html, /Accepted Quote → B2B Order/);
});

test("direct order detail preserves direct-sale path", () => {
  const html = ordersSiteShell("/orders/direct-001");
  assert.match(html, /Direct Sale Order/);
  assert.match(html, /Direct Sale/);
  assert.match(html, /Order Timeline/);
  assert.doesNotMatch(html, /undefined/);
});

test("B2B order detail preserves quote and supplier validation", () => {
  const html = ordersSiteShell("/orders/b2b-001");
  assert.match(html, /B2B Order/);
  assert.match(html, /Accepted Quote/);
  assert.match(html, /Supplier confirmation/);
  assert.match(html, /Commercial Summary/);
});
