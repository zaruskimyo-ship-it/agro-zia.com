import assert from "node:assert/strict";
import { customerAuthSiteResponse } from "../src/site/customer-auth-site-response.js";

for (const lang of ["en","fa","ar","tr","ru","uz","ckb"]) {
  for (const path of ["/account/login","/account/register"]) {
    const response = customerAuthSiteResponse(path, lang);
    assert.equal(response.status, 200, path + " " + lang);
    assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  }
}

const fa = await customerAuthSiteResponse("/account/login", "fa").text();
assert.match(fa, /ورود مشتری/);
assert.match(fa, /dir="rtl"/);
assert.match(fa, /\/api\/customer\/login/);
assert.match(fa, /credentials:"same-origin"/);

const uz = await customerAuthSiteResponse("/account/register", "uz").text();
assert.match(uz, /Mijoz hisobini yaratish/);
assert.match(uz, /\/api\/customer\/register/);
assert.match(uz, /name="name"/);
assert.match(uz, /name="email"/);
assert.match(uz, /name="password"/);

assert.equal(customerAuthSiteResponse("/account/unknown", "en"), null);
console.log("customer authentication UI tests: PASS");
