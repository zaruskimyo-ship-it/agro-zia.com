import test from "node:test";
import assert from "node:assert/strict";
import { createSupplierSession, readSupplierSession, supplierSessionCookie } from "../src/supplier/supplier-auth.js";
import fs from "node:fs";

const ENV = { SUPPLIER_SESSION_SECRET: "01234567890123456789012345678901" };

function requestWithCookie(token) {
  return new Request("https://example.test/api/supplier/session", {
    headers: { cookie: supplierSessionCookie(token) },
  });
}

test("supplier session is readable before expiry", async () => {
  const now = Date.parse("2026-09-09T20:00:00.000Z");
  const token = await createSupplierSession(ENV, "supplier-a", now);
  assert.ok(token);
  const session = await readSupplierSession(requestWithCookie(token), ENV, now);
  assert.deepEqual(session?.supplierId, "supplier-a");
});

test("supplier session rejects expiry and tampering", async () => {
  const now = Date.parse("2026-09-09T20:00:00.000Z");
  const token = await createSupplierSession(ENV, "supplier-a", now);
  assert.equal(await readSupplierSession(requestWithCookie(token), ENV, now + 8 * 60 * 60 * 1000 + 2000), null);
  const parts = token.split(".");
  parts[0] = "supplier-b";
  assert.equal(await readSupplierSession(requestWithCookie(parts.join(".")), ENV, now), null);
});

test("supplier session cookie has required security flags", async () => {
  const token = await createSupplierSession(ENV, "supplier-a", Date.now());
  const cookie = supplierSessionCookie(token);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
});

test("supplier messaging derives ownership and sender identity server-side", () => {
  const source = fs.readFileSync("src/supplier/supplier-api.js", "utf8");
  assert.match(source, /requireSupplier\(env\.AGROZIA_DB, request, env\)/);
  assert.match(source, /supplier\.supplier_id/);
  assert.match(source, /supplier\.account_id/);
  assert.match(source, /sender_type: \"supplier\"/);
  assert.match(source, /supplier_id = \?/);
  assert.match(source, /MAX_MESSAGE_LENGTH = 4000/);
});

test("customer thread preserves authenticated customer identity", () => {
  const source = fs.readFileSync("src/customer/transaction-api.js", "utf8");
  assert.match(source, /customer_account_id/);
  assert.match(source, /'customer' AS sender_type/);
  assert.match(source, /commerce_supplier_quote_messages/);
  assert.match(source, /commerce_quote_messages/);
});

test("cross-party thread endpoints remain ownership-gated", () => {
  const supplier = fs.readFileSync("src/supplier/supplier-api.js", "utf8");
  const customer = fs.readFileSync("src/customer/transaction-api.js", "utf8");
  assert.match(supplier, /WHERE q\.id = \? AND q\.supplier_id = \?/);
  assert.match(customer, /quoteFor\(db,id,account\)/);
  assert.match(customer, /r\.customer_account_id\s*=\s*\?/);
});
