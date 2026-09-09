(() => {
  const markets = {
    en: { locale: 'en-GB', zone: 'UTC', label: 'International Trade' },
    fa: { locale: 'fa-IR', zone: 'Asia/Tehran', label: 'ایران' },
    ar: { locale: 'ar-IQ', zone: 'Asia/Baghdad', label: 'العراق' },
    uz: { locale: 'uz-UZ', zone: 'Asia/Tashkent', label: 'O‘zbekiston' },
    tr: { locale: 'tr-TR', zone: 'Europe/Istanbul', label: 'Türkiye' },
    ru: { locale: 'ru-RU', zone: 'Europe/Moscow', label: 'Россия' }
  };
  const labels = {
    en: 'Market time', fa: 'ساعت بازار', ar: 'توقيت السوق', uz: 'Bozor vaqti', tr: 'Pazar saati', ru: 'Время рынка'
  };
  const run = () => {
    if (document.querySelector('.agz-world-clock')) return;
    const lang = markets[window.AgroZiaActiveLanguage] ? window.AgroZiaActiveLanguage : 'en';
    const market = markets[lang];
    const rtl = ['fa', 'ar'].includes(lang);
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const el = document.createElement('aside');
    el.className = 'agz-world-clock';
    el.dir = rtl ? 'rtl' : 'ltr';
    el.setAttribute('aria-label', labels[lang]);
    el.innerHTML = `<span class="agz-world-clock__label"></span><strong class="agz-world-clock__time"></strong><small class="agz-world-clock__date"></small><em class="agz-world-clock__market"></em>`;
    const menu = nav.querySelector('.menu');
    if (menu) nav.insertBefore(el, menu);
    else nav.appendChild(el);
    el.querySelector('.agz-world-clock__label').textContent = labels[lang];
    el.querySelector('.agz-world-clock__market').textContent = market.label;
    const time = el.querySelector('.agz-world-clock__time');
    const date = el.querySelector('.agz-world-clock__date');
    const update = () => {
      const now = new Date();
      time.textContent = new Intl.DateTimeFormat(market.locale, { timeZone: market.zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
      date.textContent = new Intl.DateTimeFormat(market.locale, { timeZone: market.zone, weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }).format(now);
    };
    update();
    window.setInterval(update, 1000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
})();
