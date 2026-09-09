(() => {
  const init = () => {
    const button = document.querySelector('[data-menu], .menu');
    const nav = document.querySelector('[data-nav], header nav');
    const navWrap = document.querySelector('.nav');
    const labels = { en: 'English', fa: 'فارسی', ar: 'العربية', uz: 'O‘zbek', tr: 'Türkçe', ru: 'Русский' };
    const current = new URL(window.location.href).searchParams.get('lang') || document.documentElement.lang || 'en';
    const supported = Object.prototype.hasOwnProperty.call(labels, current) ? current : 'en';
    const navLabels = {
      en: { '/': 'Home','/about.html':'About','/products.html':'Products','/engineering.html':'Engineering','/projects.html':'Projects','/trade.html':'Trade','/zarus.html':'ZARUS','/knowledge.html':'Knowledge','/network.html':'Network','/contact.html':'Contact' },
      fa: { '/':'خانه','/about.html':'درباره ما','/products.html':'محصولات','/engineering.html':'مهندسی','/projects.html':'پروژه‌ها','/trade.html':'تجارت','/zarus.html':'ZARUS','/knowledge.html':'دانش','/network.html':'شبکه','/contact.html':'تماس' },
      ar: { '/':'الرئيسية','/about.html':'من نحن','/products.html':'المنتجات','/engineering.html':'الهندسة','/projects.html':'المشاريع','/trade.html':'التجارة','/zarus.html':'ZARUS','/knowledge.html':'المعرفة','/network.html':'الشبكة','/contact.html':'اتصل بنا' },
      uz: { '/':'Bosh sahifa','/about.html':'Biz haqimizda','/products.html':'Mahsulotlar','/engineering.html':'Muhandislik','/projects.html':'Loyihalar','/trade.html':'Savdo','/zarus.html':'ZARUS','/knowledge.html':'Bilim','/network.html':'Tarmoq','/contact.html':'Aloqa' },
      tr: { '/':'Ana Sayfa','/about.html':'Hakkımızda','/products.html':'Ürünler','/engineering.html':'Mühendislik','/projects.html':'Projeler','/trade.html':'Ticaret','/zarus.html':'ZARUS','/knowledge.html':'Bilgi','/network.html':'Ağ','/contact.html':'İletişim' },
      ru: { '/':'Главная','/about.html':'О нас','/products.html':'Продукты','/engineering.html':'Инжиниринг','/projects.html':'Проекты','/trade.html':'Торговля','/zarus.html':'ZARUS','/knowledge.html':'Знания','/network.html':'Сеть','/contact.html':'Контакты' }
    };

    if (nav) {
      nav.dataset.nav = 'true';
      if (!nav.querySelector('a[data-home-link]')) {
        const home = document.createElement('a');
        home.href = '/?lang=' + encodeURIComponent(supported);
        home.dataset.homeLink = 'true';
        nav.insertBefore(home, nav.firstChild);
      }
      const map = navLabels[supported] || navLabels.en;
      nav.querySelectorAll('a').forEach((link) => {
        try {
          const u = new URL(link.getAttribute('href') || '/', window.location.origin);
          const path = u.pathname.replace(/\/+$/, '') || '/';
          if (map[path]) link.textContent = map[path];
        } catch (_) {}
      });
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
        const option = document.createElement('option'); option.value = code; option.textContent = label; option.selected = code === supported; select.appendChild(option);
      });
      box.appendChild(select); navWrap.insertBefore(box, button || nav || null);
    }
    if (select && !select.dataset.languageBound) {
      select.dataset.languageBound = 'true'; select.value = supported;
      select.addEventListener('change', () => { const next = new URL(window.location.href); next.searchParams.set('lang', select.value); window.location.assign(next.toString()); });
    }

    document.documentElement.lang = supported;
    document.documentElement.dir = ['fa', 'ar'].includes(supported) ? 'rtl' : 'ltr';

    document.querySelectorAll('a[href]').forEach((link) => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|https?:\/\/)/i.test(raw)) return;
      try {
        const target = new URL(raw, window.location.origin);
        if (target.origin !== window.location.origin) return;
        target.searchParams.set('lang', supported);
        link.href = target.pathname + target.search + target.hash;
        link.dataset.languagePersistBound = 'true';
      } catch (_) {}
    });

    if (button && nav && !button.dataset.menuBound) {
      button.dataset.menuBound = 'true'; button.dataset.menu = 'true'; button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => { const open = nav.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); }));
    }

    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const load = (src) => { const s = document.createElement('script'); s.src = src; document.head.appendChild(s); };
    if (path === '/') { load('/assets/home-auto.js'); load('/assets/home-nav-auto.js'); }
    else if (path === '/about.html') load('/assets/about-auto.js');
    else if (path === '/trade.html') load('/assets/trade-auto.js');
    else if (path === '/network.html') load('/assets/network-auto.js');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();