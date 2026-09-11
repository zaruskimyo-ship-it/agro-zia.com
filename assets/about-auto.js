(() => {
  const translations = {
    en: {
      kicker: 'AGRO-ZIA / ABOUT',
      title: 'A practical agricultural network built around knowledge, execution and trade.',
      lead: 'AGRO-ZIA connects agricultural expertise, engineering capability, sourcing and international B2B relationships.',
      start: 'Start a business conversation', products: 'Explore products',
      principle: 'CORE PRINCIPLE', principleTitle: 'Know · Build · Trade', principleText: 'From technical understanding to reliable commercial execution.',
      who: 'WHO WE ARE', whoTitle: 'One platform, several connected capabilities.', whoText: 'Our public structure separates specialist services while keeping the customer journey simple and connected.',
      agriculture: 'Agriculture', agricultureText: 'Products, agricultural inputs, controlled environments and practical field knowledge.',
      engineering: 'Engineering', engineeringText: 'Technical assessment, greenhouse, irrigation and implementation-oriented engineering support.',
      trade: 'International Trade', tradeText: 'Sourcing, supplier relationships, documentation and cross-border B2B coordination.',
      network: 'NETWORK', networkTitle: 'Designed to grow from a trusted network.', networkText: 'Suppliers, buyers, technical partners and logistics relationships can be connected through a structured digital platform.',
      networkButton: 'Supplier & Partner Network', zarusButton: 'Enter ZARUS Marketplace'
    },
    fa: {
      kicker: 'AGRO-ZIA / درباره ما', title: 'یک شبکه کاربردی کشاورزی بر پایه دانش، اجرا و تجارت.',
      lead: 'AGRO-ZIA دانش کشاورزی، توان مهندسی، تأمین و روابط B2B بین‌المللی را به یکدیگر متصل می‌کند.',
      start: 'آغاز گفت‌وگوی تجاری', products: 'مشاهده محصولات', principle: 'اصل بنیادین', principleTitle: 'دانش · ساخت · تجارت', principleText: 'از درک فنی تا اجرای تجاری قابل اتکا.',
      who: 'ما چه کسی هستیم', whoTitle: 'یک پلتفرم، چند توانمندی متصل.', whoText: 'ساختار عمومی ما خدمات تخصصی را تفکیک می‌کند و در عین حال مسیر مشتری را ساده و یکپارچه نگه می‌دارد.',
      agriculture: 'کشاورزی', agricultureText: 'محصولات، نهاده‌های کشاورزی، محیط‌های کنترل‌شده و دانش کاربردی مزرعه.',
      engineering: 'مهندسی', engineeringText: 'ارزیابی فنی، گلخانه، آبیاری و پشتیبانی مهندسی با تمرکز بر اجرا.',
      trade: 'تجارت بین‌المللی', tradeText: 'تأمین، روابط تأمین‌کنندگان، اسناد و هماهنگی B2B فرامرزی.',
      network: 'شبکه', networkTitle: 'طراحی‌شده برای رشد بر پایه یک شبکه قابل اعتماد.', networkText: 'تأمین‌کنندگان، خریداران، شرکای فنی و روابط لجستیکی می‌توانند از طریق یک پلتفرم دیجیتال ساختاریافته به هم متصل شوند.',
      networkButton: 'شبکه تأمین‌کنندگان و شرکا', zarusButton: 'ورود به بازار ZARUS'
    },
    ar: {
      kicker: 'AGRO-ZIA / من نحن', title: 'شبكة زراعية عملية تقوم على المعرفة والتنفيذ والتجارة.',
      lead: 'تربط AGRO-ZIA الخبرة الزراعية والقدرات الهندسية والتوريد والعلاقات التجارية الدولية بين الشركات.',
      start: 'ابدأ محادثة تجارية', products: 'استكشف المنتجات', principle: 'المبدأ الأساسي', principleTitle: 'اعرف · ابنِ · تاجر', principleText: 'من الفهم الفني إلى التنفيذ التجاري الموثوق.',
      who: 'من نحن', whoTitle: 'منصة واحدة وقدرات متعددة مترابطة.', whoText: 'يفصل هيكلنا العام الخدمات المتخصصة مع الحفاظ على رحلة عميل بسيطة ومترابطة.',
      agriculture: 'الزراعة', agricultureText: 'المنتجات والمدخلات الزراعية والبيئات المحكومة والمعرفة العملية الحقلية.',
      engineering: 'الهندسة', engineeringText: 'التقييم الفني والبيوت المحمية والري والدعم الهندسي الموجه للتنفيذ.',
      trade: 'التجارة الدولية', tradeText: 'التوريد وعلاقات الموردين والوثائق والتنسيق التجاري العابر للحدود.',
      network: 'الشبكة', networkTitle: 'مصممة للنمو من خلال شبكة موثوقة.', networkText: 'يمكن ربط الموردين والمشترين والشركاء الفنيين والعلاقات اللوجستية عبر منصة رقمية منظمة.',
      networkButton: 'شبكة الموردين والشركاء', zarusButton: 'دخول سوق ZARUS'
    },
    uz: {
      kicker: 'AGRO-ZIA / BIZ HAQIMIZDA', title: 'Bilim, amaliy ijro va savdoga asoslangan amaliy qishloq xo‘jaligi tarmog‘i.',
      lead: 'AGRO-ZIA qishloq xo‘jaligi tajribasi, muhandislik salohiyati, ta’minot va xalqaro B2B aloqalarini bog‘laydi.',
      start: 'Biznes suhbatini boshlash', products: 'Mahsulotlarni ko‘rish', principle: 'ASOSIY TAMOYIL', principleTitle: 'Bil · Qur · Savdo qil', principleText: 'Texnik tushunchadan ishonchli tijoriy ijrogacha.',
      who: 'BIZ KIMMIZ', whoTitle: 'Bitta platforma, bir nechta bog‘langan imkoniyatlar.', whoText: 'Ommaviy tuzilma ixtisoslashgan xizmatlarni ajratadi va mijoz yo‘lini sodda hamda bog‘langan holda saqlaydi.',
      agriculture: 'Qishloq xo‘jaligi', agricultureText: 'Mahsulotlar, agroinputlar, nazorat qilinadigan muhitlar va amaliy dala bilimi.',
      engineering: 'Muhandislik', engineeringText: 'Texnik baholash, issiqxona, sug‘orish va amalga oshirishga yo‘naltirilgan muhandislik yordami.',
      trade: 'Xalqaro savdo', tradeText: 'Ta’minot, yetkazib beruvchi aloqalari, hujjatlar va transchegaraviy B2B muvofiqlashtirish.',
      network: 'TARMOQ', networkTitle: 'Ishonchli tarmoq asosida o‘sish uchun yaratilgan.', networkText: 'Yetkazib beruvchilar, xaridorlar, texnik hamkorlar va logistika aloqalari tuzilgan raqamli platforma orqali bog‘lanishi mumkin.',
      networkButton: 'Yetkazib beruvchi va hamkorlar tarmog‘i', zarusButton: 'ZARUS bozoriga kirish'
    },
    tr: {
      kicker: 'AGRO-ZIA / HAKKIMIZDA', title: 'Bilgi, uygulama ve ticaret üzerine kurulu pratik bir tarım ağı.',
      lead: 'AGRO-ZIA; tarımsal uzmanlık, mühendislik yetkinliği, tedarik ve uluslararası B2B ilişkilerini birbirine bağlar.',
      start: 'İş görüşmesi başlat', products: 'Ürünleri keşfet', principle: 'TEMEL İLKE', principleTitle: 'Bil · Kur · Ticaret', principleText: 'Teknik anlayıştan güvenilir ticari uygulamaya.',
      who: 'BİZ KİMİZ', whoTitle: 'Tek platform, birbirine bağlı çeşitli yetkinlikler.', whoText: 'Kamusal yapımız uzmanlık hizmetlerini ayırırken müşteri yolculuğunu basit ve bağlantılı tutar.',
      agriculture: 'Tarım', agricultureText: 'Ürünler, tarımsal girdiler, kontrollü ortamlar ve pratik saha bilgisi.',
      engineering: 'Mühendislik', engineeringText: 'Teknik değerlendirme, sera, sulama ve uygulamaya yönelik mühendislik desteği.',
      trade: 'Uluslararası Ticaret', tradeText: 'Tedarik, tedarikçi ilişkileri, belgeler ve sınır ötesi B2B koordinasyonu.',
      network: 'AĞ', networkTitle: 'Güvenilir bir ağ üzerinden büyümek için tasarlandı.', networkText: 'Tedarikçiler, alıcılar, teknik ortaklar ve lojistik ilişkiler yapılandırılmış dijital platform üzerinden bağlanabilir.',
      networkButton: 'Tedarikçi ve İş Ortağı Ağı', zarusButton: 'ZARUS Pazarına Gir'
    },
    ru: {
      kicker: 'AGRO-ZIA / О КОМПАНИИ', title: 'Практическая сельскохозяйственная сеть, основанная на знаниях, реализации и торговле.',
      lead: 'AGRO-ZIA объединяет сельскохозяйственную экспертизу, инженерные возможности, снабжение и международные B2B-связи.',
      start: 'Начать деловой разговор', products: 'Посмотреть продукты', principle: 'ОСНОВНОЙ ПРИНЦИП', principleTitle: 'Знай · Создавай · Торгуй', principleText: 'От технического понимания до надежного коммерческого исполнения.',
      who: 'КТО МЫ', whoTitle: 'Одна платформа и несколько связанных возможностей.', whoText: 'Наша публичная структура разделяет специализированные услуги, сохраняя путь клиента простым и связанным.',
      agriculture: 'Сельское хозяйство', agricultureText: 'Продукты, сельскохозяйственные ресурсы, контролируемые среды и практические полевые знания.',
      engineering: 'Инжиниринг', engineeringText: 'Техническая оценка, теплицы, орошение и инженерная поддержка, ориентированная на реализацию.',
      trade: 'Международная торговля', tradeText: 'Снабжение, отношения с поставщиками, документация и трансграничная B2B-координация.',
      network: 'СЕТЬ', networkTitle: 'Создана для роста на основе надежной сети.', networkText: 'Поставщики, покупатели, технические партнеры и логистические связи могут быть объединены через структурированную цифровую платформу.',
      networkButton: 'Сеть поставщиков и партнеров', zarusButton: 'Войти в маркетплейс ZARUS'
    }
  };
  const lang = new URL(location.href).searchParams.get('lang') || document.documentElement.lang || 'en';
  const t = translations[lang] || translations.en;
  document.documentElement.lang = lang in translations ? lang : 'en';
  document.documentElement.dir = ['fa', 'ar'].includes(document.documentElement.lang) ? 'rtl' : 'ltr';
  const set = (selector, value) => { const el = document.querySelector(selector); if (el) el.textContent = value; };
  set('.kicker', t.kicker); set('h1', t.title); set('.lead', t.lead);
  const buttons = document.querySelectorAll('.actions .button'); if (buttons[0]) buttons[0].textContent=t.start; if(buttons[1]) buttons[1].textContent=t.products;
  const panel = document.querySelector('.hero-panel'); if(panel){const s=panel.querySelector('span'),strong=panel.querySelector('strong'),p=panel.querySelector('p'); if(s)s.textContent=t.principle;if(strong)strong.textContent=t.principleTitle;if(p)p.textContent=t.principleText;}
  const heads=document.querySelectorAll('.section-head'); if(heads[0]){setText(heads[0].querySelector('.kicker'),t.who);setText(heads[0].querySelector('h2'),t.whoTitle);setText(heads[0].querySelector('p:last-child'),t.whoText);} if(heads[1]){setText(heads[1].querySelector('.kicker'),t.network);setText(heads[1].querySelector('h2'),t.networkTitle);setText(heads[1].querySelector('p:last-child'),t.networkText);}
  const cards=document.querySelectorAll('.cards.three article'); const vals=[[t.agriculture,t.agricultureText],[t.engineering,t.engineeringText],[t.trade,t.tradeText]]; cards.forEach((c,i)=>{if(vals[i]){setText(c.querySelector('b'),vals[i][0]);setText(c.querySelector('p'),vals[i][1]);}});
  const bandButtons=document.querySelectorAll('section.band .button'); if(bandButtons[0])bandButtons[0].textContent=t.networkButton;if(bandButtons[1])bandButtons[1].textContent=t.zarusButton;
  function setText(el,v){if(el)el.textContent=v;}
})();
