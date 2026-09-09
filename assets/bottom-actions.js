(() => {
  const langs = {
    en: { home:'Home', menu:'Menu', chat:'Contact Supplier', inquiry:'Send Inquiry', quote:'Request Quote', back:'Back', submit:'Submit RFQ' },
    fa: { home:'خانه', menu:'منو', chat:'تماس با تأمین‌کننده', inquiry:'ارسال درخواست', quote:'درخواست قیمت', back:'بازگشت', submit:'ارسال RFQ' },
    ar: { home:'الرئيسية', menu:'القائمة', chat:'التواصل مع المورد', inquiry:'إرسال طلب', quote:'طلب عرض سعر', back:'رجوع', submit:'إرسال RFQ' },
    tr: { home:'Ana Sayfa', menu:'Menü', chat:'Tedarikçi ile iletişim', inquiry:'Talep Gönder', quote:'Teklif Talebi', back:'Geri', submit:'RFQ Gönder' },
    ru: { home:'Главная', menu:'Меню', chat:'Связаться с поставщиком', inquiry:'Отправить запрос', quote:'Запрос цены', back:'Назад', submit:'Отправить RFQ' },
    uz: { home:'Bosh sahifa', menu:'Menyu', chat:'Yetkazib beruvchi bilan aloqa', inquiry:'So‘rov yuborish', quote:'Narx so‘rash', back:'Orqaga', submit:'RFQ yuborish' }
  };
  const isRTL = lang => ['fa','ar'].includes(lang);
  const esc = value => { const d = document.createElement('div'); d.textContent = value == null ? '' : String(value); return d.innerHTML; };
  const withLang = (path, lang) => { const u = new URL(path, location.origin); u.searchParams.set('lang', lang); return u.pathname + u.search; };
  const run = () => {
    if (document.querySelector('.agz-bottom-actions')) return;
    const q = new URLSearchParams(location.search);
    const lang = langs[q.get('lang')] ? q.get('lang') : (document.documentElement.lang || 'en');
    const t = langs[lang] || langs.en;
    const path = location.pathname;
    const bar = document.createElement('nav');
    bar.className = 'agz-bottom-actions';
    bar.dir = isRTL(lang) ? 'rtl' : 'ltr';
    bar.setAttribute('aria-label', t.menu);
    const inner = document.createElement('div');
    inner.className = 'agz-bottom-actions__inner';
    const addLink = (label, icon, href, primary = false) => {
      const a = document.createElement('a'); a.href = href; a.className = primary ? 'agz-bottom-actions__primary' : '';
      a.innerHTML = `<span class="agz-bottom-actions__icon" aria-hidden="true">${icon}</span><span class="agz-bottom-actions__label">${esc(label)}</span>`; inner.appendChild(a); return a;
    };
    if (path.endsWith('zarus-product.html')) {
      addLink(t.home, '⌂', withLang('/zarus.html', lang));
      const supplierLink = document.querySelector('.z-card-row a.z-btn-ghost[href*="zarus-supplier.html"]');
      if (supplierLink) addLink(t.chat, '💬', supplierLink.href);
      const product = q.get('slug') || q.get('id'); const supplier = q.get('supplier');
      let href = '/zarus-rfq.html?'; const params = new URLSearchParams({ lang }); if (product) params.set('product', product); if (supplier) params.set('supplier', supplier);
      addLink(t.inquiry, '▣', href + params.toString(), true);
    } else if (path.endsWith('zarus-supplier.html')) {
      addLink(t.home, '⌂', withLang('/zarus.html', lang));
      const slug = q.get('slug'); const params = new URLSearchParams({ lang }); if (slug) params.set('supplier', slug);
      addLink(t.chat, '💬', '/zarus-rfq.html?' + params.toString());
      addLink(t.quote, '▣', '/zarus-rfq.html?' + params.toString(), true);
    } else if (path.endsWith('zarus-rfq.html')) {
      const back = document.createElement('button'); back.type = 'button'; back.innerHTML = `<span class="agz-bottom-actions__icon" aria-hidden="true">←</span><span class="agz-bottom-actions__label">${esc(t.back)}</span>`; back.addEventListener('click', () => history.length > 1 ? history.back() : (location.href = withLang('/zarus.html', lang))); inner.appendChild(back);
      addLink(t.home, '⌂', withLang('/zarus.html', lang));
      const submit = document.createElement('button'); submit.type = 'button'; submit.className = 'agz-bottom-actions__primary'; submit.innerHTML = `<span class="agz-bottom-actions__icon" aria-hidden="true">✓</span><span class="agz-bottom-actions__label">${esc(t.submit)}</span>`; submit.addEventListener('click', () => { const form = document.querySelector('#rfq'); if (form) { form.requestSubmit(); form.scrollIntoView({ behavior:'smooth', block:'center' }); } }); inner.appendChild(submit);
    } else return;
    bar.appendChild(inner); document.body.appendChild(bar);
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run, { once:true }) : run();
})();