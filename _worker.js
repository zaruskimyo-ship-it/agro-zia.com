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

const MULTILINGUAL_INQUIRY_SCRIPT = `<script>
(() => {
  const copy = {
    en: {contact_title:'Business Inquiry',contact_text:'Tell us what you need and our team will review your request.',form_note:'Your Request Reference is generated server-side and the inquiry is persisted in D1 before any email draft is opened.',name:'Name',company:'Company',country:'Country',email:'Email',phone:'WhatsApp / Phone',interest:'Interest',specification_label:'Required specification',quantity_label:'Quantity',timing_label:'Preferred timing',message:'Additional requirements',submit:'Submit Business Inquiry',note:'Your Request Reference is generated server-side and the inquiry is persisted in D1 before any email draft is opened.',sending:'Submitting inquiry...',success:'Inquiry submitted successfully',reference:'Request Reference',date:'Request Date & Time',received:'Your inquiry has been received. Please keep this reference number.',email_btn:'Open Email Draft',copy:'Copy Reference',error:'Unable to submit: ',required:'Please provide a product/category and at least an email or phone number.'},
    ru: {contact_title:'Бизнес-запрос',contact_text:'Сообщите нам, что вам необходимо, и наша команда рассмотрит ваш запрос.',form_note:'Номер заявки создаётся сервером и сохраняется в D1 до открытия черновика Email.',name:'Имя',company:'Компания',country:'Страна',email:'Email',phone:'WhatsApp / Телефон',interest:'Интерес',specification_label:'Требуемая спецификация',quantity_label:'Количество',timing_label:'Желаемый срок',message:'Дополнительные требования',submit:'Отправить бизнес-запрос',note:'Номер заявки создаётся сервером и сохраняется в D1 до открытия черновика Email.',sending:'Отправка запроса...',success:'Запрос успешно отправлен',reference:'Номер заявки',date:'Дата и время заявки',received:'Ваш запрос получен. Сохраните этот номер.',email_btn:'Открыть Email',copy:'Копировать номер',error:'Не удалось отправить: ',required:'Укажите продукт/категорию и хотя бы Email или телефон.'},
    fa: {contact_title:'درخواست تجاری',contact_text:'نیاز خود را برای ما ارسال کنید تا تیم ما درخواست شما را بررسی کند.',form_note:'شماره پیگیری توسط سرور ایجاد و درخواست در D1 ثبت می‌شود؛ سپس امکان بازکردن پیش‌نویس ایمیل ارائه می‌شود.',name:'نام',company:'شرکت',country:'کشور',email:'ایمیل',phone:'واتساپ / تلفن',interest:'نوع درخواست',specification_label:'مشخصات مورد نیاز',quantity_label:'مقدار',timing_label:'زمان مورد نظر',message:'نیازهای تکمیلی',submit:'ارسال درخواست تجاری',note:'شماره پیگیری توسط سرور ایجاد و درخواست در D1 ثبت می‌شود؛ سپس امکان بازکردن پیش‌نویس ایمیل ارائه می‌شود.',sending:'در حال ثبت درخواست...',success:'درخواست با موفقیت ثبت شد',reference:'شماره پیگیری',date:'تاریخ و زمان درخواست',received:'درخواست شما دریافت شد. لطفاً این شماره را نگهداری کنید.',email_btn:'باز کردن پیش‌نویس ایمیل',copy:'کپی شماره',error:'ارسال درخواست انجام نشد: ',required:'محصول/دسته و حداقل ایمیل یا شماره تلفن را وارد کنید.'},
    ar: {contact_title:'استفسار تجاري',contact_text:'أخبرنا بما تحتاجه وسيراجع فريقنا طلبك.',form_note:'يتم إنشاء رقم المرجع وحفظ الطلب في D1 قبل فتح مسودة البريد الإلكتروني.',name:'الاسم',company:'الشركة',country:'الدولة',email:'البريد الإلكتروني',phone:'الهاتف / واتساب',interest:'نوع الطلب',specification_label:'المواصفات المطلوبة',quantity_label:'الكمية',timing_label:'التوقيت المفضل',message:'متطلبات إضافية',submit:'إرسال الاستفسار',note:'يتم إنشاء رقم المرجع وحفظ الطلب في D1 قبل فتح مسودة البريد الإلكتروني.',sending:'جارٍ تسجيل الاستفسار...',success:'تم إرسال الاستفسار بنجاح',reference:'رقم المرجع',date:'تاريخ ووقت الطلب',received:'تم استلام طلبك. يرجى الاحتفاظ بهذا الرقم.',email_btn:'فتح مسودة البريد',copy:'نسخ الرقم',error:'تعذر إرسال الاستفسار: ',required:'يرجى إدخال المنتج/الفئة والبريد الإلكتروني أو الهاتف على الأقل.'},
    uz: {contact_title:'Biznes so‘rovi',contact_text:'Sizga nima kerakligini yuboring, jamoamiz so‘rovingizni ko‘rib chiqadi.',form_note:'So‘rov raqami serverda yaratiladi va email qoralamasi ochilishidan oldin D1 bazasiga saqlanadi.',name:'Ism',company:'Kompaniya',country:'Mamlakat',email:'Email',phone:'WhatsApp / Telefon',interest:'Qiziqish',specification_label:'Kerakli spetsifikatsiya',quantity_label:'Miqdor',timing_label:'Istalgan muddat',message:'Qo‘shimcha talablar',submit:'Biznes so‘rovini yuborish',note:'So‘rov raqami serverda yaratiladi va email qoralamasi ochilishidan oldin D1 bazasiga saqlanadi.',sending:'So‘rov yuborilmoqda...',success:'So‘rov muvaffaqiyatli yuborildi',reference:'So‘rov raqami',date:'So‘rov sanasi va vaqti',received:'So‘rovingiz qabul qilindi. Ushbu raqamni saqlang.',email_btn:'Email qoralamasini ochish',copy:'Raqamni nusxalash',error:'So‘rov yuborilmadi: ',required:'Mahsulot/kategoriya va kamida email yoki telefon raqamini kiriting.'},
    tr: {contact_title:'İş Talebi',contact_text:'İhtiyacınızı bize iletin, ekibimiz talebinizi inceleyecektir.',form_note:'Talep referansı sunucuda oluşturulur ve e-posta taslağı açılmadan önce D1 veritabanına kaydedilir.',name:'Ad',company:'Şirket',country:'Ülke',email:'E-posta',phone:'WhatsApp / Telefon',interest:'İlgi',specification_label:'Gerekli teknik özellik',quantity_label:'Miktar',timing_label:'Tercih edilen zaman',message:'Ek gereksinimler',submit:'İş Talebi Gönder',note:'Talep referansı sunucuda oluşturulur ve e-posta taslağı açılmadan önce D1 veritabanına kaydedilir.',sending:'Talep gönderiliyor...',success:'Talep başarıyla gönderildi',reference:'Talep Referansı',date:'Talep Tarihi ve Saati',received:'Talebiniz alındı. Bu numarayı saklayın.',email_btn:'E-posta Taslağını Aç',copy:'Referansı Kopyala',error:'Talep gönderilemedi: ',required:'Ürün/kategori ve en az e-posta veya telefon bilgisi girin.'}
  };
  const errorMap = {product_required:'product/category is required',contact_required:'contact information is required',invalid_email:'invalid email address',field_too_long:'one of the fields exceeds the allowed length',d1_unavailable:'database is unavailable',d1_persistence_failed:'the inquiry could not be persisted'};
  const active = window.AgroZiaActiveLanguage || new URLSearchParams(location.search).get('lang') || 'en';
  const t = copy[active] || copy.en;
  const form = document.getElementById('canonical-inquiry-form');
  const result = document.getElementById('inquiry-result');
  if (!form || !result) return;
  form.querySelectorAll('[data-i18n]').forEach((el) => { const key = el.dataset.i18n; if (t[key]) el.textContent = t[key]; });
  const setResult = (html, error = false) => { result.className = error ? 'result show error' : 'result show'; result.innerHTML = html; };
  const formatDate = (value) => { const d = new Date(value); return new Intl.DateTimeFormat(active === 'fa' ? 'fa-IR' : active === 'ar' ? 'ar' : active === 'tr' ? 'tr-TR' : active === 'ru' ? 'ru-RU' : active === 'uz' ? 'uz-UZ' : 'en-US', {dateStyle:'medium',timeStyle:'short'}).format(d); };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = t.sending;
    const data = new FormData(form);
    const payload = {
      language: active,
      product: String(data.get('product') || '').trim(),
      company: String(data.get('company') || '').trim(),
      specification: String(data.get('specification') || '').trim(),
      quantity: String(data.get('quantity') || '').trim(),
      destination: String(data.get('destination') || '').trim(),
      timing: String(data.get('timing') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      message: [String(data.get('company_contact_name') || '').trim() ? 'Contact name: ' + String(data.get('company_contact_name')).trim() : '', String(data.get('message') || '').trim()].filter(Boolean).join('\n')
    };
    try {
      const response = await fetch('/api/inquiries', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok || !body.persisted) throw new Error(body.error || 'submission_failed');
      const ref = body.request_number;
      const date = formatDate(body.created_at);
      const emailBody = [
        'Request Reference: ' + ref,
        'Request Date & Time: ' + body.created_at,
        'Product / category: ' + payload.product,
        'Company: ' + payload.company,
        'Specification: ' + payload.specification,
        'Quantity: ' + payload.quantity,
        'Destination: ' + payload.destination,
        'Preferred timing: ' + payload.timing,
        'Email: ' + payload.email,
        'Phone / WhatsApp: ' + payload.phone,
        'Additional requirements: ' + payload.message
      ].join('\n');
      const mailto = 'mailto:export@agro-zia.com?subject=' + encodeURIComponent('Agro-Zia B2B Inquiry — ' + payload.product) + '&body=' + encodeURIComponent(emailBody);
      setResult('<strong>' + t.success + '</strong><p><strong>' + t.reference + ':</strong><br><span class="ref">' + ref + '</span></p><p><strong>' + t.date + ':</strong><br><span class="date">' + date + '</span></p><p>' + t.received + '</p><div class="actions"><button class="btn alt" type="button" id="copy-inquiry-ref">' + t.copy + '</button><a class="btn" href="' + mailto + '">' + t.email_btn + '</a></div>');
      document.getElementById('copy-inquiry-ref')?.addEventListener('click', async () => { await navigator.clipboard?.writeText(ref); });
    } catch (error) {
      const message = errorMap[error.message] || error.message || 'submission_failed';
      setResult('<strong>' + t.error + message + '</strong>', true);
    } finally {
      button.disabled = false;
      button.textContent = t.submit;
    }
  });
})();
</script>`;

function transformMultilingualPreview(response) {
  return new HTMLRewriter()
    .on("#contact .contact-grid", {
      element(element) {
        element.replace(MULTILINGUAL_INQUIRY_FORM, { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append(MULTILINGUAL_INQUIRY_SCRIPT, { html: true });
      },
    })
    .transform(response);
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

    const assetResponse = env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    if ((url.pathname === "/multilingual-preview" || url.pathname === "/multilingual-preview.html") && request.method === "GET") {
      return transformMultilingualPreview(assetResponse);
    }

    return assetResponse;
  },
};