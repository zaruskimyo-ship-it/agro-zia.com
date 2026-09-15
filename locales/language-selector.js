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
})();
