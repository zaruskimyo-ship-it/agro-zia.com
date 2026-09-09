(() => {
  const langs={en:{home:'Home',menu:'Menu',chat:'Chat Online',inquiry:'Request Inquiry',quote:'Request Quote',back:'Back',submit:'Submit RFQ',contact:'Contact'},fa:{home:'خانه',menu:'منو',chat:'گفتگوی آنلاین',inquiry:'درخواست استعلام',quote:'درخواست قیمت',back:'بازگشت',submit:'ارسال RFQ',contact:'تماس'},ar:{home:'الرئيسية',menu:'القائمة',chat:'محادثة مباشرة',inquiry:'طلب استعلام',quote:'طلب عرض سعر',back:'رجوع',submit:'إرسال RFQ',contact:'اتصل بنا'},tr:{home:'Ana Sayfa',menu:'Menü',chat:'Sohbet',inquiry:'Teklif Talebi',quote:'Teklif Talebi',back:'Geri',submit:'RFQ Gönder',contact:'İletişim'},ru:{home:'Главная',menu:'Меню',chat:'Онлайн-чат',inquiry:'Запрос цены',quote:'Запрос цены',back:'Назад',submit:'Отправить RFQ',contact:'Контакты'},uz:{home:'Bosh sahifa',menu:'Menyu',chat:'Onlayn suhbat',inquiry:'Narx so‘rovi',quote:'Narx so‘rash',back:'Orqaga',submit:'RFQ yuborish',contact:'Aloqa'}};
  const rtl=l=>['fa','ar'].includes(l);
  const esc=v=>{const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML};
  const withLang=(path,lang,extra={})=>{const u=new URL(path,location.origin);u.searchParams.set('lang',lang);Object.entries(extra).forEach(([k,v])=>{if(v)u.searchParams.set(k,v)});return u.pathname+u.search};
  const run=()=>{
    if(document.querySelector('.agz-bottom-actions'))return;
    const q=new URLSearchParams(location.search);const lang=langs[q.get('lang')]?q.get('lang'):(document.documentElement.lang&&langs[document.documentElement.lang]?document.documentElement.lang:'en');const t=langs[lang];
    const path=location.pathname.replace(/\/+$/,'')||'/';const bar=document.createElement('nav');bar.className='agz-bottom-actions';bar.dir=rtl(lang)?'rtl':'ltr';bar.setAttribute('aria-label',t.menu);const inner=document.createElement('div');inner.className='agz-bottom-actions__inner';
    const link=(label,icon,href,primary=false)=>{const a=document.createElement('a');a.href=href;a.className=primary?'agz-bottom-actions__primary':'';a.innerHTML=`<span class="agz-bottom-actions__icon" aria-hidden="true">${icon}</span><span class="agz-bottom-actions__label">${esc(label)}</span>`;inner.appendChild(a);return a};
    if(path==='/zarus-product.html'){
      link(t.home,'⌂',withLang('/zarus.html',lang));const product=q.get('slug')||q.get('id');const supplier=q.get('supplier');
      const params={lang};if(product)params.product=product;if(supplier)params.supplier=supplier;const inquiry=link(t.inquiry,'▣',withLang('/zarus-rfq.html',lang,params),true);
      const addChat=()=>{if(inner.querySelector('[data-supplier-contact]'))return true;const source=document.querySelector('.z-card-row a.z-btn-ghost[href*="zarus-supplier.html"],a[href*="zarus-supplier.html"]');if(!source)return false;const a=link(t.chat,'💬',source.href);a.dataset.supplierContact='true';inner.insertBefore(a,inquiry);return true};if(!addChat()){const o=new MutationObserver(()=>{if(addChat())o.disconnect()});o.observe(document.querySelector('#product-root')||document.body,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),10000)}
    }else if(path==='/zarus-supplier.html'){
      link(t.home,'⌂',withLang('/zarus.html',lang));const slug=q.get('slug');const extra={lang};if(slug)extra.supplier=slug;link(t.chat,'💬',withLang('/zarus-rfq.html',lang,extra));link(t.quote,'▣',withLang('/zarus-rfq.html',lang,extra),true);
    }else if(path==='/zarus-rfq.html'){
      const b=document.createElement('button');b.type='button';b.innerHTML=`<span class="agz-bottom-actions__icon" aria-hidden="true">←</span><span class="agz-bottom-actions__label">${esc(t.back)}</span>`;b.addEventListener('click',()=>history.length>1?history.back():location.assign(withLang('/zarus.html',lang)));inner.appendChild(b);link(t.home,'⌂',withLang('/zarus.html',lang));const s=document.createElement('button');s.type='button';s.className='agz-bottom-actions__primary';s.innerHTML=`<span class="agz-bottom-actions__icon" aria-hidden="true">✓</span><span class="agz-bottom-actions__label">${esc(t.submit)}</span>`;s.addEventListener('click',()=>{const f=document.querySelector('#rfq');if(f)f.requestSubmit()});inner.appendChild(s);
    }else{
      link(t.menu,'☰','#',false).addEventListener('click',e=>{e.preventDefault();const menu=document.querySelector('[data-menu],.menu');if(menu)menu.click()});link(t.home,'⌂',withLang('/',lang));link(t.chat,'💬',withLang('/contact.html',lang));link(t.inquiry,'▣',withLang('/inquiry.html',lang),true);
    }
    bar.appendChild(inner);document.body.appendChild(bar);
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run,{once:true}):run();
})();