(() => {
  const run=()=>{
    if(document.querySelector('.agz-float-nav')) return;
    const u=new URL(location.href);const lang=['en','fa','ar','uz','tr','ru'].includes(u.searchParams.get('lang'))?u.searchParams.get('lang'):'en';
    const L={en:['Home','About','Products','Engineering','Projects','Trade','ZARUS','Knowledge','Network','Contact'],fa:['خانه','درباره ما','محصولات','مهندسی','پروژه‌ها','تجارت','ZARUS','دانش','شبکه','تماس'],ar:['الرئيسية','من نحن','المنتجات','الهندسة','المشاريع','التجارة','ZARUS','المعرفة','الشبكة','اتصل بنا'],uz:['Bosh sahifa','Biz haqimizda','Mahsulotlar','Muhandislik','Loyihalar','Savdo','ZARUS','Bilim','Tarmoq','Aloqa'],tr:['Ana Sayfa','Hakkımızda','Ürünler','Mühendislik','Projeler','Ticaret','ZARUS','Bilgi','Ağ','İletişim'],ru:['Главная','О нас','Продукты','Инжиниринг','Проекты','Торговля','ZARUS','Знания','Сеть','Контакты']}[lang]||[];
    const paths=['/','/about.html','/products.html','/engineering.html','/projects.html','/trade.html','/zarus.html','/knowledge.html','/network.html','/contact.html'];
    const menu={en:'Menu',fa:'منو',ar:'القائمة',uz:'Menyu',tr:'Menü',ru:'Меню'}[lang];
    const wrap=document.createElement('div');wrap.className='agz-float-nav';wrap.dir=['fa','ar'].includes(lang)?'rtl':'ltr';
    const panel=document.createElement('div');panel.className='agz-float-panel';panel.setAttribute('aria-hidden','true');panel.setAttribute('role','menu');
    paths.forEach((path,i)=>{const a=document.createElement('a');const target=new URL(path,location.origin);target.searchParams.set('lang',lang);a.href=target.pathname+target.search;a.textContent=L[i];a.setAttribute('role','menuitem');panel.appendChild(a)});
    const toggle=document.createElement('button');toggle.type='button';toggle.className='agz-float-toggle';toggle.setAttribute('aria-label',menu);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','agz-float-panel');toggle.textContent='☰';panel.id='agz-float-panel';
    const close=()=>{panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true')};
    toggle.addEventListener('click',()=>{const open=!panel.classList.contains('open');panel.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open))});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
    panel.addEventListener('click',e=>{if(e.target.closest('a'))close()});
    wrap.append(panel,toggle);document.body.appendChild(wrap);
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run,{once:true}):run();
})();