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

async function nextRequestNumber(db) {
  const currentYear = year();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const prefix = `AGZ-${currentYear}-`;
    const row = await db
      .prepare(
        "SELECT MAX(CAST(SUBSTR(request_number, 10) AS INTEGER)) AS sequence FROM inquiries WHERE request_number LIKE ?",
      )
      .bind(`${prefix}%`)
      .first();

    const next = Number(row?.sequence || 0) + 1;
    const requestNumber = `${prefix}${String(next).padStart(6, "0")}`;

    try {
      return requestNumber;
    } catch (_) {
      // Reserved for future database-specific retry handling.
    }
  }

  throw new Error("REQUEST_NUMBER_GENERATION_FAILED");
}

async function createInquiry(request, env) {
  if (!env.DB) {
    return json({ error: "service_unavailable" }, 503);
  }

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

  const requestNumber = await nextRequestNumber(env.DB);
  const createdAt = new Date().toISOString();

  try {
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
  } catch (error) {
    // A unique request-number collision can occur under concurrent submissions.
    // Return a retryable response rather than exposing database details.
    if (String(error?.message || "").toLowerCase().includes("unique")) {
      return json({ error: "please_retry" }, 409);
    }
    return json({ error: "request_not_saved" }, 500);
  }

  return json(
    {
      ok: true,
      request_number: requestNumber,
      status: "received",
      created_at: createdAt,
    },
    201,
  );
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

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not Found", { status: 404 });
  },
};
