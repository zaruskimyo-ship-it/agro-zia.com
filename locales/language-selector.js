/* Agro-Zia V3 multilingual selector — preview-only foundation */
(function(){
  const languages={
    en:{label:'EN',dir:'ltr'},
    ru:{label:'RU',dir:'ltr'},
    fa:{label:'فا',dir:'rtl'},
    ar:{label:'ع',dir:'rtl'},
    uz:{label:'UZ',dir:'ltr'},
    tr:{label:'TR',dir:'ltr'}
  };
  const code=new URLSearchParams(location.search).get('lang');
  const active=languages[code]?code:'en';
  document.documentElement.lang=active;
  document.documentElement.dir=languages[active].dir;
  window.AgroZiaLanguages=languages;
  window.AgroZiaActiveLanguage=active;

  function activateZarusLink(){
    const zarusSection=document.querySelector('.zarus');
    if(!zarusSection) return;
    const existing=zarusSection.querySelector('[data-i18n="network_link"]');
    if(!existing) return;
    if(existing.tagName.toLowerCase()==='a'){
      existing.href='https://zarus.ir/';
      existing.target='_blank';
      existing.rel='noopener noreferrer';
      return;
    }
    const link=document.createElement('a');
    link.className=existing.className;
    link.setAttribute('data-i18n','network_link');
    link.href='https://zarus.ir/';
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.textContent=existing.textContent;
    existing.replaceWith(link);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',activateZarusLink,{once:true});
  }else{
    activateZarusLink();
  }
})();
