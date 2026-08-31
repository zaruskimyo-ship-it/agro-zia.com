(() => {
  const form = document.querySelector('#contact form, form[action^="mailto:"]');
  if (!form) return;

  const T = {
    en: { product:'Product / category *', company:'Company', country:'Country', email:'Email', phone:'Phone / WhatsApp', interest:'Interest', spec:'Required specification', quantity:'Quantity', destination:'Destination', timing:'Preferred timing', message:'Additional requirements', attachment:'Supporting file (PDF/JPG, max 1 MB)', submit:'Submit Business Inquiry', whatsapp:'Continue on WhatsApp', sending:'Submitting inquiry...', success:'Inquiry submitted successfully', reference:'Request Reference', date:'Request Date & Time', received:'Your inquiry has been received. Please keep this reference number.', copy:'Copy Reference', email:'Open Email Draft', contactNote:'Email or Phone / WhatsApp is required.' },
    ru: { product:'Товар / категория *', company:'Компания', country:'Страна', email:'Email', phone:'Телефон / WhatsApp', interest:'Интерес', spec:'Требуемая спецификация', quantity:'Количество', destination:'Место назначения', timing:'Желаемый срок', message:'Дополнительные требования', attachment:'Файл (PDF/JPG, максимум 1 МБ)', submit:'Отправить бизнес-запрос', whatsapp:'Продолжить в WhatsApp', sending:'Отправка запроса...', success:'Запрос успешно отправлен', reference:'Номер заявки', date:'Дата и время заявки', received:'Ваш запрос получен. Сохраните этот номер.', copy:'Копировать номер', email:'Открыть Email', contactNote:'Требуется Email или Телефон / WhatsApp.' },
    fa: { product:'محصول / دسته *', company:'شرکت', country:'کشور', email:'ایمیل', phone:'تلفن / واتساپ', interest:'موضوع درخواست', spec:'مشخصات مورد نیاز', quantity:'مقدار', destination:'مقصد', timing:'زمان مورد نظر', message:'نیازهای تکمیلی', attachment:'فایل پیوست (PDF/JPG، حداکثر ۱ مگابایت)', submit:'ارسال درخواست تجاری', whatsapp:'ادامه در واتساپ', sending:'در حال ثبت درخواست...', success:'درخواست با موفقیت ثبت شد', reference:'شماره پیگیری', date:'تاریخ و زمان درخواست', received:'درخواست شما دریافت شد. لطفاً این شماره را نگهداری کنید.', copy:'کپی شماره', email:'باز کردن پیش‌نویس ایمیل', contactNote:'ایمیل یا تلفن / واتساپ الزامی است.' },
    ar: { product:'المنتج / الفئة *', company:'الشركة', country:'الدولة', email:'البريد الإلكتروني', phone:'الهاتف / واتساب', interest:'الاهتمام', spec:'المواصفات المطلوبة', quantity:'الكمية', destination:'الوجهة', timing:'التوقيت المفضل', message:'متطلبات إضافية', attachment:'ملف داعم (PDF/JPG، بحد أقصى 1 ميغابايت)', submit:'إرسال الاستفسار التجاري', whatsapp:'المتابعة عبر واتساب', sending:'جارٍ تسجيل الاستفسار...', success:'تم إرسال الاستفسار بنجاح', reference:'رقم المرجع', date:'تاريخ ووقت الطلب', received:'تم استلام استفسارك. يرجى الاحتفاظ بهذا الرقم.', copy:'نسخ الرقم', email:'فتح مسودة البريد', contactNote:'البريد الإلكتروني أو الهاتف / واتساب مطلوب.' },
    uz: { product:'Mahsulot / kategoriya *', company:'Kompaniya', country:'Mamlakat', email:'Email', phone:'Telefon / WhatsApp', interest:'Qiziqish', spec:'Kerakli spetsifikatsiya', quantity:'Miqdor', destination:'Manzil', timing:'Istalgan muddat', message:'Qo‘shimcha talablar', attachment:'Fayl (PDF/JPG, maksimal 1 MB)', submit:'Biznes so‘rovini yuborish', whatsapp:'WhatsApp orqali davom etish', sending:'So‘rov yuborilmoqda...', success:'So‘rov muvaffaqiyatli yuborildi', reference:'So‘rov raqami', date:'So‘rov sanasi va vaqti', received:'So‘rovingiz qabul qilindi. Ushbu raqamni saqlang.', copy:'Raqamni nusxalash', email:'Email qoralamasini ochish', contactNote:'Email yoki Telefon / WhatsApp talab qilinadi.' },
    tr: { product:'Ürün / kategori *', company:'Şirket', country:'Ülke', email:'E-posta', phone:'Telefon / WhatsApp', interest:'İlgi alanı', spec:'Gerekli teknik özellik', quantity:'Miktar', destination:'Varış yeri', timing:'Tercih edilen zaman', message:'Ek gereksinimler', attachment:'Destekleyici dosya (PDF/JPG, maks. 1 MB)', submit:'Ticari Talep Gönder', whatsapp:'WhatsApp ile devam et', sending:'Talep gönderiliyor...', success:'Talep başarıyla gönderildi', reference:'Talep Referansı', date:'Talep Tarihi ve Saati', received:'Talebiniz alındı. Bu numarayı saklayın.', copy:'Referansı Kopyala', email:'E-posta Taslağını Aç', contactNote:'E-posta veya Telefon / WhatsApp gereklidir.' }
  };
  const lang = new URLSearchParams(location.search).get('lang');
  const l = T[lang] ? lang : 'en';
  const t = T[l];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fields = [
    ['product','product','text',true],['company','company','text',false],['country','country','text',false],['email','email','email',false],['phone','phone','text',false],['interest','interest','select',false],
    ['specification','spec','text',false],['quantity','quantity','text',false],['destination','destination','text',false],['timing','timing','text',false],['message','message','textarea',false]
  ];
  form.action = '';
  form.method = '';
  form.enctype = '';
  form.innerHTML = `<div class="form-grid">${fields.map(([name,key,type,required]) => {
    const label = `<span>${esc(t[key])}</span>`;
    if (type === 'select') return `<label><span>${esc(t[key])}</span><select name="${name}" id="inq-${name}"><option value="Product">Product</option><option value="Engineering">Engineering</option><option value="Project">Project</option><option value="Trade">Trade</option></select></label>`;
    if (type === 'textarea') return `<label class="full">${label}<textarea name="${name}" id="inq-${name}"></textarea></label>`;
    return `<label>${label}<input ${required?'required':''} type="${type}" name="${name}" id="inq-${name}"></label>`;
  }).join('')}</div>
  <label class="full" style="display:block;margin-top:14px"><span>${esc(t.attachment)}</span><input id="inq-attachment" type="file" accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg" style="display:block;width:100%;margin-top:6px;padding:10px;border:1px dashed #8fb5a0;border-radius:8px;background:#f8fbf9"></label>
  <p class="section-text" style="font-size:12px;margin:8px 0 0">${esc(t.contactNote)}</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="btn inq-primary" id="inq-submit" type="submit">${esc(t.submit)}</button><a class="btn" href="https://wa.me/message/C2C4CHM4DXFNO1" target="_blank" rel="noopener noreferrer">${esc(t.whatsapp)}</a></div>
  <p id="inq-note" class="section-text" style="font-size:12px;margin-top:12px">${esc(l==='fa'?'شماره پیگیری در سمت سرور و در پایگاه داده ثبت می‌شود.':l==='ru'?'Номер заявки создаётся и сохраняется на сервере.':l==='ar'?'يتم إنشاء رقم المرجع وحفظه على الخادم.':l==='tr'?'Talep referansı sunucuda oluşturulur ve kaydedilir.':l==='uz'?'So‘rov raqami serverda yaratiladi va saqlanadi.':'Your Request Reference is generated and stored server-side.' )}</p><div id="inq-result" aria-live="polite" style="display:none;margin-top:16px;padding:18px;border:1px solid #dce8e0;border-radius:12px;background:#edf5ef"></div>`;
  const style=document.createElement('style');style.textContent='.inq-primary{box-shadow:0 6px 18px rgba(20,91,59,.22);font-weight:900;transform:translateY(-1px)}.inq-primary:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(20,91,59,.28)}#inq-attachment:focus{outline:2px solid #1d7a50;outline-offset:2px}';document.head.appendChild(style);

  const value = id => document.getElementById('inq-' + id)?.value.trim() || '';
  const button = document.getElementById('inq-submit');
  const result = document.getElementById('inq-result');
  const attachmentInput = document.getElementById('inq-attachment');
  let busy = false;
  const fileToBase64 = file => new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||'').split(',')[1]||'');r.onerror=reject;r.readAsDataURL(file)});
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const data = { language:l, product:value('product'), company:value('company'), specification:value('specification'), quantity:value('quantity'), destination:value('destination'), timing:value('timing'), email:value('email'), phone:value('phone'), message:value('message') };
    if (!data.product) { result.style.display='block'; result.textContent='Please complete the required product/category field.'; return; }
    if (!data.email && !data.phone) { result.style.display='block'; result.textContent=t.contactNote; return; }
    const file=attachmentInput?.files?.[0];
    if(file){if(file.size>1048576){result.style.display='block';result.textContent='Attachment must be 1 MB or smaller.';return}const ok=['application/pdf','image/jpeg'].includes(file.type)||/\.(pdf|jpe?g)$/i.test(file.name);if(!ok){result.style.display='block';result.textContent='Only PDF or JPG files are accepted.';return}try{data.attachment={name:file.name,type:file.type||(/\.pdf$/i.test(file.name)?'application/pdf':'image/jpeg'),size:file.size,data_base64:await fileToBase64(file)}}catch(_){result.style.display='block';result.textContent='Unable to read the attachment.';return}}
    busy=true; button.disabled=true; result.style.display='block'; result.textContent=t.sending;
    try {
      const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},cache:'no-store',body:JSON.stringify(data)});
      const j=await r.json(); if(!r.ok||j.ok!==true||!j.request_number) throw new Error(j.error||'request_failed');
      const d=new Date(j.created_at); const locale={fa:'fa-IR',ar:'ar',ru:'ru-RU',uz:'uz-UZ',tr:'tr-TR',en:'en-US'}[l]||'en-US'; const displayDate=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',hour12:false}).format(d); const emailDate=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',hour12:false}).format(d);
      const body=[`Request Reference: ${j.request_number}`,`Request Date & Time: ${emailDate}`,`Product / category: ${data.product}`,`Company: ${data.company}`,`Specification: ${data.specification}`,`Quantity: ${data.quantity}`,`Destination: ${data.destination}`,`Preferred timing: ${data.timing}`,`Email: ${data.email}`,`Phone / WhatsApp: ${data.phone}`,`Additional requirements: ${data.message}`,`Attachment received: ${j.attachment_received?'Yes':'No'}`].join('\n');
      const mailto=`mailto:export@agro-zia.com?subject=${encodeURIComponent('Agro-Zia B2B Inquiry — '+data.product)}&body=${encodeURIComponent(body)}`;
      result.innerHTML=`<strong>${esc(t.success)}</strong><p>${esc(t.reference)}: <strong>${esc(j.request_number)}</strong></p><p>${esc(t.date)}: <strong>${esc(displayDate)}</strong></p><p>${esc(t.received)}</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn" id="inq-copy">${esc(t.copy)}</button><a class="btn" href="${mailto}">${esc(t.email)}</a></div>`;
      document.getElementById('inq-copy').onclick=async()=>{try{await navigator.clipboard.writeText(j.request_number);document.getElementById('inq-copy').textContent='✓ '+t.copy}catch(_){}};
      form.querySelectorAll('input,select,textarea').forEach(x=>x.disabled=true); button.style.display='none';
    } catch(err) { result.textContent='Unable to submit: '+(err.message||'request_failed'); busy=false; button.disabled=false; }
  }, {once:false});
})();