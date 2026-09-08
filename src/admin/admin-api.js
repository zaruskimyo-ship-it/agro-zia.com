import {
  authConfigurationPresent,
  authNoStoreHeaders,
  clearAdminSession,
  createAdminSession,
  sessionSetCookie,
  verifyAdminPassword,
  verifyAdminSession,
} from "../auth/internal-auth.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_SEARCH_LENGTH = 120;
const MAX_STATUS_LENGTH = 40;

function adminJson(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: authNoStoreHeaders({
      "content-type": "application/json; charset=UTF-8",
      ...extraHeaders,
    }),
  });
}

function clampLimit(value) {
  const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

function cleanSearch(value) {
  return String(value || "").trim().slice(0, MAX_SEARCH_LENGTH);
}

function cleanStatus(value) {
  return String(value || "").trim().slice(0, MAX_STATUS_LENGTH);
}

function safeInquiry(row) {
  return {
    request_number: row.request_number,
    created_at: row.created_at,
    language: row.language,
    product: row.product,
    company: row.company,
    destination: row.destination,
    status: row.status,
  };
}

function safeInquiryDetail(row) {
  return {
    ...safeInquiry(row),
    specification: row.specification,
    quantity: row.quantity,
    timing: row.timing,
    email: row.email,
    phone: row.phone,
    message: row.message,
    attachment: row.attachment_name
      ? {
          name: row.attachment_name,
          type: row.attachment_type,
          size: row.attachment_size,
        }
      : null,
  };
}

async function requireAdmin(request, env) {
  const session = await verifyAdminSession(request, env);
  if (!session.ok) {
    const status = session.reason === "auth_unconfigured" ? 503 : 401;
    return { response: adminJson({ error: status === 503 ? "admin_auth_unconfigured" : "unauthorized" }, status) };
  }
  return { session };
}

export async function adminLogin(request, env) {
  if (!authConfigurationPresent(env)) return adminJson({ error: "admin_auth_unconfigured" }, 503);
  if (request.method !== "POST") return adminJson({ error: "method_not_allowed" }, 405, { allow: "POST" });

  let body;
  try { body = await request.json(); } catch (_) { return adminJson({ error: "invalid_json" }, 400); }
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password || password.length > 512) return adminJson({ error: "invalid_credentials" }, 401);

  const result = await verifyAdminPassword(password, env);
  if (!result.ok) return adminJson({ error: "invalid_credentials" }, 401);

  const token = await createAdminSession(env, "admin");
  if (!token) return adminJson({ error: "admin_auth_unconfigured" }, 503);

  return adminJson({ ok: true, authenticated: true }, 200, { "set-cookie": sessionSetCookie(token) });
}

export async function adminLogout(request) {
  if (request.method !== "POST") return adminJson({ error: "method_not_allowed" }, 405, { allow: "POST" });
  return adminJson({ ok: true, authenticated: false }, 200, { "set-cookie": clearAdminSession() });
}

export async function adminSession(request, env) {
  if (request.method !== "GET") return adminJson({ error: "method_not_allowed" }, 405, { allow: "GET" });
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  return adminJson({ ok: true, authenticated: true, expires_at: auth.session.expires_at });
}

export async function adminListInquiries(request, env) {
  if (request.method !== "GET") return adminJson({ error: "method_not_allowed" }, 405, { allow: "GET" });
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  if (!env.AGROZIA_DB) return adminJson({ error: "d1_unavailable" }, 503);

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"));
  const offsetRaw = Number.parseInt(url.searchParams.get("offset") || "0", 10);
  const offset = Number.isFinite(offsetRaw) ? Math.min(10000, Math.max(0, offsetRaw)) : 0;
  const search = cleanSearch(url.searchParams.get("search"));
  const status = cleanStatus(url.searchParams.get("status"));

  const conditions = [];
  const values = [];
  if (search) {
    conditions.push("(request_number LIKE ? OR company LIKE ? OR product LIKE ?)");
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }
  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const count = await env.AGROZIA_DB.prepare(`SELECT COUNT(*) AS total FROM inquiries${where}`).bind(...values).first();
  const rows = await env.AGROZIA_DB.prepare(
    `SELECT request_number, created_at, language, product, company, destination, status
     FROM inquiries${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  ).bind(...values, limit, offset).all();

  return adminJson({
    ok: true,
    items: (rows?.results || []).map(safeInquiry),
    pagination: { limit, offset, total: Number(count?.total || 0) },
  });
}

export async function adminGetInquiry(request, env, reference) {
  if (request.method !== "GET") return adminJson({ error: "method_not_allowed" }, 405, { allow: "GET" });
  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  if (!env.AGROZIA_DB) return adminJson({ error: "d1_unavailable" }, 503);

  const normalizedReference = String(reference || "").trim().slice(0, 32);
  if (!/^AGZ-\d{4}-\d{6}$/.test(normalizedReference)) return adminJson({ error: "invalid_reference" }, 400);

  const row = await env.AGROZIA_DB.prepare(
    `SELECT request_number, created_at, language, product, company, destination, status,
            specification, quantity, timing, email, phone, message,
            attachment_name, attachment_type, attachment_size
     FROM inquiries WHERE request_number = ? LIMIT 1`,
  ).bind(normalizedReference).first();

  if (!row) return adminJson({ error: "not_found" }, 404);
  return adminJson({ ok: true, inquiry: safeInquiryDetail(row) });
}
