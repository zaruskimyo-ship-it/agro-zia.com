(() => {
  const init = () => {
    const button = document.querySelector('[data-menu], .menu');
    const nav = document.querySelector('[data-nav], header nav');
    const navWrap = document.querySelector('.nav');

    const labels = { en: 'English', fa: 'فارسی', ar: 'العربية', uz: 'O‘zbek', tr: 'Türkçe', ru: 'Русский' };
    const url = new URL(window.location.href);
    const current = url.searchParams.get('lang') || document.documentElement.lang || 'en';
    const supported = Object.prototype.hasOwnProperty.call(labels, current) ? current : 'en';

    if (nav) {
      nav.dataset.nav = 'true';
      if (!nav.querySelector('a[data-home-link]')) {
        const home = document.createElement('a');
        home.href = '/?lang=' + encodeURIComponent(supported);
        home.textContent = supported === 'fa' ? 'خانه' : supported === 'ar' ? 'الرئيسية' : supported === 'tr' ? 'Ana Sayfa' : supported === 'uz' ? 'Bosh sahifa' : supported === 'ru' ? 'Главная' : 'Home';
        home.dataset.homeLink = 'true';
        nav.insertBefore(home, nav.firstChild);
      }
    }

    // Keep the language control visible in the global header, including before
    // the mobile menu is opened. It is therefore a true global navigation control.
    if (navWrap && !navWrap.querySelector('[data-language-switcher]')) {
      const wrap = document.createElement('div');
      wrap.className = 'language-switcher';
      wrap.dataset.languageSwitcher = '';
      wrap.setAttribute('aria-label', 'Language');
      const select = document.createElement('select');
      select.className = 'language-select';
      select.setAttribute('aria-label', 'Select language');
      Object.entries(labels).forEach(([code, label]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = label;
        option.selected = code === supported;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        const next = new URL(window.location.href);
        next.searchParams.set('lang', select.value);
        window.location.assign(next.toString());
      });
      wrap.appendChild(select);
      navWrap.insertBefore(wrap, button || nav || null);
    }

    document.documentElement.lang = supported;
    document.documentElement.dir = ['fa', 'ar'].includes(supported) ? 'rtl' : 'ltr';

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
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
