/* Agro-Zia Telegram-11 root inquiry handler: multipart submission with attachment hardening. */
(() => {
  const MAX_BYTES = 1024 * 1024;
  const TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]);
  const EXTENSIONS = /\.(pdf|doc|docx|txt|jpe?g|png|webp)$/i;
  const messages = {
    en: { sending:'Submitting inquiry…', success:'Inquiry submitted successfully', reference:'Request Reference', saved:'Your inquiry has been received. Please keep this reference number.', emailSent:'Notification email sent to Agro-Zia.', emailFailed:'Inquiry saved, but notification email could not be sent.', error:'Unable to submit: ', invalidType:'Please attach a PDF, DOC, DOCX, TXT, JPG/JPEG, PNG or WEBP file.', invalidSize:'Attachment must be 1 MB or smaller.' },
    ru: { sending:'Отправка запроса…', success:'Запрос успешно отправлен', reference:'Номер заявки', saved:'Ваш запрос получен. Сохраните этот номер.', emailSent:'Уведомление отправлено в Agro-Zia.', emailFailed:'Запрос сохранён, но уведомление по электронной почте не отправлено.', error:'Не удалось отправить: ', invalidType:'Прикрепите файл PDF, DOC, DOCX, TXT, JPG/JPEG, PNG или WEBP.', invalidSize:'Размер вложения не должен превышать 1 МБ.' },
    fa: { sending:'در حال ثبت درخواست…', success:'درخواست با موفقیت ثبت شد', reference:'شماره پیگیری', saved:'درخواست شما دریافت شد. لطفاً این شماره را نگهداری کنید.', emailSent:'ایمیل اطلاع‌رسانی همراه با پیوست برای Agro-Zia ارسال شد.', emailFailed:'درخواست ثبت شد، اما ایمیل اطلاع‌رسانی ارسال نشد.', error:'ثبت درخواست انجام نشد: ', invalidType:'لطفاً فایل PDF، DOC، DOCX، TXT، JPG/JPEG، PNG یا WEBP انتخاب کنید.', invalidSize:'حجم فایل پیوست باید حداکثر ۱ مگابایت باشد.' },
    ar: { sending:'جارٍ إرسال الطلب…', success:'تم إرسال الطلب بنجاح', reference:'رقم المرجع', saved:'تم استلام طلبك. يرجى الاحتفاظ بهذا الرقم.', emailSent:'تم إرسال إشعار إلى Agro-Zia.', emailFailed:'تم حفظ الطلب، ولكن تعذر إرسال إشعار البريد الإلكتروني.', error:'تعذر إرسال الطلب: ', invalidType:'يرجى إرفاق ملف PDF أو DOC أو DOCX أو TXT أو JPG/JPEG أو PNG أو WEBP.', invalidSize:'يجب ألا يتجاوز المرفق 1 ميغابايت.' },
    uz: { sending:'So‘rov yuborilmoqda…', success:'So‘rov muvaffaqiyatli yuborildi', reference:'So‘rov raqami', saved:'So‘rovingiz qabul qilindi. Ushbu raqamni saqlang.', emailSent:'Bildirishnoma Agro-Zia ga yuborildi.', emailFailed:'So‘rov saqlandi, ammo email bildirishnomasi yuborilmadi.', error:'So‘rov yuborilmadi: ', invalidType:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG yoki WEBP faylini tanlang.', invalidSize:'Ilova hajmi 1 MB yoki undan kichik bo‘lishi kerak.' },
    tr: { sending:'Talep gönderiliyor…', success:'Talep başarıyla gönderildi', reference:'Talep Referansı', saved:'Talebiniz alındı. Bu numarayı saklayın.', emailSent:'Bildirim e-postası Agro-Zia’ya gönderildi.', emailFailed:'Talep kaydedildi, ancak bildirim e-postası gönderilemedi.', error:'Talep gönderilemedi: ', invalidType:'Lütfen PDF, DOC, DOCX, TXT, JPG/JPEG, PNG veya WEBP dosyası ekleyin.', invalidSize:'Ek dosya 1 MB veya daha küçük olmalıdır.' }
  };

  const lang = new URLSearchParams(location.search).get('lang') || 'en';
  const t = messages[lang] || messages.en;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  function install() {
    const form = document.getElementById('rfq');
    if (!form || form.dataset.agzInquiryUx === 'true') return;
    form.dataset.agzInquiryUx = 'true';
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('#result');
    const fileInput = form.querySelector('#inquiry-file');
    if (!button || !result) return;

    const setResult = (message, error = false) => {
      result.className = error ? 'result show error' : 'result show';
      result.textContent = message;
    };

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        if ((!TYPES.has(file.type) && file.type) || !EXTENSIONS.test(file.name || '')) {
          fileInput.value = '';
          setResult(t.invalidType, true);
          return;
        }
        if (file.size > MAX_BYTES) {
          fileInput.value = '';
          setResult(t.invalidSize, true);
        }
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;
      button.disabled = true;
      const originalLabel = button.textContent;
      button.textContent = t.sending;
      result.className = 'result';
      result.textContent = '';

      try {
        const source = new FormData(form);
        const body = new FormData();
        for (const [key, value] of source.entries()) {
          if (key !== 'attachment' && typeof value === 'string') body.append(key, value);
        }
        body.set('language', lang);
        const attachment = fileInput?.files?.[0];
        if (attachment) {
          if ((!TYPES.has(attachment.type) && attachment.type) || !EXTENSIONS.test(attachment.name || '')) throw new Error(t.invalidType);
          if (attachment.size > MAX_BYTES) throw new Error(t.invalidSize);
          body.append('attachment', attachment, attachment.name);
        }

        const response = await fetch('/api/inquiries', { method:'POST', body, credentials:'same-origin' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok !== true || payload.persisted !== true || !payload.request_number) {
          throw new Error(payload.error || `HTTP ${response.status}`);
        }
        const reference = escapeHtml(payload.request_number);
        const attachmentName = escapeHtml(payload.attachment?.name || '');
        const attachmentNote = attachmentName ? `<div>Attachment: ${attachmentName}</div>` : '';
        const emailNote = payload.email_notification === 'sent' ? t.emailSent : t.emailFailed;
        result.className = 'result show';
        result.innerHTML = `<strong>${t.success}</strong><div style="margin-top:6px">${t.reference}: <strong>${reference}</strong></div>${attachmentNote}<div style="margin-top:6px">${t.saved}</div><div style="margin-top:6px">${emailNote}</div>`;
        form.reset();
      } catch (error) {
        setResult(t.error + (error?.message || 'request_failed'), true);
      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})();
