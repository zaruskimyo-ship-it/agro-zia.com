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
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const ALLOWED_ATTACHMENT_EXTENSIONS = /\.(pdf|doc|docx|txt|jpe?g|png|webp)$/i;
const INQUIRY_EMAIL_TO = "agrozia1@gmail.com";
const INQUIRY_EMAIL_FROM = "export@agro-zia.com";

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
  return Boolean(file && ALLOWED_ATTACHMENT_EXTENSIONS.test(file.name || "") && (ALLOWED_ATTACHMENT_TYPES.has(file.type) || !file.type));
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
    attachment ? `Attachment: ${attachment.name} (${attachment.type || "unknown"}, ${attachment.size} bytes) — sent separately via Telegram.` : "Attachment: none",
  ].join("\n");
}

function safeEmailErrorCode(error) {
  const code = typeof error?.code === "string" ? error.code : "";
  return /^[A-Z0-9_]{3,80}$/.test(code) ? code : "EMAIL_SEND_ERROR";
}

async function sendInquiryEmail(env, data) {
  if (!env.EMAIL) return { status: "unconfigured" };

  const text = inquiryEmailText(data);
  const subject = `Agro-Zia Business Inquiry ${data.requestNumber}`;
  const result = await env.EMAIL.send({
    to: INQUIRY_EMAIL_TO,
    from: INQUIRY_EMAIL_FROM,
    subject,
    text,
    replyTo: data.email || undefined,
  });

  return { status: "sent", message_id: result?.messageId || null };
}

function inquiryTelegramText({ requestNumber, createdAt, language, product, company, specification, quantity, destination, timing, email, phone, message, attachment }) {
  return [
    "AGRO-ZIA BUSINESS INQUIRY",
    "",
    `Reference: ${requestNumber}`,
    `Date: ${createdAt}`,
    `Language: ${language}`,
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
    attachment ? `Attachment saved: ${attachment.name} (${attachment.type || "unknown"}, ${attachment.size} bytes)` : "Attachment: none",
  ].join("\n");
}

function telegramText(value, maximumLength) {
  const text = String(value || "");
  return text.length <= maximumLength ? text : `${text.slice(0, Math.max(0, maximumLength - 1))}…`;
}

async function sendInquiryTelegram(env, data) {
  if (!env.TELEGRAM_BOT_TOKEN_V2 || !env.TELEGRAM_CHAT_ID_V2) return { status: "unconfigured" };

  const apiBase = "https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN_V2;
  const hasAttachment = Boolean(data.attachmentKey);
  console.log("Telegram notification started", { has_attachment: hasAttachment });

  let operation = "sendMessage";
  let response;

  if (hasAttachment) {
    operation = "sendDocument";
    console.log("Telegram attachment load started");

    const attachmentObject = await env.AGROZIA_ATTACHMENTS.get(data.attachmentKey);
    if (!attachmentObject) {
      console.error("Telegram attachment load failed", { reason: "not_found" });
      return { status: "failed" };
    }

    const attachmentType = data.attachmentType || attachmentObject.httpMetadata?.contentType || "application/octet-stream";
    const attachmentName = data.attachmentName || "attachment";
    const attachmentBuffer = await attachmentObject.arrayBuffer();
    console.log("Telegram attachment loaded", { size: attachmentBuffer.byteLength, content_type: attachmentType });

    const form = new FormData();
    form.append("chat_id", env.TELEGRAM_CHAT_ID_V2);
    form.append("caption", telegramText(inquiryTelegramText(data), 1000));
    form.append("document", new Blob([attachmentBuffer], { type: attachmentType }), attachmentName);
    console.log("Telegram document prepared", { size: attachmentBuffer.byteLength, content_type: attachmentType });
    console.log("Telegram API request prepared", { operation });

    response = await fetch(apiBase + "/sendDocument", { method: "POST", body: form });
  } else {
    console.log("Telegram API request prepared", { operation });
    response = await fetch(apiBase + "/sendMessage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID_V2,
        text: telegramText(inquiryTelegramText(data), 4000),
        disable_web_page_preview: true,
      }),
    });
  }

  const result = await response.json().catch(() => null);
  console.log("Telegram API response received", {
    operation,
    status: response.status,
    ok: Boolean(result?.ok),
    error_code: result?.error_code || null,
  });

  return response.ok && result?.ok ? { status: "sent" } : { status: "failed" };
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

      let emailNotification = { status: "unconfigured" };
      let emailNotificationError = null;
      try {
        emailNotification = await sendInquiryEmail(env, {
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
        });
      } catch (emailError) {
        emailNotificationError = safeEmailErrorCode(emailError);
        console.error("Inquiry email notification failed", {
          code: emailNotificationError,
          name: String(emailError?.name || "Error").slice(0, 40),
        });
        emailNotification = { status: "failed" };
      }

      let telegramNotification = { status: "unconfigured" };
      try {
        telegramNotification = await sendInquiryTelegram(env, {
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
        });
      } catch (_) {
        console.error("Inquiry Telegram notification failed", { reason: "request_error" });
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
        email_notification_error: emailNotificationError,
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
      return json({ ok: true, service: "agro-zia-inquiry-api", d1_bound: Boolean(env.AGROZIA_DB), attachment_storage_bound: Boolean(env.AGROZIA_ATTACHMENTS), email_bound: Boolean(env.EMAIL) });
    }
    const assetResponse = env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    if ((url.pathname === "/multilingual-preview" || url.pathname === "/multilingual-preview.html") && request.method === "GET") return transformMultilingualPreview(assetResponse);
    return assetResponse;
  },
};