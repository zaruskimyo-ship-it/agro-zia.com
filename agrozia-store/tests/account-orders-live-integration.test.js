import assert from "node:assert/strict";
import test from "node:test";
import { accountSiteShell } from "../src/site/account-site-shell.js";
import { ordersLiveResponse } from "../src/site/orders-live-response.js";

test("account orders is no longer a structural placeholder", () => {
  assert.equal(accountSiteShell("/account/orders"), null);
});

test("live orders response reads the authenticated order API", async () => {
  const response = ordersLiveResponse();
  const html = await response.text();
  assert.match(html, /fetch\('\/api\/orders\/'+encodeURIComponent\(id\)/);
  assert.match(html, /credentials:'same-origin'/);
  assert.doesNotMatch(html, /AGZ-ORDER-PENDING/);
});

test("account orders route remains distinct from B2B quote flow", async () => {
  const response = ordersLiveResponse();
  const html = await response.text();
  assert.match(html, /B2B orders remain separate/);
  assert.match(html, /\/account\/quotes/);
});
