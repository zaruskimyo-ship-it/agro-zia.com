import fs from "node:fs";
const auth = fs.readFileSync("src/auth/internal-auth.js", "utf8");
const admin = fs.readFileSync("src/admin/admin-api.js", "utf8");
const worker = fs.readFileSync("_worker.js", "utf8");
const required = [
  ["session cookie", /agz_admin_session/],
  ["8-hour session TTL", /SESSION_TTL_SECONDS\s*=\s*8\s*\*\s*60\s*\*\s*60/],
  ["HMAC-SHA-256", /HMAC.*SHA-256/],
  ["cryptographic randomness", /crypto\.getRandomValues/],
  ["timing-safe comparison", /timingSafeEqual/],
  ["HttpOnly cookie", /HttpOnly/],
  ["Secure cookie", /Secure/],
  ["SameSite Strict", /SameSite=Strict/],
  ["ADMIN_PASSWORD secret", /ADMIN_PASSWORD/],
  ["ADMIN_SESSION_SECRET secret", /ADMIN_SESSION_SECRET/],
];
for (const [name, pattern] of required) if (!pattern.test(auth)) throw new Error(`FAIL: ${name}`);
if (/ADMIN_PASSWORD\s*[:=]\s*["'`]/.test(auth)) throw new Error("FAIL: hard-coded ADMIN_PASSWORD detected");
if (/ADMIN_SESSION_SECRET\s*[:=]\s*["'`]/.test(auth)) throw new Error("FAIL: hard-coded ADMIN_SESSION_SECRET detected");
const adminRequired = [
  ["admin login", /export async function adminLogin/],
  ["admin logout", /export async function adminLogout/],
  ["admin session", /export async function adminSession/],
  ["admin inquiry list", /export async function adminListInquiries/],
  ["admin inquiry detail", /export async function adminGetInquiry/],
  ["authenticated gate", /verifyAdminSession/],
  ["bounded limit", /MAX_LIMIT\s*=\s*50/],
  ["search validation", /MAX_SEARCH_LENGTH/],
  ["reference validation", /AGZ-\\d\{4\}-\\d\{6\}/],
  ["no-store", /cache-control.*no-store/],
  ["attachment metadata only", /attachment:\s*row\.attachment_name/],
];
for (const [name, pattern] of adminRequired) if (!pattern.test(admin)) throw new Error(`FAIL: ${name}`);
if (/attachment_key/.test(admin)) throw new Error("FAIL: attachment_key appears anywhere in admin API source");
if (/AGROZIA_ATTACHMENTS/.test(admin)) throw new Error("FAIL: admin API directly accesses R2 attachment storage");
if (!/attachment_name\s*,\s*attachment_type\s*,\s*attachment_size/.test(admin)) throw new Error("FAIL: attachment metadata query contract missing");
if (!/\/api\/inquiries/.test(worker)) throw new Error("FAIL: public inquiry route reference not found");
console.log("PASS: internal auth source contract");
console.log("PASS: no hard-coded admin secrets detected");
console.log("PASS: authenticated admin API module contract");
console.log("PASS: attachment metadata only; no R2 key/bytes surface");
console.log("PASS: public inquiry route reference retained");
console.log("NOTE: static contract only; live Preview/authentication is not executed here.");
