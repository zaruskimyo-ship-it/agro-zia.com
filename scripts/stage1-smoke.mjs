import fs from "node:fs";

const worker = fs.readFileSync(new URL("../_worker.js", import.meta.url), "utf8");
const wrangler = JSON.parse(fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const preview = fs.readFileSync(new URL("../multilingual-preview.html", import.meta.url), "utf8");

const required = [
  ["D1 binding", "env.AGROZIA_DB"],
  ["Inquiry POST route", 'url.pathname === "/api/inquiries" && request.method === "POST"'],
  ["D1 persistence", "persisted: true"],
  ["Server request reference", "request_number: requestNumber"],
  ["Fail-closed D1 handling", 'return json({ error: "d1_persistence_failed" }, 503)'],
  ["Multilingual transformation", "transformMultilingualPreview"],
  ["Worker-first multilingual route", '"/multilingual-preview"'],
  ["Six-language allowlist", '"en", "ru", "fa", "ar", "uz", "tr"'],
];

for (const [label, needle] of required) {
  if (!worker.includes(needle) && !JSON.stringify(wrangler).includes(needle)) {
    throw new Error(`Stage 1 smoke check failed: ${label}`);
  }
}

for (const legacy of [
  "fallbackRequestNumber",
  "email_fallback",
  "persisted: false",
  "temporary: true",
]) {
  if (worker.includes(legacy)) {
    throw new Error(`Stage 1 smoke check failed: legacy fallback remains: ${legacy}`);
  }
}

if (preview.includes("For this initial static release, submitting the form opens your email client")) {
  throw new Error("Stage 1 smoke check failed: legacy static mailto-only notice remains in multilingual preview");
}

if (wrangler.main !== "_worker.js") throw new Error("Stage 1 smoke check failed: unexpected Worker entrypoint");
if (wrangler.assets?.binding !== "ASSETS") throw new Error("Stage 1 smoke check failed: ASSETS binding missing");
if (!wrangler.assets?.run_worker_first?.includes("/multilingual-preview")) {
  throw new Error("Stage 1 smoke check failed: multilingual preview is not Worker-first");
}
if (!wrangler.d1_databases?.some((db) => db.binding === "AGROZIA_DB" && db.database_name === "agrozia-db11")) {
  throw new Error("Stage 1 smoke check failed: AGROZIA_DB binding does not target agrozia-db11");
}

console.log("Stage 1 smoke checks: PASS");
