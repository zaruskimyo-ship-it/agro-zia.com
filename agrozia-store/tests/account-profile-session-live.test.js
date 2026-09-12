import assert from "node:assert/strict";
import test from "node:test";
import { accountSiteShell } from "../src/site/account-site-shell.js";

test("account profile uses the existing authenticated customer session API", async () => {
  const html = accountSiteShell("/account/profile");
  assert.match(html, /fetch\('\/api\/customer\/session'/);
  assert.match(html, /credentials:'same-origin'/);
  assert.match(html, /data\.customer/);
});

test("account settings uses the existing customer logout API", async () => {
  const html = accountSiteShell("/account/settings");
  assert.match(html, /fetch\('\/api\/customer\/logout'/);
  assert.match(html, /method:'POST'/);
  assert.match(html, /credentials:'same-origin'/);
});

test("profile and settings do not invent unsupported write APIs", () => {
  const profile = accountSiteShell("/account/profile");
  const settings = accountSiteShell("/account/settings");
  assert.doesNotMatch(profile, /api\/customer\/profile/);
  assert.doesNotMatch(settings, /api\/customer\/settings/);
});
