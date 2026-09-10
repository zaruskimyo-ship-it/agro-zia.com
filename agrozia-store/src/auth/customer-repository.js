import { sha256Hex } from "./session.js";

const PBKDF2_ITERATIONS = 310000;
const encoder = new TextEncoder();

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derivePassword(password, saltBytes) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await derivePassword(password, salt);
  return { salt: bytesToBase64(salt), hash: bytesToBase64(hash), iterations: PBKDF2_ITERATIONS };
}

export async function verifyPassword(password, record) {
  const salt = base64ToBytes(record.password_salt);
  const expected = base64ToBytes(record.password_hash);
  const actual = await derivePassword(password, salt);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export async function findCustomerByEmail(db, email) {
  return db.prepare("SELECT id, email, password_hash, password_salt, name, phone, company, country, role, status, email_verified_at, created_at, updated_at FROM customers WHERE email = ?1 LIMIT 1")
    .bind(email).first();
}

export async function createCustomer(db, input) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const password = await hashPassword(input.password);

  await db.prepare(`INSERT INTO customers
    (id, email, password_hash, password_salt, password_iterations, name, phone, company, country, role, status, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'customer', 'active', ?10, ?10)`)
    .bind(id, input.email, password.hash, password.salt, password.iterations,
      input.name, input.phone ?? null, input.company ?? null, input.country ?? null, now).run();

  return { id, email: input.email, name: input.name, role: "customer", status: "active", created_at: now };
}

export async function createSession(db, customerId, ttlSeconds = 60 * 60 * 24 * 30) {
  const rawToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const tokenHash = await sha256Hex(rawToken);
  const id = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

  await db.prepare(`INSERT INTO customer_sessions
    (id, customer_id, token_hash, expires_at, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5)`)
    .bind(id, customerId, tokenHash, expires, now.toISOString()).run();

  return { token: rawToken, expiresAt: expires };
}

export async function getCustomerFromSession(db, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  return db.prepare(`SELECT c.id, c.email, c.name, c.phone, c.company, c.country, c.role, c.status
    FROM customer_sessions s JOIN customers c ON c.id = s.customer_id
    WHERE s.token_hash = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2 AND c.status = 'active'
    LIMIT 1`).bind(tokenHash, new Date().toISOString()).first();
}

export async function revokeSession(db, token) {
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await db.prepare("UPDATE customer_sessions SET revoked_at = ?1 WHERE token_hash = ?2 AND revoked_at IS NULL")
    .bind(new Date().toISOString(), tokenHash).run();
}
