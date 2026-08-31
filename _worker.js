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

  const createdAt = new Date().toISOString();

  if (!env.AGROZIA_DB) {
    return json({ ok: true, persisted: false, temporary: true, request_number: fallbackRequestNumber(), status: "email_fallback", created_at: createdAt }, 201);
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const requestNumber = await nextRequestNumber(env.AGROZIA_DB);
      await env.AGROZIA_DB.prepare(
        `INSERT INTO inquiries
          (request_number, created_at, language, product, company, specification,
           quantity, destination, timing, email, phone, message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received')`,
      )
        .bind(requestNumber, createdAt, language, product, company || null, specification || null, quantity || null, destination || null, timing || null, email || null, phone || null, message || null)
        .run();

      return json({ ok: true, persisted: true, request_number: requestNumber, status: "received", created_at: createdAt }, 201);
    } catch (error) {
      const messageText = String(error?.message || "").toLowerCase();
      if (messageText.includes("unique") && attempt < 5) continue;
      console.error("D1 inquiry persistence failed; continuing with temporary reference:", error);
      return json({ ok: true, persisted: false, temporary: true, request_number: fallbackRequestNumber(), status: "email_fallback", created_at: createdAt }, 201);
    }
  }

  return json({ ok: true, persisted: false, temporary: true, request_number: fallbackRequestNumber(), status: "email_fallback", created_at: createdAt }, 201);
}

const CORE_INQUIRY_FORM = `
<form id="agz-core-inquiry" class="agz-core-inquiry-form" novalidate>
  <div class="form-grid">
    <label><span data-agz-i18n="product"></span><input name="product" required maxlength="200"></label>
    <label><span data-agz-i18n="company"></span><input name="company" maxlength="200"></label>
    <label class="full"><span data-agz-i18n="specification"></span><input name="specification" maxlength="2000"></label>
    <label><span data-agz-i18n="quantity"></span><input name="quantity" maxlength="200"></label>
    <label><span data-agz-i18n="destination"></span><input name="destination" maxlength="200"></label>
    <label><span data-agz-i18n="timing"></span><input name="timing" maxlength="200"></label>
    <label><span data-agz-i18n="email"></span><input name="email" type="email" maxlength="320"></label>
    <label><span data-agz-i18n="phone"></span><input name="phone" maxlength="80"></label>
    <label class="full"><span data-agz-i18n="message"></span><textarea name="message" maxlength="4000"></textarea></label>
  </div>
  <button class="btn" type="submit" data-agz-i18n="submit"></button>
  <p class="section-text" data-agz-i18n="note"></p>
  <div class="agz-inquiry-result" id="agz-inquiry-result" aria-live="polite"></div>
</form>`;

const CORE_INQUIRY_SCRIPT = `<script>
(()=>{
const T={
 en:{product:'Product / category *',company:'Company',specification:'Required specification',quantity:'Quantity',destination:'Destination',timing:'Preferred timing',email:'Email',phone:'Phone / WhatsApp',message:'Additional requirements',submit:'Submit Inquiry',note:'Your request is persisted first and receives a server-generated reference. Email is only an optional follow-up.',sending:'Submitting inquiry...',success:'Inquiry submitted successfully',reference:'Request Reference',date:'Request Date & Time',received:'Your inquiry has been received. Please keep this reference number.',email_btn:'Open Email Draft',copy:'Copy Reference',error:'Unable to submit: '},
 ru:{product:'Товар / категория *',company:'Компания',specification:'Требуемая спецификация',quantity:'Количество',destination:'Место назначения',timing:'Желаемый срок',email:'Email',phone:'Телефон / WhatsApp',message:'Дополнительные требования',submit:'Отправить запрос',note:'Запрос сначала сохраняется на сервере и получает номер. Email является дополнительным шагом.',sending:'Отправка запроса...',success:'Запрос успешно отправлен',reference:'Номер заявки',date:'Дата и время заявки',received:'Ваш запрос получен. Сохраните этот номер.',email_btn:'Открыть Email',copy:'Копировать номер',error:'Не удалось отправить: '},
 fa:{product:'محصول / دسته *',company:'شرکت',specification:'مشخصات مورد نیاز',quantity:'مقدار',destination:'مقصد',timing:'زمان مورد نظر',email:'ایمیل',phone:'تلفن / واتساپ',message:'نیازهای تکمیلی',submit:'ارسال درخواست',note:'درخواست ابتدا در سرور ثبت و شماره پیگیری ایجاد می‌شود. ایمیل فقط مرحله‌ای اختیاری است.',sending:'در حال ثبت درخواست...',success:'درخواست با موفقیت ثبت شد',reference:'شماره پیگیری',date:'تاریخ و زمان درخواست',received:'درخواست شما دریافت شد. لطفاً این شماره را نگهداری کنید.',email_btn:'باز کردن پیش‌نویس ایمیل',copy:'کپی شماره',error:'ارسال درخواست انجام نشد: '},
 ar:{product:'المنتج / الفئة *',company:'الشركة',specification:'المواصفات المطلوبة',quantity:'الكمية',destination:'الوجهة',timing:'التوقيت المفضل',email:'البريد الإلكتروني',phone:'الهاتف / واتساب',message:'متطلبات إضافية',submit:'إرسال الاستفسار',note:'يتم حفظ الطلب أولاً على الخادم وإنشاء رقم مرجعي. البريد الإلكتروني خطوة اختيارية.',sending:'جارٍ تسجيل الاستفسار...',success:'تم إرسال الاستفسار بنجاح',reference:'رقم المرجع',date:'تاريخ ووقت الطلب',received:'تم استلام استفسارك. يرجى الاحتفاظ بهذا الرقم.',email_btn:'فتح مسودة البريد',copy:'نسخ الرقم',error:'تعذر إرسال الاستفسار: '},
 uz:{product:'Mahsulot / kategoriya *',company:'Kompaniya',specification:'Kerakli spetsifikatsiya',quantity:'Miqdor',destination:'Manzil',timing:'Istalgan muddat',email:'Email',phone:'Telefon / WhatsApp',message:'Qo‘shimcha talablar',submit:'So‘rovni yuborish',note:'So‘rov avval serverda saqlanadi va raqam oladi. Email faqat ixtiyoriy qadam.',sending:'So‘rov yuborilmoqda...',success:'So‘rov muvaffaqiyatli yuborildi',reference:'So‘rov raqami',date:'So‘rov sanasi va vaqti',received:'So‘rovingiz qabul qilindi. Ushbu raqamni saqlang.',email_btn:'Email qoralamasini ochish',copy:'Raqamni nusxalash',error:'So‘rov yuborilmadi: '},
 tr:{product:'Ürün / kategori *',company:'Şirket',specification:'Gerekli teknik özellik',quantity:'Miktar',destination:'Varış yeri',timing:'Tercih edilen zaman',email:'E-posta',phone:'Telefon / WhatsApp',message:'Ek gereksinimler',submit:'Talebi Gönder',note:'Talep önce sunucuda saklanır ve referans numarası oluşturulur. E-posta yalnızca isteğe bağlıdır.',sending:'Talep gönderiliyor...',success:'Talep başarıyla gönderildi',reference:'Talep Referansı',date:'Talep Tarihi ve Saati',received:'Talebiniz alındı. Bu numarayı saklayın.',email_btn:'E-posta Taslağını Aç',copy:'Referansı Kopyala',error:'Talep gönderilemedi: '}
};
const form=document.getElementById('agz-core-inquiry');if(!form)return;const result=document.getElementById('agz-inquiry-result');const lang=()=>{const x=new URLSearchParams(location.search).get('lang');return T[x]?x:'en'};const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));const fmt=v=>{const d=new Date(v);if(Number.isNaN(d.getTime()))return '';const l=lang();return new Intl.DateTimeFormat({fa:'fa-IR',ar:'ar',ru:'ru-RU',uz:'uz-UZ',tr:'tr-TR',en:'en-US'}[l],{dateStyle:'medium',timeStyle:'short',hour12:false}).format(d)};function render(){const l=lang();document.documentElement.lang=l;document.documentElement.dir=['fa','ar'].includes(l)?'rtl':'ltr';document.querySelectorAll('[data-agz-i18n]').forEach(e=>{const k=e.dataset.agzI18n;e.textContent=T[l][k]||''})}render();let busy=false;form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;const l=lang(),t=T[l],fd=new FormData(form),data={language:l,product:String(fd.get('product')||'').trim(),company:String(fd.get('company')||'').trim(),specification:String(fd.get('specification')||'').trim(),quantity:String(fd.get('quantity')||'').trim(),destination:String(fd.get('destination')||'').trim(),timing:String(fd.get('timing')||'').trim(),email:String(fd.get('email')||'').trim(),phone:String(fd.get('phone')||'').trim(),message:String(fd.get('message')||'').trim()};if(!data.product){result.textContent=t.error+'product_required';return}if(!data.email&&!data.phone){result.textContent=t.error+'contact_required';return}busy=true;form.querySelector('button[type=submit]').disabled=true;result.textContent=t.sending;try{const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},cache:'no-store',body:JSON.stringify(data)});const j=await r.json();if(!r.ok||j.ok!==true||!j.request_number)throw new Error(j.error||'request_failed');const ref=j.request_number,created=fmt(j.created_at),emailDate=fmt(j.created_at);const subject='Agro-Zia B2B Inquiry — '+data.product;const body=['Request Reference: '+ref,'Request Date & Time: '+emailDate,'Product / category: '+data.product,'Company: '+data.company,'Specification: '+data.specification,'Quantity: '+data.quantity,'Destination: '+data.destination,'Preferred timing: '+data.timing,'Email: '+data.email,'Phone / WhatsApp: '+data.phone,'Additional requirements: '+data.message].join('\\n');const mailto='mailto:export@agro-zia.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);result.innerHTML='<strong>'+esc(t.success)+'</strong><p>'+esc(t.reference)+': <span class="ref"><strong>'+esc(ref)+'</strong></span></p><p>'+esc(t.date)+': <span class="date">'+esc(created)+'</span></p><p>'+esc(t.received)+'</p><div class="actions"><button type="button" class="btn alt" id="agz-copy">'+esc(t.copy)+'</button><a class="btn" href="'+mailto+'">'+esc(t.email_btn)+'</a></div>';document.getElementById('agz-copy').onclick=async()=>{try{await navigator.clipboard.writeText(ref);document.getElementById('agz-copy').textContent='✓ '+t.copy}catch(_){}};form.querySelectorAll('input,textarea').forEach(x=>x.disabled=true);form.querySelector('button[type=submit]').style.display='none'}catch(err){result.textContent=t.error+(err.message||'request_failed');busy=false;form.querySelector('button[type=submit]').disabled=false}});window.addEventListener('popstate',render);
})();
</script>`;

async function renderMultilingualPreview(request, env) {
  const asset = await env.ASSETS.fetch(request);
  if (!asset.ok) return asset;
  let html = await asset.text();
  const contactStart = html.indexOf('<section class="soft" id="contact">');
  const contactEnd = contactStart >= 0 ? html.indexOf('</section>', contactStart) : -1;
  if (contactStart < 0 || contactEnd < 0) return new Response(html, asset);
  const contact = html.slice(contactStart, contactEnd + '</section>'.length);
  const formStart = contact.indexOf('<form');
  const formEnd = contact.indexOf('</form>', formStart);
  if (formStart < 0 || formEnd < 0) return new Response(html, asset);
  const replacement = contact.slice(0, formStart) + CORE_INQUIRY_FORM + contact.slice(formEnd + '</form>'.length);
  html = html.slice(0, contactStart) + replacement + html.slice(contactEnd + '</section>'.length);
  html = html.replace('</body>', CORE_INQUIRY_SCRIPT + '</body>');
  return new Response(html, { status: asset.status, headers: new Headers(asset.headers) });
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

    if ((url.pathname === "/multilingual-preview" || url.pathname === "/multilingual-preview/") && request.method === "GET" && env.ASSETS) {
      return renderMultilingualPreview(request, env);
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not Found", { status: 404 });
  },
};