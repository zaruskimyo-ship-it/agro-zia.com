import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPPORTED_STORE_LANGUAGES,
  getStoreDirection,
  getStoreLanguage,
  setStoreLanguage,
  t,
  tPlural
} from "../src/site/store-i18n.js";

test("registers all supported Store languages", () => {
  assert.deepEqual(Object.keys(SUPPORTED_STORE_LANGUAGES), [
    "en", "fa", "ar", "tr", "ru", "uz", "ckb"
  ]);
});

test("assigns correct text direction", () => {
  assert.equal(getStoreDirection("en"), "ltr");
  assert.equal(getStoreDirection("tr"), "ltr");
  assert.equal(getStoreDirection("ru"), "ltr");
  assert.equal(getStoreDirection("uz"), "ltr");
  assert.equal(getStoreDirection("fa"), "rtl");
  assert.equal(getStoreDirection("ar"), "rtl");
  assert.equal(getStoreDirection("ckb"), "rtl");
});

test("falls back to English for unsupported languages", () => {
  assert.equal(setStoreLanguage("xx"), "en");
  assert.equal(getStoreLanguage(), "en");
  assert.equal(t("common.search", {}, "xx"), "Search");
});

test("interpolates named placeholders", () => {
  assert.equal(
    t("products.showing", { start: 1, end: 12, total: 48 }, "en"),
    "Showing 1-12 of 48 published products"
  );
});

test("supports English pluralization", () => {
  assert.equal(tPlural("products.publishedSupplier", 1, {}, "en"), "1 published supplier");
  assert.equal(tPlural("products.publishedSupplier", 2, {}, "en"), "2 published suppliers");
});

test("unknown keys remain observable instead of throwing", () => {
  assert.equal(t("missing.key", {}, "en"), "missing.key");
});
