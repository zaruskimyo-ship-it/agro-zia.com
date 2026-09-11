import test from "node:test";
import assert from "node:assert/strict";
import { supplierSiteShell } from "../src/site/supplier-site-shell.js";

test("supplier directory exposes commercial structure", () => {
  const html = supplierSiteShell("/suppliers");
  for (const label of ["AGRO-ZIA", "Trusted Suppliers", "SUPPLIER NETWORK", "Supplier capabilities at a glance.", "Start an RFQ"]) {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /href="\/suppliers\/1"/);
  assert.match(html, /href="\/suppliers\/2"/);
});

test("supplier detail exposes profile and RFQ path", () => {
  const html = supplierSiteShell("/suppliers/1");
  assert.match(html, /Zarus Agricultural Supply/);
  assert.match(html, /CAPABILITIES/);
  assert.match(html, /COMMERCIAL PATH/);
  assert.match(html, /href="\/rfq\?supplier=1"/);
  assert.match(html, /Back to Suppliers/);
});
