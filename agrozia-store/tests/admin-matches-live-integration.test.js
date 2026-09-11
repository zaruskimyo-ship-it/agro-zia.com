import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("live admin matches response exists and uses Store Admin API", async () => {
  const source = await readFile(new URL("../src/site/admin-matches-live-response.js", import.meta.url), "utf8");
  assert.match(source, /\/api\/store-admin\/matches/);
  assert.match(source, /credentials:'same-origin'/);
  assert.match(source, /authentication is required/i);
  assert.match(source, /service is unavailable/i);
});

test("worker routes admin matches to live response", async () => {
  const source = await readFile(new URL("../_worker.js", import.meta.url), "utf8");
  assert.match(source, /adminMatchesLiveResponse/);
  assert.match(source, /url\.pathname === "\/admin\/matches"/);
});

test("match API remains admin-authenticated and exposes operational match fields", async () => {
  const source = await readFile(new URL("../src/commerce/store-admin-match-api.js", import.meta.url), "utf8");
  assert.match(source, /requireAdmin/);
  assert.match(source, /listMatches/);
});

test("customer-private RFQ fields are not rendered by the live matches view", async () => {
  const source = await readFile(new URL("../src/site/admin-matches-live-response.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /buyer_email|buyer_phone|buyer_name/);
});
