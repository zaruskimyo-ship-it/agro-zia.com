import test from "node:test";
import assert from "node:assert/strict";
import { adminSessionCookie, clearAdminSessionCookie } from "../src/auth/admin-session.js";

test("admin session cookie is isolated from customer session cookie", () => {
  const cookie = adminSessionCookie("token-1", 3600);
  assert.match(cookie, /^agz_store_admin_session=token-1;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=3600/);
  assert.doesNotMatch(cookie, /agz_customer_session/);
});

test("admin session clear cookie targets only admin cookie", () => {
  const cookie = clearAdminSessionCookie();
  assert.match(cookie, /^agz_store_admin_session=/);
  assert.match(cookie, /Max-Age=0/);
  assert.doesNotMatch(cookie, /agz_customer_session/);
});
