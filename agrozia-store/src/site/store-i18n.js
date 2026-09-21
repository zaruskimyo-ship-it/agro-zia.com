const STORE_LANGUAGE_STORAGE_KEY = "agz-store-language";

export const SUPPORTED_STORE_LANGUAGES = Object.freeze({
  en: Object.freeze({ label: "English", direction: "ltr" }),
  fa: Object.freeze({ label: "فارسی", direction: "rtl" }),
  ar: Object.freeze({ label: "العربية", direction: "rtl" }),
  tr: Object.freeze({ label: "Türkçe", direction: "ltr" }),
  ru: Object.freeze({ label: "Русский", direction: "ltr" }),
  uz: Object.freeze({ label: "O‘zbek", direction: "ltr" }),
  ckb: Object.freeze({ label: "کوردی سۆرانی", direction: "rtl" })
});

const EN = Object.freeze({
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.suppliers": "Suppliers",
  "nav.rfq": "RFQ / Request",
  "nav.orders": "Orders",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.cart": "Cart",
  "nav.account": "Customer / Login",
  "common.explore": "Explore",
  "common.requestQuote": "Request a Quote",
  "common.submitRfq": "Submit an RFQ",
  "common.addToCart": "Add to Cart",
  "common.viewProduct": "View product",
  "common.back": "Back",
  "common.clear": "Clear",
  "common.apply": "Apply",
  "common.search": "Search",
  "common.loading": "Loading",
  "common.previous": "Previous",
  "common.next": "Next",
  "products.showing": "Showing {start}-{end} of {total} published products",
  "products.publishedSupplier": "{count, plural, one {# published supplier} other {# published suppliers}}",
  "products.priceOnRequest": "Price on request"
});

const FA = Object.freeze({
  "nav.home":"خانه","nav.products":"محصولات","nav.suppliers":"تأمین‌کنندگان","nav.rfq":"درخواست قیمت","nav.orders":"سفارش‌ها","nav.about":"درباره ما","nav.contact":"تماس","nav.cart":"سبد خرید","nav.account":"مشتری / ورود",
  "common.explore":"مشاهده محصولات","common.requestQuote":"درخواست قیمت","common.submitRfq":"ارسال درخواست قیمت","common.addToCart":"افزودن به سبد","common.viewProduct":"مشاهده محصول","common.back":"بازگشت","common.clear":"پاک کردن","common.apply":"اعمال","common.search":"جستجو","common.loading":"در حال بارگذاری","common.previous":"قبلی","common.next":"بعدی",
  "products.showing":"نمایش {start}-{end} از {total} محصول منتشرشده","products.publishedSupplier":"{count, plural, one {# تأمین‌کننده منتشرشده} other {# تأمین‌کننده منتشرشده}}","products.priceOnRequest":"قیمت پس از درخواست",
  "products.title":"محصولات کشاورزی","products.search":"جستجوی محصولات","products.filterCategory":"فیلتر بر اساس دسته‌بندی","products.allCategories":"همه دسته‌ها","products.sourceApi":"کاتالوگ زنده","products.noProducts":"محصولی یافت نشد","products.notFound":"محصول یافت نشد","products.unavailable":"محصول در دسترس نیست","products.liveCatalog":"کاتالوگ زنده محصولات","products.liveProduct":"محصول زنده","products.technical":"فنی","products.specification":"مشخصات","products.commercial":"تجاری","products.commercialTerms":"شرایط تجاری","products.availability":"موجودی","products.leadTime":"زمان تأمین","products.price":"قیمت","products.fromPrice":"از {price}","products.requestQuote":"درخواست قیمت","products.unit":"واحد","products.moq":"حداقل مقدار سفارش","products.origin":"مبدأ","products.incoterms":"اینکوترمز","products.supplyCapacity":"ظرفیت تأمین","products.packaging":"بسته‌بندی","products.loading":"در حال بارگذاری محصول…","products.connecting":"در حال اتصال به کاتالوگ…","products.emptyDescription":"توضیحی برای این محصول موجود نیست.","products.errorTitle":"کاتالوگ در دسترس نیست","products.errorDescription":"امکان بارگذاری کاتالوگ زنده محصولات وجود ندارد.","products.submitRfq":"ارسال درخواست قیمت","products.pageOf":"صفحه {page} از {pages}","products.backToProducts":"بازگشت به محصولات","products.productNotFound":"محصول موردنظر یافت نشد.","products.unavailableDescription":"این محصول در حال حاضر در دسترس نیست.","products.publishedProduct":"محصول منتشرشده","products.detailedSpecifications":"مشخصات فنی تفصیلی","products.detailedSpecifications":"مشخصات فنی تفصیلی","products.apply":"اعمال","products.clear":"پاک کردن","products.previous":"قبلی","products.next":"بعدی","products.viewProduct":"مشاهده محصول"
});
const AR = Object.freeze({
  "nav.home":"الرئيسية","nav.products":"المنتجات","nav.suppliers":"الموردون","nav.rfq":"طلب عرض سعر","nav.orders":"الطلبات","nav.about":"من نحن","nav.contact":"اتصل بنا","nav.cart":"السلة","nav.account":"العميل / تسجيل الدخول",
  "common.explore":"استكشف المنتجات","common.requestQuote":"طلب عرض سعر","common.submitRfq":"إرسال طلب عرض سعر","common.addToCart":"أضف إلى السلة","common.viewProduct":"عرض المنتج","common.back":"رجوع","common.clear":"مسح","common.apply":"تطبيق","common.search":"بحث","common.loading":"جارٍ التحميل","common.previous":"السابق","common.next":"التالي",
  "products.showing":"عرض {start}-{end} من أصل {total} من المنتجات المنشورة","products.publishedSupplier":"{count, plural, one {# مورد منشور} other {# موردين منشورين}}","products.priceOnRequest":"السعر عند الطلب",
  "products.title":"المنتجات الزراعية","products.search":"البحث عن المنتجات","products.filterCategory":"التصفية حسب الفئة","products.allCategories":"جميع الفئات","products.sourceApi":"الكتالوج المباشر","products.noProducts":"لم يتم العثور على منتجات","products.notFound":"المنتج غير موجود","products.unavailable":"المنتج غير متاح","products.liveCatalog":"كتالوج المنتجات المباشر","products.liveProduct":"منتج مباشر","products.technical":"فني","products.specification":"المواصفات","products.commercial":"تجاري","products.commercialTerms":"الشروط التجارية","products.availability":"التوفر","products.leadTime":"مدة التوريد","products.price":"السعر","products.fromPrice":"ابتداءً من {price}","products.requestQuote":"طلب عرض سعر","products.unit":"الوحدة","products.moq":"الحد الأدنى للطلب","products.origin":"المنشأ","products.incoterms":"شروط التجارة الدولية","products.supplyCapacity":"قدرة التوريد","products.packaging":"التعبئة","products.loading":"جارٍ تحميل المنتج…","products.connecting":"جارٍ الاتصال بالكتالوج…","products.emptyDescription":"لا يتوفر وصف لهذا المنتج.","products.errorTitle":"الكتالوج غير متاح","products.errorDescription":"تعذر تحميل كتالوج المنتجات المباشر.","products.submitRfq":"إرسال طلب عرض سعر","products.pageOf":"الصفحة {page} من {pages}","products.backToProducts":"العودة إلى المنتجات","products.productNotFound":"لم يتم العثور على المنتج المطلوب.","products.unavailableDescription":"هذا المنتج غير متاح حالياً.","products.publishedProduct":"منتج منشور","products.detailedSpecifications":"المواصفات التفصيلية","products.detailedSpecifications":"المواصفات التفصيلية","products.apply":"تطبيق","products.clear":"مسح","products.previous":"السابق","products.next":"التالي","products.viewProduct":"عرض المنتج"
});
const TR = Object.freeze({
  "nav.home":"Ana Sayfa","nav.products":"Ürünler","nav.suppliers":"Tedarikçiler","nav.rfq":"RFQ / Talep","nav.orders":"Siparişler","nav.about":"Hakkımızda","nav.contact":"İletişim","nav.cart":"Sepet","nav.account":"Müşteri / Giriş",
  "common.explore":"Ürünleri İncele","common.requestQuote":"Teklif İste","common.submitRfq":"RFQ Gönder","common.addToCart":"Sepete Ekle","common.viewProduct":"Ürünü Görüntüle","common.back":"Geri","common.clear":"Temizle","common.apply":"Uygula","common.search":"Ara","common.loading":"Yükleniyor","common.previous":"Önceki","common.next":"Sonraki",
  "products.showing":"Yayınlanan {total} ürünün {start}-{end} arası gösteriliyor","products.publishedSupplier":"{count, plural, one {# yayınlanmış tedarikçi} other {# yayınlanmış tedarikçi}}","products.priceOnRequest":"Fiyat talep üzerine",
  "products.title":"Tarım Ürünleri","products.search":"Ürün ara","products.filterCategory":"Kategoriye göre filtrele","products.allCategories":"Tüm kategoriler","products.sourceApi":"Canlı katalog","products.noProducts":"Ürün bulunamadı","products.notFound":"Ürün bulunamadı","products.unavailable":"Ürün mevcut değil","products.liveCatalog":"Canlı Ürün Kataloğu","products.liveProduct":"Canlı Ürün","products.technical":"Teknik","products.specification":"Özellikler","products.commercial":"Ticari","products.commercialTerms":"Ticari şartlar","products.availability":"Bulunabilirlik","products.leadTime":"Tedarik süresi","products.price":"Fiyat","products.fromPrice":"{price} değerinden","products.requestQuote":"Teklif İste","products.unit":"Birim","products.moq":"Minimum sipariş miktarı","products.origin":"Menşe","products.incoterms":"Incoterms","products.supplyCapacity":"Tedarik kapasitesi","products.packaging":"Ambalaj","products.loading":"Ürün yükleniyor…","products.connecting":"Kataloğa bağlanılıyor…","products.emptyDescription":"Bu ürün için açıklama mevcut değil.","products.errorTitle":"Katalog kullanılamıyor","products.errorDescription":"Canlı ürün kataloğu yüklenemedi.","products.submitRfq":"RFQ Gönder","products.pageOf":"Sayfa {page} / {pages}","products.backToProducts":"Ürünlere dön","products.productNotFound":"İstenen ürün bulunamadı.","products.unavailableDescription":"Bu ürün şu anda mevcut değil.","products.publishedProduct":"Yayınlanmış ürün","products.detailedSpecifications":"Ayrıntılı özellikler","products.detailedSpecifications":"Ayrıntılı özellikler","products.apply":"Uygula","products.clear":"Temizle","products.previous":"Önceki","products.next":"Sonraki","products.viewProduct":"Ürünü görüntüle"
});
const RU = Object.freeze({
  "nav.home":"Главная","nav.products":"Продукция","nav.suppliers":"Поставщики","nav.rfq":"RFQ / Запрос","nav.orders":"Заказы","nav.about":"О нас","nav.contact":"Контакты","nav.cart":"Корзина","nav.account":"Клиент / Вход",
  "common.explore":"Просмотреть продукцию","common.requestQuote":"Запросить предложение","common.submitRfq":"Отправить RFQ","common.addToCart":"Добавить в корзину","common.viewProduct":"Открыть товар","common.back":"Назад","common.clear":"Очистить","common.apply":"Применить","common.search":"Поиск","common.loading":"Загрузка","common.previous":"Назад","common.next":"Далее",
  "products.showing":"Показаны товары {start}-{end} из {total} опубликованных","products.publishedSupplier":"{count, plural, one {# опубликованный поставщик} other {# опубликованных поставщиков}}","products.priceOnRequest":"Цена по запросу",
  "products.title":"Сельскохозяйственная продукция","products.search":"Поиск продукции","products.filterCategory":"Фильтр по категории","products.allCategories":"Все категории","products.sourceApi":"Актуальный каталог","products.noProducts":"Товары не найдены","products.notFound":"Товар не найден","products.unavailable":"Товар недоступен","products.liveCatalog":"Актуальный каталог продукции","products.liveProduct":"Актуальный товар","products.technical":"Технические","products.specification":"Характеристики","products.commercial":"Коммерческие","products.commercialTerms":"Коммерческие условия","products.availability":"Наличие","products.leadTime":"Срок поставки","products.price":"Цена","products.fromPrice":"От {price}","products.requestQuote":"Запросить предложение","products.unit":"Единица","products.moq":"Минимальный объём заказа","products.origin":"Происхождение","products.incoterms":"Инкотермс","products.supplyCapacity":"Объём поставки","products.packaging":"Упаковка","products.loading":"Загрузка товара…","products.connecting":"Подключение к каталогу…","products.emptyDescription":"Описание товара отсутствует.","products.errorTitle":"Каталог недоступен","products.errorDescription":"Не удалось загрузить актуальный каталог продукции.","products.submitRfq":"Отправить RFQ","products.pageOf":"Страница {page} из {pages}","products.backToProducts":"Назад к продукции","products.productNotFound":"Запрошенный товар не найден.","products.unavailableDescription":"Этот товар сейчас недоступен.","products.publishedProduct":"Опубликованный товар","products.detailedSpecifications":"Подробные характеристики","products.detailedSpecifications":"Подробные характеристики","products.apply":"Применить","products.clear":"Очистить","products.previous":"Назад","products.next":"Далее","products.viewProduct":"Открыть товар"
});
const UZ = Object.freeze({
  "nav.home":"Bosh sahifa","nav.products":"Mahsulotlar","nav.suppliers":"Yetkazib beruvchilar","nav.rfq":"RFQ / So‘rov","nav.orders":"Buyurtmalar","nav.about":"Biz haqimizda","nav.contact":"Aloqa","nav.cart":"Savat","nav.account":"Mijoz / Kirish",
  "common.explore":"Mahsulotlarni ko‘rish","common.requestQuote":"Narx so‘rash","common.submitRfq":"RFQ yuborish","common.addToCart":"Savatga qo‘shish","common.viewProduct":"Mahsulotni ko‘rish","common.back":"Orqaga","common.clear":"Tozalash","common.apply":"Qo‘llash","common.search":"Qidirish","common.loading":"Yuklanmoqda","common.previous":"Oldingi","common.next":"Keyingi",
  "products.showing":"Nashr qilingan {total} mahsulotdan {start}-{end} ko‘rsatilmoqda","products.publishedSupplier":"{count, plural, one {# ta nashr qilingan yetkazib beruvchi} other {# ta nashr qilingan yetkazib beruvchi}}","products.priceOnRequest":"Narx so‘rov asosida",
  "products.title":"Qishloq xo‘jaligi mahsulotlari","products.search":"Mahsulotlarni qidirish","products.filterCategory":"Kategoriya bo‘yicha filtrlash","products.allCategories":"Barcha kategoriyalar","products.sourceApi":"Jonli katalog","products.noProducts":"Mahsulot topilmadi","products.notFound":"Mahsulot topilmadi","products.unavailable":"Mahsulot mavjud emas","products.liveCatalog":"Jonli mahsulot katalogi","products.liveProduct":"Jonli mahsulot","products.technical":"Texnik","products.specification":"Texnik xususiyatlar","products.commercial":"Tijoriy","products.commercialTerms":"Tijoriy shartlar","products.availability":"Mavjudligi","products.leadTime":"Ta’minot muddati","products.price":"Narx","products.fromPrice":"{price} dan","products.requestQuote":"Narx so‘rash","products.unit":"Birlik","products.moq":"Minimal buyurtma miqdori","products.origin":"Kelib chiqishi","products.incoterms":"Incoterms","products.supplyCapacity":"Ta’minot quvvati","products.packaging":"Qadoqlash","products.loading":"Mahsulot yuklanmoqda…","products.connecting":"Katalogga ulanilmoqda…","products.emptyDescription":"Bu mahsulot uchun tavsif mavjud emas.","products.errorTitle":"Katalog mavjud emas","products.errorDescription":"Jonli mahsulot katalogini yuklab bo‘lmadi.","products.submitRfq":"RFQ yuborish","products.pageOf":"{page}-sahifa / {pages}","products.backToProducts":"Mahsulotlarga qaytish","products.productNotFound":"So‘ralgan mahsulot topilmadi.","products.unavailableDescription":"Bu mahsulot hozir mavjud emas.","products.publishedProduct":"Nashr qilingan mahsulot","products.detailedSpecifications":"Batafsil texnik xususiyatlar","products.detailedSpecifications":"Batafsil texnik xususiyatlar","products.apply":"Qo‘llash","products.clear":"Tozalash","products.previous":"Oldingi","products.next":"Keyingi","products.viewProduct":"Mahsulotni ko‘rish"
});
const CKB = Object.freeze({
  "nav.home":"سەرەکی","nav.products":"بەرهەمەکان","nav.suppliers":"دابینکەران","nav.rfq":"RFQ / داواکاری","nav.orders":"داواکارییەکان","nav.about":"دەربارەمان","nav.contact":"پەیوەندی","nav.cart":"سەبەت","nav.account":"کڕیار / چوونەژوورەوە",
  "common.explore":"بینینی بەرهەمەکان","common.requestQuote":"داواکاریی نرخ","common.submitRfq":"ناردنی RFQ","common.addToCart":"زیادکردن بۆ سەبەت","common.viewProduct":"بینینی بەرهەم","common.back":"گەڕانەوە","common.clear":"سڕینەوە","common.apply":"جێبەجێکردن","common.search":"گەڕان","common.loading":"بارکردن","common.previous":"پێشوو","common.next":"دواتر",
  "products.showing":"پیشاندانی {start}-{end} لە {total} بەرهەمی بڵاوکراوە","products.publishedSupplier":"{count, plural, one {# دابینکەری بڵاوکراوە} other {# دابینکەری بڵاوکراوە}}","products.priceOnRequest":"نرخ بە داواکاری",
  "products.title":"بەرهەمە کشتوکاڵییەکان","products.search":"گەڕان بەدوای بەرهەمەکان","products.filterCategory":"فلتەرکردن بە پۆل","products.allCategories":"هەموو پۆلەکان","products.sourceApi":"کاتەلۆگی زیندوو","products.noProducts":"هیچ بەرهەمێک نەدۆزرایەوە","products.notFound":"بەرهەم نەدۆزرایەوە","products.unavailable":"بەرهەم بەردەست نییە","products.liveCatalog":"کاتەلۆگی زیندووی بەرهەمەکان","products.liveProduct":"بەرهەمی زیندوو","products.technical":"تەکنیکی","products.specification":"تایبەتمەندییەکان","products.commercial":"بازرگانی","products.commercialTerms":"مەرجە بازرگانییەکان","products.availability":"بەردەستبوون","products.leadTime":"ماوەی دابینکردن","products.price":"نرخ","products.fromPrice":"لە {price}","products.requestQuote":"داواکاریی نرخ","products.unit":"یەکە","products.moq":"کەمترین بڕی داواکاری","products.origin":"سەرچاوە","products.incoterms":"ئینکۆترمز","products.supplyCapacity":"توانای دابینکردن","products.packaging":"بسته‌بەندی","products.loading":"بەرهەم بار دەکرێت…","products.connecting":"پەیوەندی بە کاتەلۆگ دەکرێت…","products.emptyDescription":"هیچ وەسفێک بۆ ئەم بەرهەمە بەردەست نییە.","products.errorTitle":"کاتەلۆگ بەردەست نییە","products.errorDescription":"نەتوانرا کاتەلۆگی زیندووی بەرهەمەکان بار بکرێت.","products.submitRfq":"ناردنی RFQ","products.pageOf":"پەڕەی {page} لە {pages}","products.backToProducts":"گەڕانەوە بۆ بەرهەمەکان","products.productNotFound":"بەرهەمی داواکراو نەدۆزرایەوە.","products.unavailableDescription":"ئەم بەرهەمە ئێستا بەردەست نییە.","products.publishedProduct":"بەرهەمی بڵاوکراوە","products.detailedSpecifications":"تایبەتمەندییە وردەکان","products.detailedSpecifications":"تایبەتمەندییە وردەکان","products.apply":"جێبەجێکردن","products.clear":"سڕینەوە","products.previous":"پێشوو","products.next":"دواتر","products.viewProduct":"بینینی بەرهەم"
});
const DICTIONARIES = Object.freeze({ en: EN, fa: FA, ar: AR, tr: TR, ru: RU, uz: UZ, ckb: CKB });

function normalizeLanguage(language) {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_STORE_LANGUAGES, language) ? language : "en";
}

function readStoredLanguage() {
  try {
    if (typeof localStorage === "undefined") return "en";
    return normalizeLanguage(localStorage.getItem(STORE_LANGUAGE_STORAGE_KEY));
  } catch {
    return "en";
  }
}

export function getStoreLanguage() {
  return readStoredLanguage();
}

export function setStoreLanguage(language) {
  const normalized = normalizeLanguage(language);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORE_LANGUAGE_STORAGE_KEY, normalized);
    }
  } catch {
    // Storage can be unavailable in SSR, private contexts, or restricted browsers.
  }
  return normalized;
}

export function getStoreDirection(language = getStoreLanguage()) {
  return SUPPORTED_STORE_LANGUAGES[normalizeLanguage(language)].direction;
}

function dictionaryFor(language) {
  return DICTIONARIES[normalizeLanguage(language)] ?? EN;
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
  ));
}

export function getStoreI18nData(keys = null) {
  if (!Array.isArray(keys)) return Object.freeze({ languages: SUPPORTED_STORE_LANGUAGES, dictionaries: DICTIONARIES, storageKey: STORE_LANGUAGE_STORAGE_KEY });
  const selected = Object.fromEntries(Object.entries(DICTIONARIES).map(([language, dictionary]) => [language, Object.fromEntries(keys.map((key) => [key, dictionary[key] ?? EN[key] ?? key]))]));
  return Object.freeze({ languages: SUPPORTED_STORE_LANGUAGES, dictionaries: selected, storageKey: STORE_LANGUAGE_STORAGE_KEY });
}

export function t(key, params = {}, language = getStoreLanguage()) {
  const requested = dictionaryFor(language);
  const template = requested[key] ?? EN[key] ?? key;
  return interpolate(template, params);
}

function parsePluralTemplate(template, count, language) {
  const match = String(template).match(/^\{count, plural, one \{([^{}]*)\} other \{([^{}]*)\}\}$/);
  if (!match) return null;
  const category = new Intl.PluralRules(normalizeLanguage(language)).select(count);
  return (category === "one" ? match[1] : match[2]).replace(/#/g, String(count));
}

export function tPlural(key, count, params = {}, language = getStoreLanguage()) {
  const requested = dictionaryFor(language);
  const template = requested[key] ?? EN[key] ?? key;
  const plural = parsePluralTemplate(template, count, language);
  return interpolate(plural ?? template, { ...params, count });
}
