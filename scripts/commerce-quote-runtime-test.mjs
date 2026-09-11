import assert from "node:assert/strict";
import { handlePrivateQuotes } from "../src/commerce/quote-api.js";
import fs from "node:fs";

const contractSource = fs.readFileSync(new URL("../src/commerce/quote-contract.js", import.meta.url), "utf8");
const contract = await import(`data:text/javascript;base64,${Buffer.from(contractSource).toString("base64")}`);
const { calculateTotalMinor, normalizeQuote, publicQuote, MAX_MONEY_MINOR } = contract;

const baseQuote = {
  quantity: "10 MT", unit_price_minor: 125000, packaging_cost_minor: 5000,
  shipping_cost_minor: 10000, insurance_cost_minor: 1000, other_fees_minor: 0,
  inflation_adjustment_minor: 0, inflation_adjustment_bps: 0,
};
assert.equal(calculateTotalMinor(baseQuote), 1266000);
assert.equal(calculateTotalMinor({ ...baseQuote, inflation_adjustment_minor: 10000 }), 1276000);
assert.equal(calculateTotalMinor({ ...baseQuote, inflation_adjustment_bps: 1000 }), 1392600);
assert.equal(calculateTotalMinor({ ...baseQuote, quantity: "2.5 MT", unit_price_minor: 100000 }), 266000);
assert.equal(calculateTotalMinor({ ...baseQuote, quantity: "0 MT" }), 16000);
assert.equal(calculateTotalMinor({ ...baseQuote, unit_price_minor: Number(MAX_MONEY_MINOR) }), null);
assert.equal(normalizeQuote({
  rfq_id: "rfq-1", supplier_id: "sup-1", product_name: "P", quantity: "1 MT", currency: "usd",
  unit_price_minor: 100, inflation_adjustment_minor: -1,
}), null);
assert.equal(normalizeQuote({
  rfq_id: "rfq-1", supplier_id: "sup-1", product_name: "P", quantity: "1 MT", currency: "usd",
  unit_price_minor: 100, inflation_adjustment_bps: 100001,
}), null);
const issued = publicQuote({ ...baseQuote, quote_number: "AGZ-QUOTE-1", rfq_id: "rfq-1", product_id: null,
  product_name: "P", currency: "USD", total_amount_minor: 1266000, status: "sent" });
assert.equal(issued.total_amount_minor, 1266000);
assert.equal(issued.status, "sent");

function makeDb({ rfq, supplier, product = null } = {}) {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              assert.equal(params.length, 1);
              if (/FROM commerce_rfqs/.test(sql)) return rfq;
              if (/FROM commerce_suppliers/.test(sql)) return supplier;
              if (/FROM commerce_products/.test(sql)) return product;
              throw new Error("unexpected_query");
            },
            async run() { return { success: true }; },
          };
        },
      };
    },
  };
}

const rfq = {
  id: "rfq-1", status: "matched", product_id: "prod-1", product_name: "Canonical Product",
  quantity: "10 MT", destination_country: "AZ", destination_location: "Baku",
};
const supplier = { id: "sup-1", status: "published", name: "Supplier One" };
const product = { id: "prod-1", name: "Canonical Product", status: "published", supplier_id: "sup-1" };
const env = { AGROZIA_DB: makeDb({ rfq, supplier, product }) };

const request = new Request("https://example.test/internal/quotes", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    rfq_id: "rfq-1", supplier_id: "sup-1", product_id: "prod-1", product_name: "Client Forged Name",
    quantity: "10 MT", unit_price_minor: 125000, currency: "usd", packaging_cost_minor: 5000,
    shipping_cost_minor: 10000, insurance_cost_minor: 1000, other_fees_minor: 0,
    inflation_adjustment_minor: 10000, inflation_adjustment_bps: 1000,
    notes: "internal note", quote_number: "CLIENT-FORGED", status: "accepted",
  }),
});
const response = await handlePrivateQuotes(request, env, { authorized: true });
assert.equal(response.status, 201);
const payload = await response.json();
assert.equal(payload.item.status, "draft");
assert.notEqual(payload.item.quote_number, "CLIENT-FORGED");
assert.equal(payload.item.product_name, "Canonical Product");
assert.equal(payload.item.total_amount_minor, 140, false);
assert.equal(payload.item.total_amount_minor, 1402600);
assert.equal(payload.item.inflation_adjustment_minor, 10000);
assert.equal(payload.item.inflation_adjustment_bps, 1000);
assert.equal(payload.item.currency, "USD");
assert.equal("notes" in payload.item, false);
assert.equal("supplier_id" in payload.item, false);

const unauthorized = await handlePrivateQuotes(request, env, { authorized: false });
assert.equal(unauthorized.status, 404);

const wrongMedia = await handlePrivateQuotes(new Request("https://example.test/internal/quotes", { method: "POST", body: "{}" }), env, { authorized: true });
assert.equal(wrongMedia.status, 415);

const badJson = await handlePrivateQuotes(new Request("https://example.test/internal/quotes", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }), env, { authorized: true });
assert.equal(badJson.status, 400);

const wrongMethod = await handlePrivateQuotes(new Request("https://example.test/internal/quotes", { method: "GET" }), env, { authorized: true });
assert.equal(wrongMethod.status, 405);

const unavailable = await handlePrivateQuotes(request, {}, { authorized: true });
assert.equal(unavailable.status, 503);

const ineligible = await handlePrivateQuotes(request, {
  AGROZIA_DB: makeDb({ rfq: { ...rfq, status: "submitted" }, supplier, product }),
}, { authorized: true });
assert.equal(ineligible.status, 400);

const mismatchedSupplier = await handlePrivateQuotes(request, {
  AGROZIA_DB: makeDb({ rfq, supplier: { ...supplier, id: "sup-2" }, product }),
}, { authorized: true });
assert.equal(mismatchedSupplier.status, 400);

console.log("Commerce-4 quotation exact-amount and mock-D1 runtime gate: PASS");
