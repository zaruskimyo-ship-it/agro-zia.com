import test from "node:test";
import assert from "node:assert/strict";
import { rfqSiteShell } from "../src/site/rfq-site-shell.js";

test("RFQ landing exposes the complete request structure", () => {
  const html = rfqSiteShell("/rfq");
  for (const text of ["Business Request for Quotation","Product / Category","Quantity","Delivery Requirements","Technical Specification","Attachment","Contact Information","Request Review","Review RFQ"]) assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  assert.match(html, /action="\/rfq\/review"/);
  assert.match(html, /accept="\.pdf,\.jpg,\.jpeg"/);
});

test("RFQ review exposes edit and submit structure", () => {
  const html = rfqSiteShell("/rfq/review");
  assert.match(html, /RFQ Review/);
  assert.match(html, /Request summary/);
  assert.match(html, /href="\/rfq"/);
  assert.match(html, /Submit RFQ/);
});

test("RFQ shell remains safe for unknown paths", () => {
  const html = rfqSiteShell("/rfq/unknown");
  assert.match(html, /Tell us what you need/);
  assert.doesNotMatch(html, /undefined/);
});
