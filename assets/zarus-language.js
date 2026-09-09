(() => {
  const supported = new Set(['en', 'fa', 'ar', 'uz', 'tr', 'ru']);
  const rtl = new Set(['fa', 'ar']);
  const q = new URLSearchParams(location.search);
  const lang = supported.has(q.get('lang')) ? q.get('lang') : (supported.has(document.documentElement.lang) ? document.documentElement.lang : 'en');
  document.documentElement.lang = lang;
  document.documentElement.dir = rtl.has(lang) ? 'rtl' : 'ltr';

  const select = document.querySelector('.z-language');
  if (!select) return;
  select.value = lang;
  select.addEventListener('change', () => {
    const next = supported.has(select.value) ? select.value : 'en';
    const nextUrl = new URL(location.href);
    nextUrl.searchParams.set('lang', next);
    location.assign(nextUrl.pathname + nextUrl.search + nextUrl.hash);
  });
})();
