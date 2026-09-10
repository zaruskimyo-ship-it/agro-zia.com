import { sha256Hex } from "../auth/session.js";

export const STORE_ADMIN_SESSION_COOKIE = "agz_store_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function cookieToken(request) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${STORE_ADMIN_SESSION_COOKIE}=([^;]*)`));
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

function cookie(token, maxAge) {
  return `${STORE_ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export async function getStoreAdmin(request, env) {
  const token = cookieToken(request);
  if (!token || !env.STORE_ADMIN_SESSION_SECRET) return null;
  const hash = await sha256Hex(`${env.STORE_ADMIN_SESSION_SECRET}:${token}`);
  return env.STORE_DB.prepare(`SELECT id, expires_at FROM store_admin_sessions
    WHERE token_hash = ?1 AND revoked_at IS NULL AND expires_at > ?2 LIMIT 1`)
    .bind(hash, new Date().toISOString()).first();
}

export async function handleStoreAdminAuth(request, env, pathname) {
  if (pathname === "/api/store-admin/login" && request.method === "POST") {
    const body = await request.json().catch(() => null);
    const password = String(body?.password ?? "");
    if (!env.STORE_ADMIN_PASSWORD || !env.STORE_ADMIN_SESSION_SECRET || password.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "admin_auth_unavailable" }), { status: 503, headers: { "content-type": "application/json; charset=utf-8" } });
    }
    if (password !== env.STORE_ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_credentials" }), { status: 401, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }
    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const hash = await sha256Hex(`${env.STORE_ADMIN_SESSION_SECRET}:${token}`);
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();
    await env.STORE_DB.prepare(`INSERT INTO store_admin_sessions (id, token_hash, expires_at, created_at)
      VALUES (?1, ?2, ?3, ?4)`).bind(crypto.randomUUID(), hash, expires, now.toISOString()).run();
    return new Response(JSON.stringify({ ok: true, expires_at: expires }), { status: 200, headers: {
      "content-type": "application/json; charset=utf-8", "cache-control": "no-store",
      "set-cookie": cookie(token, SESSION_TTL_SECONDS), "x-content-type-options": "nosniff"
    }});
  }
  if (pathname === "/api/store-admin/logout" && request.method === "POST") {
    const token = cookieToken(request);
    if (token && env.STORE_ADMIN_SESSION_SECRET) {
      const hash = await sha256Hex(`${env.STORE_ADMIN_SESSION_SECRET}:${token}`);
      await env.STORE_DB.prepare("UPDATE store_admin_sessions SET revoked_at = ?1 WHERE token_hash = ?2 AND revoked_at IS NULL")
        .bind(new Date().toISOString(), hash).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: {
      "content-type": "application/json; charset=utf-8", "cache-control": "no-store",
      "set-cookie": cookie("", 0), "x-content-type-options": "nosniff"
    }});
  }
  return null;
}
