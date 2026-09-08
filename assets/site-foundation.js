(() => {
  const button = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');
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
