(() => {
  const button = document.querySelector('[data-menu], .menu');
  const nav = document.querySelector('[data-nav], header nav');

  const labels = {
    en: 'English',
    fa: 'فارسی',
    ar: 'العربية',
    uz: 'O‘zbek',
    tr: 'Türkçe',
    ru: 'Русский',
  };
  const current = new URL(window.location.href).searchParams.get('lang') || document.documentElement.lang || 'en';
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
    if (!nav.querySelector('[data-language-switcher]')) {
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
        const url = new URL(window.location.href);
        url.searchParams.set('lang', select.value);
        window.location.assign(url.toString());
      });
      wrap.appendChild(select);
      nav.appendChild(wrap);
    }
  }

  document.documentElement.lang = supported;
  document.documentElement.dir = ['fa', 'ar'].includes(supported) ? 'rtl' : 'ltr';

  if (button && nav) {
    button.dataset.menu = 'true';
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }));
  }
})();
