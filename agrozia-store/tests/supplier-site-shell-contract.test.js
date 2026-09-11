import test from "node:test";
import assert from "node:assert/strict";
import { supplierSiteShell } from "../src/site/supplier-site-shell.js";

test("supplier directory exposes commercial structure", () => {
  const html = supplierSiteShell("/suppliers");
  for (const text of ["Trusted Suppliers", "Supplier capabilities at a glance.", "Zarus Agricultural Supply", "Agro Trade Partner", "Regional Agri Solutions", "International Crop Supply", "Start an RFQ"]) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /href="\/suppliers\/1"/);
  assert.match(html, /SUPPLIER → MATCH → QUOTE/);
});

test("supplier detail exposes capability and RFQ path", () => {
  const html = supplierSiteShell("/suppliers/1");
  assert.match(html, /Zarus Agricultural Supply/);
  assert.match(html, /CAPABILITIES/);
  assert.match(html, /COMMERCIAL PATH/);
  assert.match(html, /href="\/rfq\?supplier=1"/);
  assert.match(html, /Back to Suppliers/);
});

test("unknown supplier detail remains structurally safe", () => {
  const html = supplierSiteShell("/suppliers/unknown");
  assert.match(html, /Supplier Profile/);
  assert.match(html, /Request a Quote/);
  assert.doesNotMatch(html, /undefined/);
});
