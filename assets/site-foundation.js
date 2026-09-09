(() => {
  const init = () => {
    const button = document.querySelector('[data-menu], .menu');
    const nav = document.querySelector('[data-nav], header nav');
    const navWrap = document.querySelector('.nav');
    const labels = { en: 'English', fa: 'فارسی', ar: 'العربية', uz: 'O‘zbek', tr: 'Türkçe', ru: 'Русский' };
    const url = new URL(window.location.href);
    const current = url.searchParams.get('lang') || document.documentElement.lang || 'en';
    const supported = Object.prototype.hasOwnProperty.call(labels, current) ? current : 'en';
    const homeLabels = { en: 'Home', fa: 'خانه', ar: 'الرئيسية', uz: 'Bosh sahifa', tr: 'Ana Sayfa', ru: 'Главная' };

    if (nav) {
      nav.dataset.nav = 'true';
      if (!nav.querySelector('a[data-home-link]')) {
        const home = document.createElement('a');
        home.href = '/?lang=' + encodeURIComponent(supported);
        home.textContent = homeLabels[supported];
        home.dataset.homeLink = 'true';
        nav.insertBefore(home, nav.firstChild);
      }
    }

    let select = navWrap?.querySelector('.language-select');
    if (!select && navWrap) {
      const box = document.createElement('div');
      box.className = 'language-switcher';
      box.setAttribute('data-language-switcher', '');
      select = document.createElement('select');
      select.className = 'language-select';
      select.setAttribute('aria-label', 'Select language');
      Object.entries(labels).forEach(([code, label]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = label;
        option.selected = code === supported;
        select.appendChild(option);
      });
      box.appendChild(select);
      navWrap.insertBefore(box, button || nav || null);
    }
    if (select && !select.dataset.languageBound) {
      select.dataset.languageBound = 'true';
      select.value = supported;
      select.addEventListener('change', () => {
        const next = new URL(window.location.href);
        next.searchParams.set('lang', select.value);
        window.location.assign(next.toString());
      });
    }

    document.documentElement.lang = supported;
    document.documentElement.dir = ['fa', 'ar'].includes(supported) ? 'rtl' : 'ltr';

    // Persist the selected language across the whole site. Every same-origin
    // navigation keeps the current ?lang value unless the destination already
    // specifies an explicit language (for example Trade market links).
    document.querySelectorAll('a[href]').forEach((link) => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|https?:\/\/)/i.test(raw)) return;
      if (link.dataset.languagePersistBound) return;
      try {
        const target = new URL(raw, window.location.origin);
        if (target.origin !== window.location.origin) return;
        if (!target.searchParams.has('lang')) target.searchParams.set('lang', supported);
        link.href = target.pathname + target.search + target.hash;
        link.dataset.languagePersistBound = 'true';
      } catch (_) {}
    });

    if (button && nav && !button.dataset.menuBound) {
      button.dataset.menuBound = 'true';
      button.dataset.menu = 'true';
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        nav.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      }));
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const load = (src) => { const s = document.createElement('script'); s.src = src; document.head.appendChild(s); };
    if (path === '/') {
      load('/assets/home-auto.js');
      load('/assets/home-nav-auto.js');
    } else if (path === '/trade.html') {
      load('/assets/trade-auto.js');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
