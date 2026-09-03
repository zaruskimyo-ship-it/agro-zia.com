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
const INQUIRY_EMAIL_TO = "export@agro-zia.com";
const INQUIRY_EMAIL_FROM = "export@agro-zia.com";
const TELEGRAM_API_BASE = "https://api.telegram.org";

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

function inquiryEmailText({ requestNumber, createdAt, language, product, company, specification, quantity, destination, timing, email, phone, message, attachment }) {
  return [
    "AGRO-ZIA BUSINESS INQUIRY",
    "",
    `Request Reference: ${requestNumber}`,
    `Request Date & Time: ${createdAt}`,
    `Language: ${language}`,
    "",
    `Company: ${company || ""}`,
    `Country: ${destination || ""}`,
    `Product / Interest: ${product || ""}`,
    `Required specification: ${specification || ""}`,
    `Quantity: ${quantity || ""}`,
    `Preferred timing: ${timing || ""}`,
    `Email: ${email || ""}`,
    `Phone: ${phone || ""}`,
    "",
    message || "",
    "",
    attachment ? `Attachment: ${attachment.name} (${attachment.type || "unknown"}, ${attachment.size} bytes)` : "Attachment: none",
  ].join("\n");
}

async function sendInquiryEmail(env, data) {
  if (!env.EMAIL) return { status: "unconfigured" };

  const attachments = [];
  if (data.attachmentKey) {
    const object = await env.AGROZIA_ATTACHMENTS.get(data.attachmentKey);
    if (!object) throw new Error("attachment_not_found_after_persistence");
    attachments.push({
      content: await object.arrayBuffer(),
      filename: data.attachmentName,
      type: data.attachmentType || "application/octet-stream",
      disposition: "attachment",
    });
  }

  const text = inquiryEmailText(data);
  const subject = `Agro-Zia Business Inquiry ${data.requestNumber}`;
  const result = await env.EMAIL.send({
    to: INQUIRY_EMAIL_TO,
    from: INQUIRY_EMAIL_FROM,
    replyTo: data.email || undefined,
    subject,
    text,
    attachments,
  });

  return { status: "sent", message_id: result?.messageId || null };
}

function telegramCaption(data) {
  return [
    "AGRO-ZIA BUSINESS INQUIRY",
    `Reference: ${data.requestNumber}`,
    `Date: ${data.createdAt}`,
    `Company: ${data.company || "-"}`,
    `Country: ${data.destination || "-"}`,
    `Product / Interest: ${data.product || "-"}`,
    `Specification: ${data.specification || "-"}`,
    `Quantity: ${data.quantity || "-"}`,
    `Timing: ${data.timing || "-"}`,
    `Email: ${data.email || "-"}`,
    `Phone: ${data.phone || "-"}`,
    data.message ? `Message: ${data.message}` : "Message: -",
  ].join("\n").slice(0, 1024);
}

async function telegramRequest(env, method, formData, context = {}) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { status: "unconfigured" };

  let response;
  let payload = {};
  try {
    response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
      method: "POST",
      body: formData,
    });
    payload = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("Telegram API network failure", {
      request_reference: context.requestNumber || null,
      method,
      error_name: error?.name || "Error",
      error_message: String(error?.message || "fetch_failed").slice(0, 300),
    });
    throw error;
  }

  if (!response.ok || !payload.ok) {
    const diagnostic = {
      status: "failed",
      http_status: response.status,
      telegram_ok: Boolean(payload.ok),
      telegram_error_code: payload.error_code ?? null,
      telegram_description: String(payload.description || "unknown_telegram_error").slice(0, 500),
    };
    console.error("Telegram API rejected inquiry notification", {
      request_reference: context.requestNumber || null,
      method,
      ...diagnostic,
      attachment_present: Boolean(context.attachmentPresent),
      attachment_size: context.attachmentSize || 0,
    });
    const error = new Error(`telegram_${method}_failed`);
    error.telegram = diagnostic;
    throw error;
  }
  return { status: "sent", message_id: payload.result?.message_id || null };
}

async function sendInquiryTelegram(env, data) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { status: "unconfigured" };

  const context = {
    requestNumber: data.requestNumber,
    attachmentPresent: Boolean(data.attachmentKey),
    attachmentSize: data.attachment?.size || 0,
  };

  if (data.attachmentKey) {
    const object = await env.AGROZIA_ATTACHMENTS.get(data.attachmentKey);
    if (!object) throw new Error("attachment_not_found_after_persistence");
    const bytes = await object.arrayBuffer();
    const form = new FormData();
    form.append("chat_id", String(env.TELEGRAM_CHAT_ID));
    form.append("caption", telegramCaption(data));
    form.append("document", new Blob([bytes], { type: data.attachmentType || "application/octet-stream" }), data.attachmentName || "attachment");
    return telegramRequest(env, "sendDocument", form, context);
  }

  const form = new FormData();
  form.append("chat_id", String(env.TELEGRAM_CHAT_ID));
  form.append("text", telegramCaption(data));
  return telegramRequest(env, "sendMessage", form, context);
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

      const notificationData = {
        requestNumber,
        createdAt,
        language,
        product,
        company,
        specification,
        quantity,
        destination,
        timing,
        email,
        phone,
        message,
        attachmentKey,
        attachmentName: attachment?.name || null,
        attachmentType: attachment?.type || null,
        attachment: attachment ? { name: attachment.name, type: attachment.type, size: attachment.size } : null,
      };

      let emailNotification = { status: "unconfigured" };
      try {
        emailNotification = await sendInquiryEmail(env, notificationData);
      } catch (emailError) {
        console.error("Inquiry email notification failed:", emailError);
        emailNotification = { status: "failed" };
      }

      let telegramNotification = { status: "unconfigured" };
      try {
        telegramNotification = await sendInquiryTelegram(env, notificationData);
      } catch (telegramError) {
        console.error("Inquiry Telegram notification failed:", {
          request_reference: requestNumber,
          error_name: telegramError?.name || "Error",
          error_message: String(telegramError?.message || "telegram_notification_failed").slice(0, 300),
          telegram: telegramError?.telegram || null,
        });
        telegramNotification = { status: "failed" };
      }

      return json({
        ok: true,
        persisted: true,
        request_number: requestNumber,
        status: "received",
        created_at: createdAt,
        attachment: attachment ? { name: attachment.name, type: attachment.type, size: attachment.size } : null,
        email_notification: emailNotification.status,
        telegram_notification: telegramNotification.status,
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
      return json({
        ok: true,
        service: "agro-zia-inquiry-api",
        d1_bound: Boolean(env.AGROZIA_DB),
        attachment_storage_bound: Boolean(env.AGROZIA_ATTACHMENTS),
        email_bound: Boolean(env.EMAIL),
        telegram_configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
      });
    }
    const assetResponse = env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    if ((url.pathname === "/multilingual-preview" || url.pathname === "/multilingual-preview.html") && request.method === "GET") return transformMultilingualPreview(assetResponse);
    return assetResponse;
  },
};
