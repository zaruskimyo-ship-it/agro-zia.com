import fs from "node:fs";
const auth = fs.readFileSync("src/auth/internal-auth.js", "utf8");
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
if (!/\/api\/inquiries/.test(worker)) throw new Error("FAIL: public inquiry route reference not found");
console.log("PASS: internal auth source contract");
console.log("PASS: no hard-coded admin secrets detected");
console.log("PASS: public inquiry route reference retained");
console.log("NOTE: static contract only; live Preview/authentication is not executed here.");
