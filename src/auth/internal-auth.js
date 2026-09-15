const SESSION_COOKIE = "agz_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_CLOCK_SKEW_SECONDS = 60;
const encoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signPayload(payload, secret) {
  const signature = await crypto.subtle.sign("HMAC", await importHmacKey(secret), encoder.encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyPayload(payload, signature, secret) {
  try {
    return await crypto.subtle.verify("HMAC", await importHmacKey(secret), base64UrlToBytes(signature), encoder.encode(payload));
  } catch (_) {
    return false;
  }
}

async function secretEquals(value, expected) {
  if (!value || !expected) return false;
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(String(value))),
    crypto.subtle.digest("SHA-256", encoder.encode(String(expected))),
  ]);
  return crypto.subtle.timingSafeEqual(left, right);
}

function parseCookies(request) {
  const cookies = {};
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return cookies;
}

function cookieHeader(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSession() { return cookieHeader("", 0); }
export function authConfigurationPresent(env) { return Boolean(env?.ADMIN_PASSWORD && env?.ADMIN_SESSION_SECRET); }

export async function createAdminSession(env, subject = "admin") {
  if (!authConfigurationPresent(env)) return null;
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonceBytes = new Uint8Array(32);
  crypto.getRandomValues(nonceBytes);
  const payload = JSON.stringify({ sub: subject, iat: issuedAt, exp: issuedAt + SESSION_TTL_SECONDS, nonce: bytesToBase64Url(nonceBytes) });
  const encodedPayload = bytesToBase64Url(encoder.encode(payload));
  return `${encodedPayload}.${await signPayload(encodedPayload, env.ADMIN_SESSION_SECRET)}`;
}

export async function verifyAdminSession(request, env) {
  if (!authConfigurationPresent(env)) return { ok: false, reason: "auth_unconfigured" };
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return { ok: false, reason: "missing_session" };
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return { ok: false, reason: "invalid_session" };
  const encodedPayload = token.slice(0, dot);
  if (!(await verifyPayload(encodedPayload, token.slice(dot + 1), env.ADMIN_SESSION_SECRET))) return { ok: false, reason: "invalid_session" };
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload)));
    const now = Math.floor(Date.now() / 1000);
    if (!payload || payload.sub !== "admin" || !Number.isInteger(payload.exp) || !Number.isInteger(payload.iat)) return { ok: false, reason: "invalid_session" };
    if (payload.exp < now - MAX_CLOCK_SKEW_SECONDS || payload.iat > now + MAX_CLOCK_SKEW_SECONDS) return { ok: false, reason: "expired_session" };
    return { ok: true, subject: payload.sub, expires_at: payload.exp };
  } catch (_) { return { ok: false, reason: "invalid_session" }; }
}

export async function verifyAdminPassword(password, env) {
  if (!authConfigurationPresent(env)) return { ok: false, reason: "auth_unconfigured" };
  return { ok: await secretEquals(password, env.ADMIN_PASSWORD), reason: "invalid_credentials" };
}

export function sessionSetCookie(token) { return cookieHeader(token, SESSION_TTL_SECONDS); }
export function authNoStoreHeaders(extra = {}) { return { "cache-control": "no-store", ...extra }; }
export const INTERNAL_AUTH_CONSTANTS = Object.freeze({ SESSION_COOKIE, SESSION_TTL_SECONDS });
