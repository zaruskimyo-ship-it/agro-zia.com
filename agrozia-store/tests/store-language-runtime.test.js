import test from "node:test";
import assert from "node:assert/strict";
import { withStoreLanguageRuntime } from "../src/site/store-language-runtime-patch.js";

test("language runtime patch targets all seven store languages", async () => {
  const response = await withStoreLanguageRuntime(
    new Response("<!doctype html><html><body><main>Store</main></body></html>", {
      headers: { "content-type": "text/html; charset=utf-8" }
    })
  );
  const html = await response.text();
  assert.match(html, /agz-store-language/);
  for (const lang of ["en", "fa", "ar", "tr", "ru", "uz", "ckb"]) {
    assert.match(html, new RegExp(`\\\"${lang}\\\"`));
  }
  assert.match(html, /rtl/);
});

test("language runtime patch is a no-op for non-HTML responses", async () => {
  const response = new Response("ok", {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
  const patched = await withStoreLanguageRuntime(response);
  assert.equal(await patched.text(), "ok");
  assert.equal(patched.headers.get("content-type"), "application/json; charset=utf-8");
});

test("language runtime patch injects before the body content", async () => {
  const response = await withStoreLanguageRuntime(
    new Response("<html><body><main>Store</main></body></html>", {
      headers: { "content-type": "text/html" }
    })
  );
  const html = await response.text();
  assert.ok(html.indexOf("<script>") < html.indexOf("<main>"));
});
