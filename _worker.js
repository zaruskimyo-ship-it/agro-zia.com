const MAX_LENGTHS = {
  product: 200,
  company: 200,
  specification: 2000,
  quantity: 200,
  destination: 200,
  timing: 200,
  email: 320,
  phone: 80,
  message: 4000,
  language: 10,
};

const ALLOWED_LANGUAGES = new Set(["en", "ru", "fa", "ar", "uz", "tr"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
    },
  });
}

function clean(value, max) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, max);
}

function exceedsMaxLength(value, max) {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > max;
}

function year() {
  return new Date().getUTCFullYear();
}

function fallbackRequestNumber() {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `AGZ-${year()}-T${stamp}${random}`;
}

async function nextRequestNumber(db) {
  const currentYear = year();
  const prefix = `AGZ-${currentYear}-`;
  const row = await db
    .prepare(
      "SELECT MAX(CAST(SUBSTR(request_number, 10) AS INTEGER)) AS sequence FROM inquiries WHERE request_number LIKE ?",
    )
    .bind(`${prefix}%`)
    .first();

  const next = Number(row?.sequence || 0) + 1;
  return `${prefix}${String(next).padStart(6, "0")}`;
}

async function createInquiry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "invalid_json" }, 400);
  }

  const lengthFields = Object.keys(MAX_LENGTHS);
  for (const field of lengthFields) {
    if (exceedsMaxLength(body?.[field], MAX_LENGTHS[field])) {
      return json({ error: "field_too_long", field, max_length: MAX_LENGTHS[field] }, 400);
    }
  }

  const language = ALLOWED_LANGUAGES.has(body?.language) ? body.language : "en";
  const product = clean(body?.product, MAX_LENGTHS.product);
  const company = clean(body?.company, MAX_LENGTHS.company);
  const specification = clean(body?.specification, MAX_LENGTHS.specification);
  const quantity = clean(body?.quantity, MAX_LENGTHS.quantity);
  const destination = clean(body?.destination, MAX_LENGTHS.destination);
  const timing = clean(body?.timing, MAX_LENGTHS.timing);
  const email = clean(body?.email, MAX_LENGTHS.email);
  const phone = clean(body?.phone, MAX_LENGTHS.phone);
  const message = clean(body?.message, MAX_LENGTHS.message);

  if (!product) return json({ error: "product_required" }, 400);
  if (!email && !phone) return json({ error: "contact_required" }, 400);
  if (email && !EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  const createdAt = new Date().toISOString();

  if (!env.AGROZIA_DB) {
    return json({
      ok: true,
      persisted: false,
      temporary: true,
      request_number: fallbackRequestNumber(),
      status: "email_fallback",
      created_at: createdAt,
    }, 201);
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    let requestNumber;
    try {
      requestNumber = await nextRequestNumber(env.AGROZIA_DB);
      await env.AGROZIA_DB.prepare(
        `INSERT INTO inquiries
          (request_number, created_at, language, product, company, specification,
           quantity, destination, timing, email, phone, message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received')`,
      )
        .bind(
          requestNumber,
          createdAt,
          language,
          product,
          company || null,
          specification || null,
          quantity || null,
          destination || null,
          timing || null,
          email || null,
          phone || null,
          message || null,
        )
        .run();

      return json({
        ok: true,
        persisted: true,
        request_number: requestNumber,
        status: "received",
        created_at: createdAt,
      }, 201);
    } catch (error) {
      const messageText = String(error?.message || "").toLowerCase();
      if (messageText.includes("unique") && attempt < 5) continue;
      if (messageText.includes("unique")) {
        return json({
          ok: true,
          persisted: false,
          temporary: true,
          request_number: fallbackRequestNumber(),
          status: "email_fallback",
          created_at: createdAt,
        }, 201);
      }
      console.error("D1 inquiry persistence failed; continuing with temporary reference:", error);
      return json({
        ok: true,
        persisted: false,
        temporary: true,
        request_number: fallbackRequestNumber(),
        status: "email_fallback",
        created_at: createdAt,
      }, 201);
    }
  }

  return json({
    ok: true,
    persisted: false,
    temporary: true,
    request_number: fallbackRequestNumber(),
    status: "email_fallback",
    created_at: createdAt,
  }, 201);
}

function adminAuthorized(request, env) {
  const configured = env.ADMIN_TOKEN;
  if (!configured) return { ok: false, error: "admin_auth_unconfigured" };
  const authorization = request.headers.get("Authorization") || "";
  if (authorization !== `Bearer ${configured}`) return { ok: false, error: "admin_auth_required" };
  return { ok: true };
}

async function listAdminInquiries(request, env) {
  if (!env.AGROZIA_DB) return json({ error: "database_unavailable" }, 503);

  const auth = adminAuthorized(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.error === "admin_auth_unconfigured" ? 503 : 401);

  const url = new URL(request.url);
  const q = clean(url.searchParams.get("q"), 120);
  const status = clean(url.searchParams.get("status"), 30);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 100);

  const conditions = [];
  const values = [];
  if (q) {
    const pattern = `%${q}%`;
    conditions.push("(request_number LIKE ? OR company LIKE ? OR product LIKE ? OR destination LIKE ? OR email LIKE ?)");
    values.push(pattern, pattern, pattern, pattern, pattern);
  }
  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const stmt = env.AGROZIA_DB.prepare(
    `SELECT id, request_number, created_at, language, product, company, specification,
            quantity, destination, timing, email, phone, message, status
     FROM inquiries ${where}
     ORDER BY id DESC LIMIT ?`,
  ).bind(...values, limit);

  const result = await stmt.all();
  return json({ ok: true, count: result.results?.length || 0, inquiries: result.results || [] });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inquiries" && request.method === "POST") {
      return createInquiry(request, env);
    }

    if (url.pathname === "/api/admin/inquiries" && request.method === "GET") {
      return listAdminInquiries(request, env);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "agro-zia-inquiry-api" });
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not Found", { status: 404 });
  },
};
