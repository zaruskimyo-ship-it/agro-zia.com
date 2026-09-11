import assert from "node:assert/strict";
import { normalizeProduct, publicProduct } from "../src/commerce/product-contract.js";

const product = normalizeProduct({
  id: "p1", slug: "npk-20-20-20", name: "NPK 20-20-20", status: "published",
  price_visibility: "rfq", currency: "usd", price_min: 10, price_max: 20,
  specifications: '{"N":"20%","P2O5":"20%"}', supplier_id: "private-supplier"
});
assert.equal(product.currency, "USD");
assert.equal(product.status, "published");
assert.deepEqual(product.specifications, { N: "20%", P2O5: "20%" });
const publicView = publicProduct(product);
assert.ok(publicView);
assert.equal("supplier_id" in publicView, false);
assert.equal("status" in publicView, false);
assert.equal("origin_statement" in publicView, false);
assert.equal(publicView.slug, "npk-20-20-20");
assert.equal(publicProduct({ name: "Draft", slug: "draft", status: "draft" }), null);
assert.equal(publicProduct({ name: "", slug: "missing-name", status: "published" }), null);
assert.equal(normalizeProduct({ price_min: -1 }).price_min, null);
assert.equal(normalizeProduct({ price_max: "not-a-number" }).price_max, null);
console.log("product commerce contract tests: PASS");
