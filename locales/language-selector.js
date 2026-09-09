/* Agro-Zia Stage 1 guard: keep the approved multilingual selector and suppress the legacy inquiry submit handler. */
(() => {
  const originalAddEventListener = HTMLFormElement.prototype.addEventListener;
  HTMLFormElement.prototype.addEventListener = function (type, listener, options) {
    if (type === 'submit' && this.id === 'canonical-inquiry-form' && typeof listener === 'function') {
      const source = Function.prototype.toString.call(listener);
      if (source.includes("fd.get('interest')") && source.includes('data-agrozia-inquiry-result')) return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  const core = document.createElement('script');
  core.src = 'locales/language-selector-core.js?v=20260909';
  core.async = false;
  document.head.appendChild(core);

  const fix = document.createElement('script');
  fix.src = 'locales/stage1-inquiry-root-fix.js?v=20260909';
  fix.async = false;
  document.head.appendChild(fix);

  const attachment = document.createElement('script');
  attachment.src = 'locales/stage4-attachment.js?v=20260909';
  attachment.async = false;
  document.head.appendChild(attachment);

  const loadCss = (href) => {
    if (document.querySelector(`link[data-agz-shared-style="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href + '?v=20260909';
    link.dataset.agzSharedStyle = href;
    document.head.appendChild(link);
  };
  const loadJs = (src) => {
    if (document.querySelector(`script[data-agz-shared-src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src + '?v=20260909';
    script.dataset.agzSharedSrc = src;
    script.async = false;
    document.head.appendChild(script);
  };

  // Shared navigation/actions/market clock for legacy localized public pages.
  loadCss('assets/floating-nav.css');
  loadCss('assets/bottom-actions.css');
  loadCss('assets/world-clock.css');
  loadJs('assets/floating-nav.js');
  loadJs('assets/bottom-actions.js');
  loadJs('assets/world-clock.js');
})();
