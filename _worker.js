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

  if (!env.DB) {
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
      requestNumber = await nextRequestNumber(env.DB);
      await env.DB.prepare(
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
      if (messageText.includes("unique")) return json({ error: "please_retry" }, 409);
      return json({ error: "request_not_saved" }, 500);
    }
  }

  return json({ error: "please_retry" }, 409);
}

async function serveAsset(request, env) {
  const url = new URL(request.url);
  const response = await env.ASSETS.fetch(request);
  if (request.method !== "GET" || url.pathname !== "/inquiry.html" || !response.ok) return response;

  const html = await response.text();
  const cleaned = html.replace(
    /document\.getElementById\('rfq'\)\.addEventListener\('submit',[\s\S]*?window\.location\.href=`mailto:export@agro-zia\.com\?subject=\$\{encodeURIComponent\(subject\)\}&body=\$\{encodeURIComponent\(body\)\}`\}\);/,
    "",
  );

  if (cleaned === html) return response;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  return new Response(cleaned, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inquiries" && request.method === "POST") {
      return createInquiry(request, env);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "agro-zia-inquiry-api" });
    }

    if (env.ASSETS) return serveAsset(request, env);
    return new Response("Not Found", { status: 404 });
  },
};