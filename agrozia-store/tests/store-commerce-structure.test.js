import test from "node:test";
import assert from "node:assert/strict";
import { storeSiteShell } from "../src/site/store-site-shell.js";

test("Store home is commerce-specific and independent from corporate navigation", () => {
  const html = storeSiteShell("/", "en");
  assert.match(html, /AGRO-ZIA STORE/);
  assert.match(html, /AGRICULTURAL MARKETPLACE/);
  assert.match(html, /Products/);
  assert.match(html, /Suppliers/);
  assert.match(html, /Request a Quote/);
  assert.match(html, /My Account/);
  assert.doesNotMatch(html, /Agricultural Solutions Beyond Borders/);
  assert.doesNotMatch(html, />About</);
  assert.doesNotMatch(html, />Knowledge</);
});

test("Store home provides RTL Persian commerce content", () => {
  const html = storeSiteShell("/", "fa");
  assert.match(html, /lang="fa" dir="rtl"/);
  assert.match(html, /بازار تخصصی کشاورزی/);
  assert.match(html, /محصولات/);
  assert.match(html, /تأمین‌کنندگان/);
  assert.match(html, /درخواست قیمت/);
  assert.doesNotMatch(html, /Agricultural Solutions Beyond Borders/);
});

test("Store home provides Uzbek commerce content", () => {
  const html = storeSiteShell("/", "uz");
  assert.match(html, /lang="uz"/);
  assert.match(html, /QISHLOQ XO‘JALIGI MARKETPLEYSI/);
  assert.match(html, /Mahsulotlar/);
});
