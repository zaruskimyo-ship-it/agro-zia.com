const COOKIE = "agz_supplier_session";
const TTL_SECONDS = 8 * 60 * 60;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

async function digest(value) {
  return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function secret(env) {
  return typeof env.SUPPLIER_SESSION_SECRET === "string" && env.SUPPLIER_SESSION_SECRET.length >= 32
    ? env.SUPPLIER_SESSION_SECRET
    : null;
}

export async function hashSupplierLoginCode(code, challengeId) {
  return digest(`${challengeId}:${code}`);
}

export function normalizeSupplierEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320 ? email : null;
}

export async function createSupplierSession(env, supplierId, now = Date.now()) {
  const key = secret(env);
  if (!key || !supplierId) return null;
  const payload = `${supplierId}.${Math.floor(now / 1000) + TTL_SECONDS}`;
  const signature = b64url(await hmac(key, payload));
  return `${payload}.${signature}`;
}

export async function readSupplierSession(request, env, now = Date.now()) {
  const key = secret(env);
  if (!key) return null;
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return null;
  const parts = match[1].split(".");
  if (parts.length !== 3) return null;
  const [supplierId, expires, signature] = parts;
  if (!supplierId || !/^\d+$/.test(expires) || Number(expires) < Math.floor(now / 1000)) return null;
  const payload = `${supplierId}.${expires}`;
  const expected = await hmac(key, payload);
  let supplied;
  try { supplied = fromB64url(signature); } catch (_) { return null; }
  if (supplied.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected[i] ^ supplied[i];
  return diff === 0 ? { supplierId, expiresAt: Number(expires) } : null;
}

export function supplierSessionCookie(token, maxAge = TTL_SECONDS) {
  return `${COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSupplierSessionCookie() {
  return `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

export function challengeExpiresAt(now = Date.now()) {
  return new Date(now + CHALLENGE_TTL_MS).toISOString();
}

export function isChallengeExpired(value, now = Date.now()) {
  const timestamp = Date.parse(value || "");
  return !Number.isFinite(timestamp) || timestamp <= now;
}

export function canAttemptChallenge(attempts) {
  return Number(attempts || 0) < MAX_ATTEMPTS;
}
