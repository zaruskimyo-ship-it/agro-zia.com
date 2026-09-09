(() => {
  const run=()=>{
    if(document.querySelector('.agz-float-nav')) return;
    const lang=new URL(location.href).searchParams.get('lang')||document.documentElement.lang||'en';
    const L={en:['Home','About','Products','Engineering','Projects','Trade','ZARUS','Knowledge','Network','Contact'],fa:['خانه','درباره ما','محصولات','مهندسی','پروژه‌ها','تجارت','ZARUS','دانش','شبکه','تماس'],ar:['الرئيسية','من نحن','المنتجات','الهندسة','المشاريع','التجارة','ZARUS','المعرفة','الشبكة','اتصل بنا'],uz:['Bosh sahifa','Biz haqimizda','Mahsulotlar','Muhandislik','Loyihalar','Savdo','ZARUS','Bilim','Tarmoq','Aloqa'],tr:['Ana Sayfa','Hakkımızda','Ürünler','Mühendislik','Projeler','Ticaret','ZARUS','Bilgi','Ağ','İletişim'],ru:['Главная','О нас','Продукты','Инжиниринг','Проекты','Торговля','ZARUS','Знания','Сеть','Контакты']}[lang]||L.en;
    const paths=['/','/about.html','/products.html','/engineering.html','/projects.html','/trade.html','/zarus.html','/knowledge.html','/network.html','/contact.html'];
    const menu=lang==='fa'?'منو':lang==='ar'?'القائمة':lang==='uz'?'Menyu':lang==='tr'?'Menü':lang==='ru'?'Меню':'Menu';
    const wrap=document.createElement('div');wrap.className='agz-float-nav';wrap.dir=['fa','ar'].includes(lang)?'rtl':'ltr';
    const panel=document.createElement('div');panel.className='agz-float-panel';panel.setAttribute('aria-hidden','true');
    paths.forEach((path,i)=>{const a=document.createElement('a');const u=new URL(path,location.origin);u.searchParams.set('lang',lang);a.href=u.pathname+u.search;a.textContent=L[i];panel.appendChild(a)});
    const toggle=document.createElement('button');toggle.type='button';toggle.className='agz-float-toggle';toggle.setAttribute('aria-label',menu);toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';
    toggle.addEventListener('click',()=>{const open=panel.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open))});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true')}});
    wrap.append(panel,toggle);document.body.appendChild(wrap);
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run,{once:true}):run();
})();