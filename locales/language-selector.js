/* Agro-Zia V3 multilingual selector — preview foundation */
(function () {
  const languages = {
    en: { label: 'EN', dir: 'ltr' },
    ru: { label: 'RU', dir: 'ltr' },
    fa: { label: 'فا', dir: 'rtl' },
    ar: { label: 'ع', dir: 'rtl' },
    uz: { label: 'UZ', dir: 'ltr' },
    tr: { label: 'TR', dir: 'ltr' }
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
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest('a') || parent.closest('script') || parent.closest('style')) return;
      const text = node.nodeValue || '';
      const email = emails.find((value) => text.includes(value));
      if (!email) return;
      const index = text.indexOf(email);
      const fragment = document.createDocumentFragment();
      fragment.append(document.createTextNode(text.slice(0, index)));
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      link.setAttribute('aria-label', `Email ${email}`);
      fragment.append(link);
      fragment.append(document.createTextNode(text.slice(index + email.length)));
      node.replaceWith(fragment);
    });
  }

  function init() {
    setDirection();
    activateZarusLink();
    activateContactEmails();
    const observer = new MutationObserver(() => {
      activateZarusLink();
      activateContactEmails();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();