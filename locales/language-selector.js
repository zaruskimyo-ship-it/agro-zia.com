/* Agro-Zia V3 multilingual selector + inquiry UX */
(function () {
  const languages = {
    en: { label: 'EN', dir: 'ltr' },
    ru: { label: 'RU', dir: 'ltr' },
    fa: { label: 'فا', dir: 'rtl' },
    ar: { label: 'ع', dir: 'rtl' },
    uz: { label: 'UZ', dir: 'ltr' },
    tr: { label: 'TR', dir: 'ltr' }
  };

  const inquiryMessages = {
    en: { sending:'Sending…', received:'Inquiry received successfully.', request:'Request number', detail:'Please keep this number for future communication.', fallback:'Your email inquiry is being prepared. Please review it before sending.', failed:'The inquiry could not be submitted. Please try again or continue on WhatsApp.' },
    ru: { sending:'Отправка…', received:'Запрос успешно получен.', request:'Номер запроса', detail:'Сохраните этот номер для дальнейшей связи.', fallback:'Ваш запрос готовится к отправке по email. Проверьте его перед отправкой.', failed:'Не удалось отправить запрос. Попробуйте ещё раз или продолжите в WhatsApp.' },
    fa: { sending:'در حال ارسال…', received:'درخواست شما با موفقیت دریافت شد.', request:'شماره درخواست', detail:'لطفاً این شماره را برای پیگیری‌های بعدی نگه دارید.', fallback:'درخواست شما برای ارسال از طریق ایمیل آماده می‌شود. لطفاً پیش از ارسال آن را بررسی کنید.', failed:'ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید یا از طریق واتساپ ادامه دهید.' },
    ar: { sending:'جارٍ الإرسال…', received:'تم استلام طلبكم بنجاح.', request:'رقم الطلب', detail:'يرجى الاحتفاظ بهذا الرقم للمتابعة لاحقاً.', fallback:'جارٍ تجهيز طلبكم للإرسال عبر البريد الإلكتروني. يرجى مراجعته قبل الإرسال.', failed:'تعذر إرسال الطلب. يرجى المحاولة مرة أخرى أو المتابعة عبر واتساب.' },
    uz: { sending:'Yuborilmoqda…', received:'So‘rovingiz muvaffaqiyatli qabul qilindi.', request:'So‘rov raqami', detail:'Keyingi aloqa uchun ushbu raqamni saqlang.', fallback:'So‘rovingiz email orqali yuborish uchun tayyorlanmoqda. Yuborishdan oldin tekshiring.', failed:'So‘rov yuborilmadi. Qayta urinib ko‘ring yoki WhatsApp orqali davom eting.' },
    tr: { sending:'Gönderiliyor…', received:'Talebiniz başarıyla alındı.', request:'Talep numarası', detail:'Sonraki iletişim için bu numarayı saklayın.', fallback:'Talebiniz e-posta ile gönderilmek üzere hazırlanıyor. Göndermeden önce kontrol edin.', failed:'Talep gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden devam edin.' }
  };

  const getActive = () => {
    const code = new URLSearchParams(location.search).get('lang');
    return languages[code] ? code : 'en';
  };

  const setDirection = () => {
    const active = getActive();
    document.documentElement.lang = active;
    document.documentElement.dir = languages[active].dir;
    window.AgroZiaLanguages = languages;
    window.AgroZiaActiveLanguage = active;
  };

  function activateZarusLink() {
    const existing = document.querySelector('.zarus [data-i18n="network_link"]');
    if (!existing) return;
    if (existing.tagName.toLowerCase() === 'a') {
      existing.href = 'https://zarus.ir/';
      existing.target = '_blank';
      existing.rel = 'noopener noreferrer';
      return;
    }
    const link = document.createElement('a');
    link.className = existing.className;
    link.setAttribute('data-i18n', 'network_link');
    link.href = 'https://zarus.ir/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = existing.textContent || '';
    existing.replaceWith(link);
  }

  function activateContactEmails() {
    const emails = ['info@agro-zia.com', 'export@agro-zia.com'];
    document.querySelectorAll('strong').forEach((element) => {
      const text = (element.textContent || '').trim();
      const email = emails.find((value) => text === value);
      if (!email || element.closest('a')) return;
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      link.setAttribute('aria-label', `Email ${email}`);
      link.style.cursor = 'pointer';
      link.style.textDecoration = 'underline';
      link.style.fontWeight = 'inherit';
      element.replaceWith(link);
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      link.style.cursor = 'pointer';
      link.addEventListener('click', () => { window.location.href = link.href; }, { once: true });
    });
  }

  function activateSocialLinks() {
    const footer = document.querySelector('footer .container');
    if (!footer || footer.querySelector('[data-agrozia-social]')) return;
    const wrap = document.createElement('div');
    wrap.setAttribute('data-agrozia-social', 'true');
    wrap.style.display = 'flex'; wrap.style.flexWrap = 'wrap'; wrap.style.gap = '10px'; wrap.style.marginTop = '18px';
    const links = [
      { label: 'WhatsApp', href: 'https://wa.me/message/C2C4CHM4DXFNO1', aria: 'Contact Agro-Zia on WhatsApp' },
      { label: 'Instagram @agro_zia', href: 'https://www.instagram.com/agro_zia/', aria: 'Agro-Zia on Instagram' }
    ];
    links.forEach(({ label, href, aria }) => {
      const link = document.createElement('a');
      link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = label; link.setAttribute('aria-label', aria);
      link.style.display = 'inline-flex'; link.style.alignItems = 'center'; link.style.padding = '7px 11px'; link.style.border = '1px solid rgba(255,255,255,.25)'; link.style.borderRadius = '999px'; link.style.color = '#fff'; link.style.fontSize = '12px'; link.style.fontWeight = '700'; link.style.textDecoration = 'none';
      wrap.appendChild(link);
    });
    footer.appendChild(wrap);
  }

  function activateFooterEmails() {
    const footer = document.querySelector('footer .container');
    if (!footer || footer.querySelector('[data-agrozia-footer-emails]')) return;
    const wrap = document.createElement('div');
    wrap.setAttribute('data-agrozia-footer-emails', 'true');
    wrap.style.display = 'flex'; wrap.style.flexWrap = 'wrap'; wrap.style.gap = '10px'; wrap.style.marginTop = '10px';
    [
      { label: 'info@agro-zia.com', aria: 'Email Agro-Zia information' },
      { label: 'export@agro-zia.com', aria: 'Email Agro-Zia export team' }
    ].forEach(({ label, aria }) => {
      const link = document.createElement('a');
      link.href = `mailto:${label}`; link.textContent = label; link.setAttribute('aria-label', aria); link.style.color = '#fff'; link.style.textDecoration = 'underline'; link.style.textUnderlineOffset = '3px'; link.style.fontSize = '12px'; link.style.fontWeight = '700'; link.style.cursor = 'pointer';
      wrap.appendChild(link);
    });
    footer.appendChild(wrap);
  }

  function activateProductCategoryLinks() {
    if (!/\/products\.html$/i.test(location.pathname)) return;
    const grid = document.querySelector('#categories .grid3');
    if (!grid || grid.querySelector('[data-agrozia-product-link]')) return;
    const active = getActive();
    const labels = { en:'View category →', ru:'Открыть категорию →', fa:'مشاهده دسته‌بندی ←', ar:'عرض الفئة ←', uz:'Kategoriyani ko‘rish →', tr:'Kategoriyi görüntüle →' };
    const slugs = ['fertilizers','agricultural-products','greenhouse-products','irrigation-solutions','agricultural-equipment','custom-sourcing'];
    grid.querySelectorAll('.card').forEach((card, index) => {
      const slug = slugs[index]; if (!slug) return;
      const link = document.createElement('a');
      link.href = `product-detail.html?lang=${active}&product=${slug}`; link.setAttribute('data-agrozia-product-link', 'true'); link.textContent = labels[active];
      link.style.display = 'inline-flex'; link.style.marginTop = '16px'; link.style.padding = '9px 13px'; link.style.borderRadius = '8px'; link.style.background = '#145b3b'; link.style.color = '#fff'; link.style.fontWeight = '800'; link.style.fontSize = '12px'; link.style.textDecoration = 'none';
      link.addEventListener('click', () => { const url = new URL(link.href, location.href); url.searchParams.set('lang', getActive()); link.href = url.toString(); });
      card.appendChild(link);
    });
  }

  function showInquirySuccess(success, data) {
    if (!success) return;
    const active = getActive();
    const m = inquiryMessages[active] || inquiryMessages.en;
    success.innerHTML = `<strong>${m.received}</strong><br><span>${m.request}: <b>${data.request_number}</b></span><br><small>${m.detail}</small>`;
    success.classList.add('show');
    success.setAttribute('role', 'status');
    success.setAttribute('aria-live', 'polite');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function activateInquiryApi() {
    if (!/\/inquiry\.html$/i.test(location.pathname)) return;
    const form = document.getElementById('rfq');
    if (!form || form.dataset.apiActivated === 'true') return;
    form.dataset.apiActivated = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const value = (id) => (document.getElementById(id)?.value || '').trim();
      const payload = { language:getActive(), product:value('product'), company:value('company'), specification:value('spec'), quantity:value('quantity'), destination:value('destination'), timing:value('timing'), email:value('email'), phone:value('phone'), message:value('message') };
      const success = document.getElementById('success');
      const submit = form.querySelector('button[type="submit"]');
      const originalText = submit?.textContent || '';
      const m = inquiryMessages[getActive()] || inquiryMessages.en;
      if (submit) { submit.disabled = true; submit.textContent = m.sending; }
      if (success) { success.classList.remove('show'); success.textContent = ''; }
      try {
        const response = await fetch('/api/inquiries', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload) });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.ok) {
          showInquirySuccess(success, data);
          form.reset();
          return;
        }
        if (response.status === 503) {
          const subject = `Agro-Zia B2B Inquiry — ${payload.product}`;
          const body = [`Product / category: ${payload.product}`,`Company: ${payload.company}`,`Specification: ${payload.specification}`,`Quantity: ${payload.quantity}`,`Destination: ${payload.destination}`,`Preferred timing: ${payload.timing}`,`Email: ${payload.email}`,`Phone / WhatsApp: ${payload.phone}`,`Additional requirements: ${payload.message}`].join('\n');
          if (success) { success.textContent = m.fallback; success.classList.add('show'); success.setAttribute('role','status'); }
          window.location.href = `mailto:export@agro-zia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          return;
        }
        throw new Error(data.error || 'request_failed');
      } catch (error) {
        if (success) { success.textContent = m.failed; success.classList.add('show'); success.setAttribute('role','alert'); success.scrollIntoView({ behavior:'smooth', block:'center' }); }
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = originalText; }
      }
    }, true);
  }

  function init() {
    setDirection();
    activateZarusLink(); activateContactEmails(); activateSocialLinks(); activateFooterEmails(); activateProductCategoryLinks(); activateInquiryApi();
    const observer = new MutationObserver(() => { activateZarusLink(); activateContactEmails(); activateSocialLinks(); activateFooterEmails(); activateProductCategoryLinks(); });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
