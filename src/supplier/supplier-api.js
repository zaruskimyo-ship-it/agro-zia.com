import {
  canAttemptChallenge,
  challengeExpiresAt,
  clearSupplierSessionCookie,
  createSupplierSession,
  hashSupplierLoginCode,
  isChallengeExpired,
  normalizeSupplierEmail,
  supplierSessionCookie,
  readSupplierSession,
} from "./supplier-auth.js";
import { requireSupplier, supplierUnauthorized } from "./supplier-ownership.js";

const CODE_RE = /^\d{6}$/;
const CODE_TTL_MINUTES = 10;
const MAX_MESSAGE_LENGTH = 4000;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

async function parseJson(request) {
  if (Number(request.headers.get("content-length") || 0) > 16 * 1024) throw new Error("body_too_large");
  try { return await request.json(); } catch (_) { throw new Error("invalid_json"); }
}

function randomCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

function publicSupplier(account) {
  return {
    id: account.id,
    supplier_id: account.supplier_id,
    email: account.account_email,
    name: account.name,
    slug: account.slug,
    country: account.country || null,
    status: account.status,
  };
}

async function findAccount(db, email) {
  return db.prepare(`
    SELECT sa.id, sa.supplier_id, sa.email AS account_email, sa.status AS account_status,
           s.slug, s.name, s.country, s.status
    FROM supplier_accounts sa
    JOIN commerce_suppliers s ON s.id = sa.supplier_id
    WHERE sa.email = ?
    LIMIT 1
  `).bind(email).first();
}

async function sendLoginCode(env, email, code) {
  if (!env.EMAIL) return false;
  await env.EMAIL.send({
    to: email,
    from: "export@agro-zia.com",
    subject: "Your ZARUS supplier sign-in code",
    text: `Your ZARUS supplier sign-in code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes. If you did not request this code, you can ignore this email.`,
  });
  return true;
}

async function requestLogin(request, env) {
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);
  const input = await parseJson(request);
  const email = normalizeSupplierEmail(input?.email);
  if (!email) return json({ error: "invalid_email" }, 400);

  const account = await findAccount(env.AGROZIA_DB, email);
  if (!account || account.account_status !== "active" || account.status === "archived") {
    return json({ ok: true, message: "If this email can sign in, a code has been sent." });
  }

  const code = randomCode();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const expires = challengeExpiresAt();
  const codeHash = await hashSupplierLoginCode(code, id);

  await env.AGROZIA_DB.prepare(
    "UPDATE supplier_login_challenges SET consumed_at = ? WHERE email = ? AND consumed_at IS NULL"
  ).bind(now, email).run();
  await env.AGROZIA_DB.prepare(
    "INSERT INTO supplier_login_challenges (id,account_id,email,code_hash,expires_at,attempts,created_at) VALUES (?,?,?,?,?,0,?)"
  ).bind(id, account.id, email, codeHash, expires, now).run();

  try {
    if (!await sendLoginCode(env, email, code)) return json({ error: "email_unconfigured" }, 503);
  } catch (_) {
    return json({ error: "email_send_failed" }, 503);
  }
  return json({ ok: true, message: "If this email can sign in, a code has been sent." });
}

async function verifyLogin(request, env) {
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);
  const input = await parseJson(request);
  const email = normalizeSupplierEmail(input?.email);
  const code = String(input?.code || "").trim();
  if (!email || !CODE_RE.test(code)) return json({ error: "invalid_code" }, 400);

  const challenge = await env.AGROZIA_DB.prepare(`
    SELECT id,account_id,email,code_hash,expires_at,attempts
    FROM supplier_login_challenges
    WHERE email = ? AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).bind(email).first();
  if (!challenge || isChallengeExpired(challenge.expires_at) || !canAttemptChallenge(challenge.attempts)) {
    return json({ error: "invalid_code" }, 401);
  }

  const suppliedHash = await hashSupplierLoginCode(code, challenge.id);
  if (suppliedHash !== challenge.code_hash) {
    await env.AGROZIA_DB.prepare(
      "UPDATE supplier_login_challenges SET attempts = attempts + 1 WHERE id = ?"
    ).bind(challenge.id).run();
    return json({ error: "invalid_code" }, 401);
  }

  const account = await env.AGROZIA_DB.prepare(`
    SELECT sa.id, sa.supplier_id, sa.email AS account_email, sa.status AS account_status,
           s.slug, s.name, s.country, s.status
    FROM supplier_accounts sa
    JOIN commerce_suppliers s ON s.id = sa.supplier_id
    WHERE sa.id = ? LIMIT 1
  `).bind(challenge.account_id).first();
  if (!account || account.account_status !== "active" || account.status === "archived") {
    return json({ error: "account_unavailable" }, 403);
  }

  const now = new Date().toISOString();
  await env.AGROZIA_DB.prepare(
    "UPDATE supplier_login_challenges SET consumed_at = ? WHERE id = ?"
  ).bind(now, challenge.id).run();
  await env.AGROZIA_DB.prepare(
    "UPDATE supplier_accounts SET last_login_at = ?, updated_at = ? WHERE id = ?"
  ).bind(now, now, account.id).run();

  const token = await createSupplierSession(env, account.supplier_id);
  if (!token) return json({ error: "supplier_auth_unconfigured" }, 503);
  return json({ ok: true, supplier: publicSupplier(account) }, 200, { "set-cookie": supplierSessionCookie(token) });
}

async function session(request, env) {
  if (!env.AGROZIA_DB) return json({ authenticated: false }, 401);
  const current = await readSupplierSession(request, env);
  if (!current) return json({ authenticated: false }, 401);
  const account = await env.AGROZIA_DB.prepare(`
    SELECT sa.id, sa.supplier_id, sa.email AS account_email, sa.status AS account_status,
           s.slug, s.name, s.country, s.status
    FROM supplier_accounts sa
    JOIN commerce_suppliers s ON s.id = sa.supplier_id
    WHERE sa.supplier_id = ? AND sa.status = 'active' AND s.status <> 'archived'
    LIMIT 1
  `).bind(current.supplierId).first();
  if (!account) return json({ authenticated: false }, 401);
  return json({ authenticated: true, supplier: publicSupplier(account) });
}

async function quoteForSupplier(db, quoteId, supplier) {
  return db.prepare(`
    SELECT q.id, q.quote_number, q.rfq_id, q.product_id, q.product_name, q.quantity,
           q.status, q.validity_until, q.created_at, q.updated_at
    FROM commerce_quotes q
    WHERE q.id = ? AND q.supplier_id = ?
    LIMIT 1
  `).bind(quoteId, supplier.supplier_id).first();
}

async function supplierQuoteMessages(request, env, quoteId) {
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);
  const supplier = await requireSupplier(env.AGROZIA_DB, request, env);
  if (!supplier) return supplierUnauthorized();
  const quote = await quoteForSupplier(env.AGROZIA_DB, quoteId, supplier);
  if (!quote) return json({ error: "not_found" }, 404);

  if (request.method === "GET") {
    const rows = await env.AGROZIA_DB.prepare(`
      SELECT id, quote_id, 'supplier' AS sender_type, message, created_at
      FROM commerce_supplier_quote_messages
      WHERE quote_id = ? AND supplier_id = ?
      ORDER BY created_at ASC LIMIT 200
    `).bind(quoteId, supplier.supplier_id).all();
    return json({ ok: true, quote_id: quoteId, messages: rows.results || [] });
  }

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body;
  try { body = await parseJson(request); } catch (error) {
    return json({ error: error.message === "body_too_large" ? "body_too_large" : "invalid_json" }, 400);
  }
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: "message_required" }, 400);
  if (message.length > MAX_MESSAGE_LENGTH) return json({ error: "message_too_long", max_length: MAX_MESSAGE_LENGTH }, 400);
  if (!["sent", "negotiating"].includes(quote.status)) return json({ error: "quote_action_not_allowed" }, 409);

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await env.AGROZIA_DB.prepare(`
    INSERT INTO commerce_supplier_quote_messages
      (id, quote_id, supplier_account_id, supplier_id, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, quoteId, supplier.account_id, supplier.supplier_id, message, now).run();

  if (quote.status === "sent") {
    await env.AGROZIA_DB.prepare(
      "UPDATE commerce_quotes SET status='negotiating', updated_at=? WHERE id=? AND supplier_id=? AND status='sent'"
    ).bind(now, quoteId, supplier.supplier_id).run();
  }

  return json({ ok: true, status: "negotiating", message: { id, quote_id: quoteId, sender_type: "supplier", message, created_at: now } }, 201);
}

export async function handleSupplierRoute(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/supplier/")) return null;
  try {
    const messageMatch = url.pathname.match(/^\/api\/supplier\/quotes\/([^/]+)\/messages$/);
    if (messageMatch) return await supplierQuoteMessages(request, env, decodeURIComponent(messageMatch[1]));
    if (url.pathname === "/api/supplier/auth/request" && request.method === "POST") return await requestLogin(request, env);
    if (url.pathname === "/api/supplier/auth/verify" && request.method === "POST") return await verifyLogin(request, env);
    if (url.pathname === "/api/supplier/session" && request.method === "GET") return await session(request, env);
    if (url.pathname === "/api/supplier/logout" && request.method === "POST") return json({ ok: true }, 200, { "set-cookie": clearSupplierSessionCookie() });
    return json({ error: "not_found" }, 404);
  } catch (error) {
    console.error("Supplier API error", { code: String(error?.message || "unknown").slice(0, 80) });
    return json({ error: "supplier_request_failed" }, 503);
  }
}