import { adminTokenFromRequest, randomHex, sha256Hex } from "./admin-session.js";

const PBKDF2_ITERATIONS = 310000;
const encoder = new TextEncoder();

function nowIso() { return new Date().toISOString(); }

async function derivePassword(password, saltHex, iterations = PBKDF2_ITERATIONS) {
  const salt = new Uint8Array((saltHex.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminPassword(password, admin) {
  const hash = await derivePassword(password, admin.password_salt, admin.password_iterations);
  return hash === admin.password_hash;
}

export async function findAdminByEmail(db, email) {
  return db.prepare(
    `SELECT id, email, name, password_hash, password_salt, password_iterations, role, status
     FROM store_admin_users WHERE email = ?1 LIMIT 1`
  ).bind(email).first();
}

export async function createAdmin(db, { email, name, password, role = "admin" }) {
  const id = crypto.randomUUID();
  const salt = randomHex(16);
  const passwordHash = await derivePassword(password, salt);
  const now = nowIso();
  await db.prepare(
    `INSERT INTO store_admin_users
      (id, email, name, password_hash, password_salt, password_iterations, role, status, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'active', ?8, ?8)`
  ).bind(id, email, name, passwordHash, salt, PBKDF2_ITERATIONS, role, now).run();
  return { id, email, name, role, status: "active" };
}

export async function createAdminSession(db, adminId, ttlSeconds = 60 * 60 * 8) {
  const token = randomHex(32);
  const id = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + ttlSeconds * 1000);
  await db.prepare(
    `INSERT INTO store_admin_sessions (id, admin_id, token_hash, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5)`
  ).bind(id, adminId, await sha256Hex(token), now.toISOString(), expires.toISOString()).run();
  return { token, expiresAt: expires.toISOString() };
}

export async function getAdminFromSession(db, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  return db.prepare(
    `SELECT a.id, a.email, a.name, a.role, a.status
     FROM store_admin_sessions s
     JOIN store_admin_users a ON a.id = s.admin_id
     WHERE s.token_hash = ?1
       AND s.revoked_at IS NULL
       AND s.expires_at > ?2
       AND a.status = 'active'
     LIMIT 1`
  ).bind(tokenHash, nowIso()).first();
}

export async function revokeAdminSession(db, token) {
  if (!token) return;
  await db.prepare(
    `UPDATE store_admin_sessions SET revoked_at = ?1 WHERE token_hash = ?2 AND revoked_at IS NULL`
  ).bind(nowIso(), await sha256Hex(token)).run();
}

export async function requireAdmin(db, request, roles = []) {
  const admin = await getAdminFromSession(db, adminTokenFromRequest(request));
  if (!admin) return { ok: false, status: 401, admin: null };
  if (roles.length && !roles.includes(admin.role)) return { ok: false, status: 403, admin };
  return { ok: true, status: 200, admin };
}
