/* Agro-Zia Stage 1 inquiry root fix: use the canonical Worker form contract. */
(() => {
  const copy = {
    en: { sending:'Submitting inquiry…', success:'Inquiry submitted successfully', reference:'Request Reference', date:'Request Date & Time', received:'Your inquiry has been received. Please keep this reference number.', emailSent:'Notification email sent to Agro-Zia.', emailFailed:'Inquiry saved, but notification email could not be sent.', emailErrorCode:'Email service diagnostic code', copy:'Copy Reference', error:'Unable to submit: ', required:'Please provide a product/category and at least an email or phone number.' },
    ru: { sending:'Отправка запроса…', success:'Запрос успешно отправлен', reference:'Номер заявки', date:'Дата и время заявки', received:'Ваш запрос получен. Сохраните этот номер.', emailSent:'Уведомление отправлено в Agro-Zia.', emailFailed:'Запрос сохранён, но уведомление по электронной почте не отправлено.', emailErrorCode:'Диагностический код Email', copy:'Копировать номер', error:'Не удалось отправить: ', required:'Укажите продукт/категорию и Email или телефон.' },
    fa: { sending:'در حال ثبت درخواست…', success:'درخواست با موفقیت ثبت شد', reference:'شماره پیگیری', date:'تاریخ و زمان درخواست', received:'درخواست شما دریافت شد. لطفاً این شماره را نگهداری کنید.', emailSent:'ایمیل اطلاع‌رسانی برای Agro-Zia ارسال شد.', emailFailed:'درخواست ثبت شد، اما ایمیل اطلاع‌رسانی ارسال نشد.', emailErrorCode:'کد تشخیصی سرویس ایمیل', copy:'کپی شماره', error:'ثبت درخواست انجام نشد: ', required:'محصول/دسته و حداقل ایمیل یا شماره تلفن را وارد کنید.' },
    ar: { sending:'جارٍ إرسال الطلب…', success:'تم إرسال الطلب بنجاح', reference:'رقم المرجع', date:'تاريخ ووقت الطلب', received:'تم استلام طلبك. يرجى الاحتفاظ بهذا الرقم.', emailSent:'تم إرسال إشعار إلى Agro-Zia.', emailFailed:'تم حفظ الطلب، ولكن تعذر إرسال إشعار البريد الإلكتروني.', emailErrorCode:'رمز تشخيص البريد الإلكتروني', copy:'نسخ الرقم', error:'تعذر إرسال الطلب: ', required:'يرجى إدخال المنتج/الفئة والبريد الإلكتروني أو الهاتف.' },
    uz: { sending:'So‘rov yuborilmoqda…', success:'So‘rov muvaffaqiyatli yuborildi', reference:'So‘rov raqami', date:'So‘rov sanasi va vaqti', received:'So‘rovingiz qabul qilindi. Ushbu raqamni saqlang.', emailSent:'Bildirishnoma Agro-Zia ga yuborildi.', emailFailed:'So‘rov saqlandi, ammo email bildirishnomasi yuborilmadi.', emailErrorCode:'Email diagnostika kodi', copy:'Raqamni nusxalash', error:'So‘rov yuborilmadi: ', required:'Mahsulot/kategoriya va email yoki telefon kiriting.' },
    tr: { sending:'Talep gönderiliyor…', success:'Talep başarıyla gönderildi', reference:'Talep Referansı', date:'Talep Tarihi ve Saati', received:'Talebiniz alındı. Bu numarayı saklayın.', emailSent:'Bildirim e-postası Agro-Zia’ya gönderildi.', emailFailed:'Talep kaydedildi, ancak bildirim e-postası gönderilemedi.', emailErrorCode:'E-posta tanılama kodu', copy:'Referansı Kopyala', error:'Talep gönderilemedi: ', required:'Ürün/kategori ve e-posta veya telefon girin.' }
  };

  const getLanguage = () => window.AgroZiaActiveLanguage || new URLSearchParams(location.search).get('lang') || 'en';
  const getValue = (form, names) => {
    for (const name of names) {
      const field = form.elements.namedItem(name);
      if (field && String(field.value || '').trim()) return String(field.value).trim();
    }
    return '';
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  function install() {
    const form = document.getElementById('canonical-inquiry-form');
    if (!form || form.dataset.stage1RootFixed === 'true') return Boolean(form);

    const replacement = form.cloneNode(true);
    replacement.dataset.stage1RootFixed = 'true';
    form.replaceWith(replacement);

    const active = getLanguage();
    const t = copy[active] || copy.en;
    const result = replacement.querySelector('#inquiry-result, [data-agrozia-inquiry-result]');
    const button = replacement.querySelector('button[type="submit"]');
    if (!result || !button) return true;

    const setResult = (message, error = false) => {
      result.className = error ? 'result show error' : 'result show';
      result.textContent = message;
    };

    replacement.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = t.sending;
      result.className = 'result';
      result.textContent = '';

      const data = new FormData(replacement);
      const payload = {
        language: active,
        product: getValue(replacement, ['product', 'interest']),
        company: getValue(replacement, ['company']),
        specification: getValue(replacement, ['specification']),
        quantity: getValue(replacement, ['quantity']),
        destination: getValue(replacement, ['destination', 'country']),
        timing: getValue(replacement, ['timing']),
        email: getValue(replacement, ['email']),
        phone: getValue(replacement, ['phone']),
        message: [
          getValue(replacement, ['company_contact_name', 'name']) ? `Contact name: ${getValue(replacement, ['company_contact_name', 'name'])}` : '',
          getValue(replacement, ['message'])
        ].filter(Boolean).join('\n')
      };
      const attachment = data.get('attachment');

      if (!payload.product || (!payload.email && !payload.phone)) {
        setResult(t.required, true);
        button.disabled = false;
        button.textContent = (window.AgroZiaI18n?.t?.[active]?.submit) || 'Submit Business Inquiry';
        return;
      }

      try {
        const requestBody = new FormData();
        Object.entries(payload).forEach(([key, value]) => requestBody.append(key, value == null ? '' : String(value)));
        if (attachment instanceof File && attachment.size > 0) requestBody.append('attachment', attachment, attachment.name);

        const response = await fetch('/api/inquiries', {
          method: 'POST',
          body: requestBody,
          credentials: 'same-origin'
        });
        const dataResponse = await response.json().catch(() => ({}));
        if (!response.ok || !dataResponse.ok || dataResponse.persisted !== true || !dataResponse.request_number) {
          throw new Error(dataResponse.error || `HTTP ${response.status}`);
        }

        const when = dataResponse.created_at
          ? new Intl.DateTimeFormat(
              active === 'fa' ? 'fa-IR' : active === 'ar' ? 'ar' : active === 'tr' ? 'tr-TR' : active === 'ru' ? 'ru-RU' : active === 'uz' ? 'uz-UZ' : 'en-US',
              { dateStyle: 'medium', timeStyle: 'short' }
            ).format(new Date(dataResponse.created_at))
          : '';

        const safeReference = escapeHtml(dataResponse.request_number);
        const safeWhen = escapeHtml(when);
        const safeAttachmentName = escapeHtml(dataResponse.attachment?.name || '');
        const safeEmailErrorCode = escapeHtml(dataResponse.email_notification_error || '');
        const attachmentNote = safeAttachmentName ? `<div style="margin-top:4px">Attachment: ${safeAttachmentName}</div>` : '';
        const emailNote = dataResponse.email_notification === 'sent'
          ? `<div style="margin-top:8px">${t.emailSent}</div>`
          : `<div style="margin-top:8px">${t.emailFailed}${safeEmailErrorCode ? ` <span style="opacity:.8">(${t.emailErrorCode}: ${safeEmailErrorCode})</span>` : ''}</div>`;
        result.className = 'result show';
        result.innerHTML = `<div>${t.success}</div><div style="margin-top:8px">${t.reference}: <strong>${safeReference}</strong></div>${safeWhen ? `<div style="margin-top:4px">${t.date}: ${safeWhen}</div>` : ''}${attachmentNote}<div style="margin-top:8px">${t.received}</div>${emailNote}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" data-stage1-copy style="padding:8px 12px;border-radius:8px;border:1px solid #145b3b;background:#fff;color:#145b3b;font-weight:800">${t.copy}</button></div>`;

        result.querySelector('[data-stage1-copy]').addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(dataResponse.request_number); } catch (_) {}
        });
        replacement.reset();
      } catch (error) {
        setResult(t.error + (error?.message || 'unknown_error'), true);
      } finally {
        button.disabled = false;
        button.textContent = (window.AgroZiaI18n?.t?.[active]?.submit) || 'Submit Business Inquiry';
      }
    });
    return true;
  }

  function waitForCanonicalForm() {
    if (install()) return;
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForCanonicalForm, { once: true });
  else waitForCanonicalForm();
})();
