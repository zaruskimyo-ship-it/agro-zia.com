import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const contract = await read("src/commerce/supplier-contract.js");
const repository = await read("src/commerce/supplier-repository.js");
const api = await read("src/commerce/supplier-api.js");
const migration = await read("migrations/0005_commerce_suppliers.sql");
const docs = await read("docs/commerce-3-supplier-profiles.md");

const must = (text, pattern, message) => {
  if (!pattern.test(text)) throw new Error(`FAIL: ${message}`);
};
const mustNot = (text, pattern, message) => {
  if (pattern.test(text)) throw new Error(`FAIL: ${message}`);
};

must(contract, /declared.*agrozia_checked.*third_party_verified/s, "verification levels are bounded");
must(contract, /MAX_PUBLIC_PRODUCTS = 12/, "public product output is bounded");
must(contract, /verification:\s*\{\s*level/, "verification is explicit in public contract");
mustNot(contract, /buyer_email|buyer_phone|private_email|admin_token/i, "public contract contains no private/admin fields");

must(migration, /CREATE TABLE IF NOT EXISTS commerce_suppliers/, "supplier table exists");
must(migration, /CHECK \(status IN \('draft', 'published', 'archived'\)\)/, "supplier status is constrained");
must(migration, /CHECK \(verification_level IN \('declared', 'agrozia_checked', 'third_party_verified'\)\)/, "verification is constrained");
must(migration, /years_active >= 0 AND years_active <= 200/, "years active is bounded");

must(repository, /status = 'published'/, "repository is published-only");
must(repository, /WHERE slug = \? AND status = 'published'/, "supplier slug query is parameterized and published-only");
must(repository, /WHERE supplier_id = \? AND status = 'published'/, "product query is parameterized and published-only");
must(repository, /LIMIT \$\{MAX_PUBLIC_PRODUCTS\}/, "product result is bounded");
mustNot(repository, /SELECT \*/, "repository does not use SELECT *");
mustNot(repository, /buyer_email|buyer_phone|password|secret|token/i, "repository does not expose privileged/private fields");

must(api, /request\.method !== "GET"/, "supplier API is GET-only");
must(api, /method_not_allowed/, "wrong method returns 405 contract");
must(api, /supplier_service_unavailable/, "missing D1/internal failures are generic");
must(api, /Cache-Control|cache-control/, "public caching policy is explicit");
mustNot(api, /AGROZIA_ATTACHMENTS|EMAIL|ADMIN_PASSWORD|ADMIN_SESSION_SECRET|TELEGRAM/i, "supplier API has no privileged bindings");

must(docs, /No onboarding, editing, verification workflow, ratings, payments/, "scope excludes privileged workflows");
must(docs, /main remains unchanged|main.*unchanged/i, "release safety is documented");

console.log("Commerce-3 supplier contract/security checks: PASS");
