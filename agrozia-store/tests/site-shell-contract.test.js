import test from "node:test";
import assert from "node:assert/strict";
import { storeSiteShell } from "../src/site/store-site-shell.js";

test("site shell exposes core navigation and home structure", () => {
  const html = storeSiteShell("/");
  for (const label of ["AGRO-ZIA", "Products", "Suppliers", "RFQ / Request", "Orders", "About", "Contact", "Customer / Login", "Agricultural Solutions Beyond Borders."]) {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /class="hero"/);
  assert.match(html, /class="site-header"/);
  assert.match(html, /class="cta"/);
});

test("site shell supports the planned primary pages", () => {
  for (const path of ["/products", "/suppliers", "/rfq", "/cart", "/checkout", "/orders", "/account", "/about", "/contact", "/knowledge"]) {
    const html = storeSiteShell(path);
    assert.match(html, /<title>/);
    assert.match(html, /site-header/);
    assert.match(html, /footer/);
  }
});

test("products page exposes catalog structure and product cards", () => {
  const html = storeSiteShell("/products");
  assert.match(html, /PRODUCT CATALOG|Browse the Agro-Zia catalog/);
  assert.match(html, /NPK Fertilizer/);
  assert.match(html, /href="\/products\/1"/);
  assert.match(html, /Need a specific product/);
});

test("product detail route exposes technical and commercial structure", () => {
  const html = storeSiteShell("/products/1");
  assert.match(html, /NPK Fertilizer/);
  assert.match(html, /Specification/);
  assert.match(html, /Commercial terms/);
  assert.match(html, /Add to Cart/);
  assert.match(html, /Request a Quote/);
});
