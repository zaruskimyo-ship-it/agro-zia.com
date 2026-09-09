(() => {
  const u = new URL(location.href);
  const l = ['en','fa','ar','uz','tr','ru'].includes(u.searchParams.get('lang')) ? u.searchParams.get('lang') : 'en';
  const navs = {
    en:['Home','About','Products','Engineering','Projects','Trade','ZARUS','Knowledge','Network','Contact'],
    fa:['خانه','درباره ما','محصولات','مهندسی','پروژه‌ها','تجارت','ZARUS','دانش','شبکه','تماس'],
    ar:['الرئيسية','من نحن','المنتجات','الهندسة','المشاريع','التجارة','ZARUS','المعرفة','الشبكة','اتصل بنا'],
    uz:['Bosh sahifa','Biz haqimizda','Mahsulotlar','Muhandislik','Loyihalar','Savdo','ZARUS','Bilim','Tarmoq','Aloqa'],
    tr:['Ana Sayfa','Hakkımızda','Ürünler','Mühendislik','Projeler','Ticaret','ZARUS','Bilgi','Ağ','İletişim'],
    ru:['Главная','О нас','Продукты','Инжиниринг','Проекты','Торговля','ZARUS','Знания','Сеть','Контакты']
  };
  const links = document.querySelectorAll('header nav a');
  (navs[l] || navs.en).forEach((text,i)=>{ if(links[i]) links[i].textContent=text; });
})();
