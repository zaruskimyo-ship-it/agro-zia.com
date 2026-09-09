(() => {
  const button = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');

  // The language control is part of the global header and is injected during
  // the initial script pass so it is available before any later navigation.
  const labels = {
    en: 'English',
    fa: 'فارسی',
    tr: 'Türkçe',
    ru: 'Русский',
  };
  const current = new URL(window.location.href).searchParams.get('lang') || document.documentElement.lang || 'en';
  const supported = Object.prototype.hasOwnProperty.call(labels, current) ? current : 'en';

  if (nav && !nav.querySelector('[data-language-switcher]')) {
    const wrap = document.createElement('div');
    wrap.className = 'language-switcher';
    wrap.setAttribute('data-language-switcher', '');
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

  if (supported === 'fa') {
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.lang = supported;
    document.documentElement.dir = 'ltr';
  }

  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }));
})();
