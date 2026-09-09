(() => {
  const langs={
    en:{request:'Request Inquiry',chat:'Chat Online',menu:'Menu'},
    fa:{request:'درخواست استعلام',chat:'گفتگوی آنلاین',menu:'منو'},
    ar:{request:'طلب استفسار',chat:'دردشة مباشرة',menu:'القائمة'},
    uz:{request:'So‘rov yuborish',chat:'Onlayn suhbat',menu:'Menyu'},
    tr:{request:'Talep Gönder',chat:'Çevrimiçi Sohbet',menu:'Menü'},
    ru:{request:'Отправить запрос',chat:'Онлайн-чат',menu:'Меню'}
  };
  const supported=code=>Object.prototype.hasOwnProperty.call(langs,code);
  const rtl=code=>['fa','ar'].includes(code);
  const withLang=(path,lang)=>{const u=new URL(path,location.origin);u.searchParams.set('lang',lang);return u.pathname+u.search;};
  const esc=value=>{const d=document.createElement('div');d.textContent=value==null?'':String(value);return d.innerHTML;};
  const run=()=>{
    if(document.querySelector('.agz-bottom-actions')) return;
    const q=new URLSearchParams(location.search);
    const lang=supported(q.get('lang'))?q.get('lang'):(supported(document.documentElement.lang)?document.documentElement.lang:'en');
    const t=langs[lang]||langs.en;
    const path=location.pathname.replace(/\/+$/,'')||'/';
    const bar=document.createElement('nav');bar.className='agz-bottom-actions';bar.dir=rtl(lang)?'rtl':'ltr';bar.setAttribute('aria-label',t.menu);
    const inner=document.createElement('div');inner.className='agz-bottom-actions__inner';
    const add=(label,icon,href,primary=false)=>{const a=document.createElement('a');a.href=href;a.className=primary?'agz-bottom-actions__primary':'';a.innerHTML=`<span class="agz-bottom-actions__icon" aria-hidden="true">${icon}</span><span class="agz-bottom-actions__label">${esc(label)}</span>`;inner.appendChild(a);};
    if(path==='/'||path==='/about.html'||path==='/products.html'||path==='/engineering.html'||path==='/projects.html'||path==='/trade.html'||path==='/knowledge.html'||path==='/network.html'||path==='/contact.html'){
      add(t.request,'▣',withLang('/inquiry.html',lang),true);
      add(t.chat,'💬',withLang('/contact.html',lang));
    } else if(path.endsWith('zarus-product.html')||path.endsWith('zarus-supplier.html')||path.endsWith('zarus-rfq.html')) return;
    else return;
    bar.appendChild(inner);document.body.appendChild(bar);
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run,{once:true}):run();
})();