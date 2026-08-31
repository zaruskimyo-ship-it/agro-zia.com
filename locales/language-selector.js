/* Agro-Zia Stage 1 guard: keep the approved multilingual selector, but suppress its legacy inquiry submit handler. */
(() => {
  const originalAddEventListener = HTMLFormElement.prototype.addEventListener;
  HTMLFormElement.prototype.addEventListener = function (type, listener, options) {
    if (type === 'submit' && this.id === 'canonical-inquiry-form' && typeof listener === 'function') {
      const source = Function.prototype.toString.call(listener);
      if (source.includes("fd.get('interest')") && source.includes('data-agrozia-inquiry-result')) return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  const script = document.createElement('script');
  script.src = 'locales/language-selector-core.js';
  script.async = false;
  document.head.appendChild(script);
})();