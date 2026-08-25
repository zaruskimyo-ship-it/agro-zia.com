(() => {
  const icons = {
    products: 'assets/icons/agricultural-products.svg',
    engineering: 'assets/icons/engineering.svg',
    projects: 'assets/icons/greenhouse.svg',
    trade: 'assets/icons/custom-sourcing.svg'
  };

  document.querySelectorAll('[data-business-icon]').forEach((el) => {
    const key = el.getAttribute('data-business-icon');
    if (!icons[key]) return;
    el.setAttribute('src', icons[key]);
    el.setAttribute('alt', '');
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('business-pillar-icon');
  });
})();
