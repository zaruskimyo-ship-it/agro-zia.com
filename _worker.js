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
const MAX_ATTACHMENT_BYTES = 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/jpg"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" },
  });
}

function clean(value, max) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, max);
}

function exceedsMaxLength(value, max) {
  return value !== undefined && value !== null && String(value).trim().length > max;
}

function year() { return new Date().getUTCFullYear(); }

async function nextRequestNumber(db) {
  const prefix = `AGZ-${year()}-`;
  const row = await db.prepare(
    "SELECT MAX(CAST(SUBSTR(request_number, 10) AS INTEGER)) AS sequence FROM inquiries WHERE request_number LIKE ?",
  ).bind(`${prefix}%`).first();
  return `${prefix}${String(Number(row?.sequence || 0) + 1).padStart(6, "0")}`;
}

function attachmentTypeAllowed(file) {
  return Boolean(file && (ALLOWED_ATTACHMENT_TYPES.has(file.type) || /\.(pdf|jpe?g)$/i.test(file.name || "")));
}

async function parseInquiry(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    const form = await request.formData();
    const body = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));
    const attachment = form.get("attachment");
    return { body, attachment: attachment instanceof File && attachment.size ? attachment : null };
  }
  try { return { body: await request.json(), attachment: null }; }
  catch (_) { throw new Error("invalid_json"); }
}

async function createInquiry(request, env) {
  let parsed;
  try { parsed = await parseInquiry(request); }
  catch (error) { return json({ error: error.message === "invalid_json" ? "invalid_json" : "invalid_form" }, 400); }

  const body = parsed.body || {};
  const attachment = parsed.attachment;

  for (const field of Object.keys(MAX_LENGTHS)) {
    if (exceedsMaxLength(body[field], MAX_LENGTHS[field])) return json({ error: "field_too_long", field, max_length: MAX_LENGTHS[field] }, 400);
  }

  const language = ALLOWED_LANGUAGES.has(body.language) ? body.language : "en";
  const product = clean(body.product, MAX_LENGTHS.product);
  const company = clean(body.company, MAX_LENGTHS.company);
  const specification = clean(body.specification, MAX_LENGTHS.specification);
  const quantity = clean(body.quantity, MAX_LENGTHS.quantity);
  const destination = clean(body.destination, MAX_LENGTHS.destination);
  const timing = clean(body.timing, MAX_LENGTHS.timing);
  const email = clean(body.email, MAX_LENGTHS.email);
  const phone = clean(body.phone, MAX_LENGTHS.phone);
  const message = clean(body.message, MAX_LENGTHS.message);

  if (!product) return json({ error: "product_required" }, 400);
  if (!email && !phone) return json({ error: "contact_required" }, 400);
  if (email && !EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  if (attachment) {
    if (!attachmentTypeAllowed(attachment)) return json({ error: "attachment_invalid_type" }, 400);
    if (attachment.size > MAX_ATTACHMENT_BYTES) return json({ error: "attachment_too_large", max_bytes: MAX_ATTACHMENT_BYTES }, 400);
    if (!env.AGROZIA_ATTACHMENTS) return json({ error: "attachment_storage_unconfigured" }, 503);
  }

  const createdAt = new Date().toISOString();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    let requestNumber = "";
    let attachmentKey = null;
    let storedObject = null;
    try {
      requestNumber = await nextRequestNumber(env.AGROZIA_DB);

      if (attachment) {
        const safeName = String(attachment.name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
        attachmentKey = `inquiries/${requestNumber}/${crypto.randomUUID()}-${safeName}`;
        storedObject = await env.AGROZIA_ATTACHMENTS.put(attachmentKey, attachment.stream(), {
          httpMetadata: { contentType: attachment.type || "application/octet-stream", contentDisposition: `attachment; filename="${safeName}"` },
          customMetadata: { request_number: requestNumber, original_name: safeName },
        });
      }

      await env.AGROZIA_DB.prepare(
        `INSERT INTO inquiries
          (request_number, created_at, language, product, company, specification,
           quantity, destination, timing, email, phone, message, status,
           attachment_key, attachment_name, attachment_type, attachment_size, attachment_etag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?, ?, ?)`,
      ).bind(
        requestNumber, createdAt, language, product, company || null, specification || null,
        quantity || null, destination || null, timing || null, email || null, phone || null,
        message || null, attachmentKey, attachment?.name || null, attachment?.type || null,
        attachment?.size || null, storedObject?.httpEtag || storedObject?.etag || null,
      ).run();

      return json({
        ok: true,
        persisted: true,
        request_number: requestNumber,
        status: "received",
        created_at: createdAt,
        attachment: attachment ? { name: attachment.name, type: attachment.type, size: attachment.size } : null,
      }, 201);
    } catch (error) {
      if (attachmentKey && env.AGROZIA_ATTACHMENTS) {
        try { await env.AGROZIA_ATTACHMENTS.delete(attachmentKey); } catch (_) {}
      }
      const text = String(error?.message || "").toLowerCase();
      if (text.includes("unique") && attempt < 5) continue;
      console.error("D1 inquiry persistence failed:", error);
      return json({ error: "d1_persistence_failed" }, 503);
    }
  }
  return json({ error: "d1_persistence_failed" }, 503);
}

const MULTILINGUAL_INQUIRY_FORM = `
<div class="contact-grid" id="canonical-business-inquiry">
  <div>
    <p class="eyebrow">BUSINESS INQUIRY</p>
    <h2 data-i18n="contact_title"></h2>
    <p class="section-text" data-i18n="contact_text"></p>
    <p><strong>info@agro-zia.com</strong><br><strong>export@agro-zia.com</strong></p>
  </div>
  <form id="canonical-inquiry-form" novalidate>
    <div class="form-grid">
      <label><span data-i18n="name"></span><input name="company_contact_name" autocomplete="name"></label>
      <label><span data-i18n="company"></span><input name="company" autocomplete="organization"></label>
      <label><span data-i18n="country"></span><input name="destination" autocomplete="country-name"></label>
      <label><span data-i18n="email"></span><input type="email" name="email" autocomplete="email"></label>
      <label><span data-i18n="phone"></span><input name="phone" autocomplete="tel"></label>
      <label><span data-i18n="interest"></span><select name="product"><option value="Product">Product</option><option value="Engineering">Engineering</option><option value="Project">Project</option><option value="Trade">Trade</option></select></label>
      <label class="full"><span data-i18n="specification_label">Required specification</span><input name="specification"></label>
      <label><span data-i18n="quantity_label">Quantity</span><input name="quantity"></label>
      <label><span data-i18n="timing_label">Preferred timing</span><input name="timing"></label>
      <label class="full"><span data-i18n="message"></span><textarea name="message"></textarea></label>
    </div>
    <button class="btn" type="submit" data-i18n="submit"></button>
    <p class="section-text" data-i18n="form_note"></p>
    <div class="result" id="inquiry-result" aria-live="polite"></div>
  </form>
</div>`;

function transformMultilingualPreview(response) {
  return new HTMLRewriter().on("#contact .contact-grid", {
    element(element) { element.replace(MULTILINGUAL_INQUIRY_FORM, { html: true }); },
  }).transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/inquiries" && request.method === "POST") return createInquiry(request, env);
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "agro-zia-inquiry-api", d1_bound: Boolean(env.AGROZIA_DB), attachment_storage_bound: Boolean(env.AGROZIA_ATTACHMENTS) });
    }
    const assetResponse = env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    if ((url.pathname === "/multilingual-preview" || url.pathname === "/multilingual-preview.html") && request.method === "GET") return transformMultilingualPreview(assetResponse);
    return assetResponse;
  },
};
