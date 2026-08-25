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
})();
