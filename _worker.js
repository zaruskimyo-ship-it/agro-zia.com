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

  for (const field of Object.keys(MAX_LENGTHS)) {
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
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const createdAt = new Date().toISOString();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const requestNumber = await nextRequestNumber(env.AGROZIA_DB);
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
      console.error("D1 inquiry persistence failed:", error);
      return json({ error: "d1_persistence_failed" }, 503);
    }
  }

  return json({ error: "d1_persistence_failed" }, 503);
}

async function serveHomepage(request, env) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const url = new URL(request.url);
  if (url.pathname !== "/" && url.pathname !== "/multilingual-preview" && url.pathname !== "/multilingual-preview.html") {
    return response;
  }

  const html = await response.text();
  const injected = html.replace("</body>", '<script src="/inquiry-integration.js"></script>\n</body>');
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inquiries" && request.method === "POST") {
      return createInquiry(request, env);
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "agro-zia-inquiry-api", d1_bound: Boolean(env.AGROZIA_DB) });
    }

    if (env.ASSETS) return serveHomepage(request, env);
    return new Response("Not Found", { status: 404 });
  },
};
