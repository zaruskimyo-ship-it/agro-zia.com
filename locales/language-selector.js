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
  core.src = 'locales/language-selector-core.js';
  core.async = false;
  document.head.appendChild(core);

  const fix = document.createElement('script');
  fix.src = 'locales/stage1-inquiry-root-fix.js';
  fix.async = false;
  document.head.appendChild(fix);

  const attachment = document.createElement('script');
  attachment.src = 'locales/stage4-attachment.js';
  attachment.async = false;
  document.head.appendChild(attachment);

  // Shared site navigation must be available on every public/localized page.
  // Existing loaders are harmless because both shared scripts self-deduplicate.
  const loadCss = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  const loadJs = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };
  loadCss('assets/floating-nav.css');
  loadCss('assets/bottom-actions.css');
  loadJs('assets/floating-nav.js');
  loadJs('assets/bottom-actions.js');
})();
