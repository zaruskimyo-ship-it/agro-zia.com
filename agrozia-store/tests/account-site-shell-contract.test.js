import assert from "node:assert/strict";
import { accountSiteShell, accountSiteResponse } from "../src/site/account-site-shell.js";

const paths = ["/account", "/account/profile", "/account/rfqs", "/account/quotes", "/account/orders", "/account/documents", "/account/settings"];

for (const path of paths) {
  const html = accountSiteShell(path);
  assert.equal(typeof html, "string", `${path} should render HTML`);
  assert.match(html, /AGRO-ZIA/);
  assert.match(html, /Customer Portal/);
}

const overview = accountSiteShell("/account");
assert.match(overview, /Profile/);
assert.match(overview, /RFQs/);
assert.match(overview, /Quotes/);
assert.match(overview, /Orders/);

const orders = accountSiteShell("/account/orders");
assert.match(orders, /Direct Sale orders/);
assert.match(orders, /B2B orders from accepted quotes/);

const response = accountSiteResponse("/account/profile");
assert.equal(response.status, 200);
assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");

const missing = accountSiteResponse("/account/unknown");
assert.equal(missing.status, 404);
