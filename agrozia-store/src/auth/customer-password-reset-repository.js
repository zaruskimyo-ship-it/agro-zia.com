import { randomToken, sha256Hex } from "./session.js";

export const CUSTOMER_PASSWORD_RESET_TTL_SECONDS = 30 * 60;

export function createPasswordResetToken() {
  return randomToken(32);
}

export async function createPasswordReset(db, customerId, token, ttlSeconds = CUSTOMER_PASSWORD_RESET_TTL_SECONDS) {
  const id = crypto.randomUUID();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

  await db.prepare(`
    INSERT INTO customer_password_resets
      (id, customer_id, token_hash, expires_at, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5)
  `).bind(id, customerId, tokenHash, expiresAt, now.toISOString()).run();

  return { id, customerId, token, expiresAt };
}

export async function findValidPasswordReset(db, token, now = new Date()) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  return db.prepare(`
    SELECT id, customer_id, token_hash, expires_at, used_at, created_at
    FROM customer_password_resets
    WHERE token_hash = ?1
      AND used_at IS NULL
      AND expires_at > ?2
    LIMIT 1
  `).bind(tokenHash, now.toISOString()).first();
}

export async function markPasswordResetUsed(db, resetId, usedAt = new Date()) {
  await db.prepare(`
    UPDATE customer_password_resets
    SET used_at = ?1
    WHERE id = ?2 AND used_at IS NULL
  `).bind(usedAt.toISOString(), resetId).run();
}

export async function invalidateCustomerPasswordResets(db, customerId, usedAt = new Date()) {
  await db.prepare(`
    UPDATE customer_password_resets
    SET used_at = ?1
    WHERE customer_id = ?2 AND used_at IS NULL
  `).bind(usedAt.toISOString(), customerId).run();
}
