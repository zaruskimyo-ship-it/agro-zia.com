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
  "products.priceOnRequest": "Price on request",
  "products.title": "Agricultural Products",
  "products.search": "Search products",
  "products.filterCategory": "Filter by category",
  "products.allCategories": "All categories",
  "products.sourceApi": "Live catalog",
  "products.noProducts": "No products found",
  "products.notFound": "Product not found",
  "products.unavailable": "Product unavailable",
  "products.liveCatalog": "Live Product Catalog",
  "products.liveProduct": "Live Product",
  "products.technical": "Technical",
  "products.specification": "Specifications",
  "products.commercial": "Commercial",
  "products.commercialTerms": "Commercial Terms",
  "products.availability": "Availability",
  "products.leadTime": "Lead Time",
  "products.price": "Price",
  "products.fromPrice": "From {price}",
  "products.requestQuote": "Request a Quote",
  "products.unit": "Unit",
  "products.moq": "Minimum Order Quantity",
  "products.origin": "Origin",
  "products.incoterms": "Incoterms",
  "products.supplyCapacity": "Supply Capacity",
  "products.packaging": "Packaging",
  "products.loading": "Loading product…",
  "products.connecting": "Connecting to catalog…",
  "products.emptyDescription": "No description is available for this product.",
  "products.errorTitle": "Catalog unavailable",
  "products.errorDescription": "Unable to load the live product catalog.",
  "products.submitRfq": "Submit an RFQ",
  "products.pageOf": "Page {page} of {pages}",
  "products.backToProducts": "Back to Products",
  "products.productNotFound": "The requested product was not found.",
  "products.unavailableDescription": "This product is currently unavailable.",
  "products.publishedProduct": "Published Product",
  "products.detailedSpecifications": "Detailed Specifications",
  "products.apply": "Apply",
  "products.clear": "Clear",
  "products.previous": "Previous",
  "products.next": "Next",
  "products.viewProduct": "View Product"
});

const FA = Object.freeze({
  "nav.home":"خانه","nav.products":"محصولات","nav.suppliers":"تأمین‌کنندگان","nav.rfq":"درخواست قیمت","nav.orders":"سفارش‌ها","nav.about":"درباره ما","nav.contact":"تماس","nav.cart":"سبد خرید","nav.account":"مشتری / ورود",
  "common.explore":"مشاهده محصولات","common.requestQuote":"درخواست قیمت","common.submitRfq":"ارسال درخواست قیمت","common.addToCart":"افزودن به سبد","common.viewProduct":"مشاهده محصول","common.back":"بازگشت","common.clear":"پاک کردن","common.apply":"اعمال","common.search":"جستجو","common.loading":"در حال بارگذاری","common.previous":"قبلی","common.next":"بعدی",
  "products.showing":"نمایش {start}-{end} از {total} محصول منتشرشده","products.publishedSupplier":"{count, plural, one {# تأمین‌کننده منتشرشده} other {# تأمین‌کننده منتشرشده}}","products.priceOnRequest":"قیمت پس از درخواست",
  "products.title":"محصولات کشاورزی","products.search":"جستجوی محصولات","products.filterCategory":"فیلتر بر اساس دسته‌بندی","products.allCategories":"همه دسته‌ها","products.sourceApi":"کاتالوگ زنده","products.noProducts":"محصولی یافت نشد","products.notFound":"محصول یافت نشد","products.unavailable":"محصول در دسترس نیست","products.liveCatalog":"کاتالوگ زنده محصولات","products.liveProduct":"محصول زنده","products.technical":"فنی","products.specification":"مشخصات","products.commercial":"تجاری","products.commercialTerms":"شرایط تجاری","products.availability":"موجودی","products.leadTime":"زمان تأمین","products.price":"قیمت","products.fromPrice":"از {price}","products.requestQuote":"درخواست قیمت","products.unit":"واحد","products.moq":"حداقل مقدار سفارش","products.origin":"مبدأ","products.incoterms":"اینکوترمز","products.supplyCapacity":"ظرفیت تأمین","products.packaging":"بسته‌بندی","products.loading":"در حال بارگذاری محصول…","products.connecting":"در حال اتصال به کاتالوگ…","products.emptyDescription":"توضیحی برای این محصول موجود نیست.","products.errorTitle":"کاتالوگ در دسترس نیست","products.errorDescription":"امکان بارگذاری کاتالوگ زنده محصولات وجود ندارد.","products.submitRfq":"ارسال درخواست قیمت","products.pageOf":"صفحه {page} از {pages}","products.backToProducts":"بازگشت به محصولات","products.productNotFound":"محصول موردنظر یافت نشد.","products.unavailableDescription":"این محصول در حال حاضر در دسترس نیست.","products.publishedProduct":"محصول منتشرشده","products.detailedSpecifications":"مشخصات فنی تفصیلی","products.apply":"اعمال","products.clear":"پاک کردن","products.previous":"قبلی","products.next":"بعدی","products.viewProduct":"مشاهده محصول"
});
const AR = Object.freeze({
  "nav.home":"الرئيسية","nav.products":"المنتجات","nav.suppliers":"الموردون","nav.rfq":"طلب عرض سعر","nav.orders":"الطلبات","nav.about":"من نحن","nav.contact":"اتصل بنا","nav.cart":"السلة","nav.account":"العميل / تسجيل الدخول",
  "common.explore":"استكشف المنتجات","common.requestQuote":"طلب عرض سعر","common.submitRfq":"إرسال طلب عرض سعر","common.addToCart":"أضف إلى السلة","common.viewProduct":"عرض المنتج","common.back":"رجوع","common.clear":"مسح","common.apply":"تطبيق","common.search":"بحث","common.loading":"جارٍ التحميل","common.previous":"السابق","common.next":"التالي",
  "products.showing":"عرض {start}-{end} من أصل {total} من المنتجات المنشورة","products.publishedSupplier":"{count, plural, one {# مورد منشور} other {# موردين منشورين}}","products.priceOnRequest":"السعر عند الطلب",
  "products.title":"المنتجات الزراعية","products.search":"البحث عن المنتجات","products.filterCategory":"التصفية حسب الفئة","products.allCategories":"جميع الفئات","products.sourceApi":"الكتالوج المباشر","products.noProducts":"لم يتم العثور على منتجات","products.notFound":"المنتج غير موجود","products.unavailable":"المنتج غير متاح","products.liveCatalog":"كتالوج المنتجات المباشر","products.liveProduct":"منتج مباشر","products.technical":"فني","products.specification":"المواصفات","products.commercial":"تجاري","products.commercialTerms":"الشروط التجارية","products.availability":"التوفر","products.leadTime":"مدة التوريد","products.price":"السعر","products.fromPrice":"ابتداءً من {price}","products.requestQuote":"طلب عرض سعر","products.unit":"الوحدة","products.moq":"الحد الأدنى للطلب","products.origin":"المنشأ","products.incoterms":"شروط التجارة الدولية","products.supplyCapacity":"قدرة التوريد","products.packaging":"التعبئة","products.loading":"جارٍ تحميل المنتج…","products.connecting":"جارٍ الاتصال بالكتالوج…","products.emptyDescription":"لا يتوفر وصف لهذا المنتج.","products.errorTitle":"الكتالوج غير متاح","products.errorDescription":"تعذر تحميل كتالوج المنتجات المباشر.","products.submitRfq":"إرسال طلب عرض سعر","products.pageOf":"الصفحة {page} من {pages}","products.backToProducts":"العودة إلى المنتجات","products.productNotFound":"لم يتم العثور على المنتج المطلوب.","products.unavailableDescription":"هذا المنتج غير متاح حالياً.","products.publishedProduct":"منتج منشور","products.detailedSpecifications":"المواصفات التفصيلية","products.apply":"تطبيق","products.clear":"مسح","products.previous":"السابق","products.next":"التالي","products.viewProduct":"عرض المنتج"
});
const TR = Object.freeze({
  "nav.home":"Ana Sayfa","nav.products":"Ürünler","nav.suppliers":"Tedarikçiler","nav.rfq":"RFQ / Talep","nav.orders":"Siparişler","nav.about":"Hakkımızda","nav.contact":"İletişim","nav.cart":"Sepet","nav.account":"Müşteri / Giriş",
  "common.explore":"Ürünleri İncele","common.requestQuote":"Teklif İste","common.submitRfq":"RFQ Gönder","common.addToCart":"Sepete Ekle","common.viewProduct":"Ürünü Görüntüle","common.back":"Geri","common.clear":"Temizle","common.apply":"Uygula","common.search":"Ara","common.loading":"Yükleniyor","common.previous":"Önceki","common.next":"Sonraki",
  "products.showing":"Yayınlanan {total} ürünün {start}-{end} arası gösteriliyor","products.publishedSupplier":"{count, plural, one {# yayınlanmış tedarikçi} other {# yayınlanmış tedarikçi}}","products.priceOnRequest":"Fiyat talep üzerine",
  "products.title":"Tarım Ürünleri","products.search":"Ürün ara","products.filterCategory":"Kategoriye göre filtrele","products.allCategories":"Tüm kategoriler","products.sourceApi":"Canlı katalog","products.noProducts":"Ürün bulunamadı","products.notFound":"Ürün bulunamadı","products.unavailable":"Ürün mevcut değil","products.liveCatalog":"Canlı Ürün Kataloğu","products.liveProduct":"Canlı Ürün","products.technical":"Teknik","products.specification":"Özellikler","products.commercial":"Ticari","products.commercialTerms":"Ticari şartlar","products.availability":"Bulunabilirlik","products.leadTime":"Tedarik süresi","products.price":"Fiyat","products.fromPrice":"{price} değerinden","products.requestQuote":"Teklif İste","products.unit":"Birim","products.moq":"Minimum sipariş miktarı","products.origin":"Menşe","products.incoterms":"Incoterms","products.supplyCapacity":"Tedarik kapasitesi","products.packaging":"Ambalaj","products.loading":"Ürün yükleniyor…","products.connecting":"Kataloğa bağlanılıyor…","products.emptyDescription":"Bu ürün için açıklama mevcut değil.","products.errorTitle":"Katalog kullanılamıyor","products.errorDescription":"Canlı ürün kataloğu yüklenemedi.","products.submitRfq":"RFQ Gönder","products.pageOf":"Sayfa {page} / {pages}","products.backToProducts":"Ürünlere dön","products.productNotFound":"İstenen ürün bulunamadı.","products.unavailableDescription":"Bu ürün şu anda mevcut değil.","products.publishedProduct":"Yayınlanmış ürün","products.detailedSpecifications":"Ayrıntılı özellikler","products.apply":"Uygula","products.clear":"Temizle","products.previous":"Önceki","products.next":"Sonraki","products.viewProduct":"Ürünü görüntüle"
});
const RU = Object.freeze({
  "nav.home":"Главная","nav.products":"Продукция","nav.suppliers":"Поставщики","nav.rfq":"RFQ / Запрос","nav.orders":"Заказы","nav.about":"О нас","nav.contact":"Контакты","nav.cart":"Корзина","nav.account":"Клиент / Вход",
  "common.explore":"Просмотреть продукцию","common.requestQuote":"Запросить предложение","common.submitRfq":"Отправить RFQ","common.addToCart":"Добавить в корзину","common.viewProduct":"Открыть товар","common.back":"Назад","common.clear":"Очистить","common.apply":"Применить","common.search":"Поиск","common.loading":"Загрузка","common.previous":"Назад","common.next":"Далее",
  "products.showing":"Показаны товары {start}-{end} из {total} опубликованных","products.publishedSupplier":"{count, plural, one {# опубликованный поставщик} other {# опубликованных поставщиков}}","products.priceOnRequest":"Цена по запросу",
  "products.title":"Сельскохозяйственная продукция","products.search":"Поиск продукции","products.filterCategory":"Фильтр по категории","products.allCategories":"Все категории","products.sourceApi":"Актуальный каталог","products.noProducts":"Товары не найдены","products.notFound":"Товар не найден","products.unavailable":"Товар недоступен","products.liveCatalog":"Актуальный каталог продукции","products.liveProduct":"Актуальный товар","products.technical":"Технические","products.specification":"Характеристики","products.commercial":"Коммерческие","products.commercialTerms":"Коммерческие условия","products.availability":"Наличие","products.leadTime":"Срок поставки","products.price":"Цена","products.fromPrice":"От {price}","products.requestQuote":"Запросить предложение","products.unit":"Единица","products.moq":"Минимальный объём заказа","products.origin":"Происхождение","products.incoterms":"Инкотермс","products.supplyCapacity":"Объём поставки","products.packaging":"Упаковка","products.loading":"Загрузка товара…","products.connecting":"Подключение к каталогу…","products.emptyDescription":"Описание товара отсутствует.","products.errorTitle":"Каталог недоступен","products.errorDescription":"Не удалось загрузить актуальный каталог продукции.","products.submitRfq":"Отправить RFQ","products.pageOf":"Страница {page} из {pages}","products.backToProducts":"Назад к продукции","products.productNotFound":"Запрошенный товар не найден.","products.unavailableDescription":"Этот товар сейчас недоступен.","products.publishedProduct":"Опубликованный товар","products.detailedSpecifications":"Подробные характеристики","products.apply":"Применить","products.clear":"Очистить","products.previous":"Назад","products.next":"Далее","products.viewProduct":"Открыть товар"
});
const UZ = Object.freeze({
  "nav.home":"Bosh sahifa","nav.products":"Mahsulotlar","nav.suppliers":"Yetkazib beruvchilar","nav.rfq":"RFQ / So‘rov","nav.orders":"Buyurtmalar","nav.about":"Biz haqimizda","nav.contact":"Aloqa","nav.cart":"Savat","nav.account":"Mijoz / Kirish",
  "common.explore":"Mahsulotlarni ko‘rish","common.requestQuote":"Narx so‘rash","common.submitRfq":"RFQ yuborish","common.addToCart":"Savatga qo‘shish","common.viewProduct":"Mahsulotni ko‘rish","common.back":"Orqaga","common.clear":"Tozalash","common.apply":"Qo‘llash","common.search":"Qidirish","common.loading":"Yuklanmoqda","common.previous":"Oldingi","common.next":"Keyingi",
  "products.showing":"Nashr qilingan {total} mahsulotdan {start}-{end} ko‘rsatilmoqda","products.publishedSupplier":"{count, plural, one {# ta nashr qilingan yetkazib beruvchi} other {# ta nashr qilingan yetkazib beruvchi}}","products.priceOnRequest":"Narx so‘rov asosida",
  "products.title":"Qishloq xo‘jaligi mahsulotlari","products.search":"Mahsulotlarni qidirish","products.filterCategory":"Kategoriya bo‘yicha filtrlash","products.allCategories":"Barcha kategoriyalar","products.sourceApi":"Jonli katalog","products.noProducts":"Mahsulot topilmadi","products.notFound":"Mahsulot topilmadi","products.unavailable":"Mahsulot mavjud emas","products.liveCatalog":"Jonli mahsulot katalogi","products.liveProduct":"Jonli mahsulot","products.technical":"Texnik","products.specification":"Texnik xususiyatlar","products.commercial":"Tijoriy","products.commercialTerms":"Tijoriy shartlar","products.availability":"Mavjudligi","products.leadTime":"Ta’minot muddati","products.price":"Narx","products.fromPrice":"{price} dan","products.requestQuote":"Narx so‘rash","products.unit":"Birlik","products.moq":"Minimal buyurtma miqdori","products.origin":"Kelib chiqishi","products.incoterms":"Incoterms","products.supplyCapacity":"Ta’minot quvvati","products.packaging":"Qadoqlash","products.loading":"Mahsulot yuklanmoqda…","products.connecting":"Katalogga ulanilmoqda…","products.emptyDescription":"Bu mahsulot uchun tavsif mavjud emas.","products.errorTitle":"Katalog mavjud emas","products.errorDescription":"Jonli mahsulot katalogini yuklab bo‘lmadi.","products.submitRfq":"RFQ yuborish","products.pageOf":"{page}-sahifa / {pages}","products.backToProducts":"Mahsulotlarga qaytish","products.productNotFound":"So‘ralgan mahsulot topilmadi.","products.unavailableDescription":"Bu mahsulot hozir mavjud emas.","products.publishedProduct":"Nashr qilingan mahsulot","products.detailedSpecifications":"Batafsil texnik xususiyatlar","products.apply":"Qo‘llash","products.clear":"Tozalash","products.previous":"Oldingi","products.next":"Keyingi","products.viewProduct":"Mahsulotni ko‘rish"
});
const CKB = Object.freeze({
  "nav.home":"سەرەکی","nav.products":"بەرهەمەکان","nav.suppliers":"دابینکەران","nav.rfq":"RFQ / داواکاری","nav.orders":"داواکارییەکان","nav.about":"دەربارەمان","nav.contact":"پەیوەندی","nav.cart":"سەبەت","nav.account":"کڕیار / چوونەژوورەوە",
  "common.explore":"بینینی بەرهەمەکان","common.requestQuote":"داواکاریی نرخ","common.submitRfq":"ناردنی RFQ","common.addToCart":"زیادکردن بۆ سەبەت","common.viewProduct":"بینینی بەرهەم","common.back":"گەڕانەوە","common.clear":"سڕینەوە","common.apply":"جێبەجێکردن","common.search":"گەڕان","common.loading":"بارکردن","common.previous":"پێشوو","common.next":"دواتر",
  "products.showing":"پیشاندانی {start}-{end} لە {total} بەرهەمی بڵاوکراوە","products.publishedSupplier":"{count, plural, one {# دابینکەری بڵاوکراوە} other {# دابینکەری بڵاوکراوە}}","products.priceOnRequest":"نرخ بە داواکاری",
  "products.title":"بەرهەمە کشتوکاڵییەکان","products.search":"گەڕان بەدوای بەرهەمەکان","products.filterCategory":"فلتەرکردن بە پۆل","products.allCategories":"هەموو پۆلەکان","products.sourceApi":"کاتەلۆگی زیندوو","products.noProducts":"هیچ بەرهەمێک نەدۆزرایەوە","products.notFound":"بەرهەم نەدۆزرایەوە","products.unavailable":"بەرهەم بەردەست نییە","products.liveCatalog":"کاتەلۆگی زیندووی بەرهەمەکان","products.liveProduct":"بەرهەمی زیندوو","products.technical":"تەکنیکی","products.specification":"تایبەتمەندییەکان","products.commercial":"بازرگانی","products.commercialTerms":"مەرجە بازرگانییەکان","products.availability":"بەردەستبوون","products.leadTime":"ماوەی دابینکردن","products.price":"نرخ","products.fromPrice":"لە {price}","products.requestQuote":"داواکاریی نرخ","products.unit":"یەکە","products.moq":"کەمترین بڕی داواکاری","products.origin":"سەرچاوە","products.incoterms":"ئینکۆترمز","products.supplyCapacity":"توانای دابینکردن","products.packaging":"بسته‌بەندی","products.loading":"بەرهەم بار دەکرێت…","products.connecting":"پەیوەندی بە کاتەلۆگ دەکرێت…","products.emptyDescription":"هیچ وەسفێک بۆ ئەم بەرهەمە بەردەست نییە.","products.errorTitle":"کاتەلۆگ بەردەست نییە","products.errorDescription":"نەتوانرا کاتەلۆگی زیندووی بەرهەمەکان بار بکرێت.","products.submitRfq":"ناردنی RFQ","products.pageOf":"پەڕەی {page} لە {pages}","products.backToProducts":"گەڕانەوە بۆ بەرهەمەکان","products.productNotFound":"بەرهەمی داواکراو نەدۆزرایەوە.","products.unavailableDescription":"ئەم بەرهەمە ئێستا بەردەست نییە.","products.publishedProduct":"بەرهەمی بڵاوکراوە","products.detailedSpecifications":"تایبەتمەندییە وردەکان","products.apply":"جێبەجێکردن","products.clear":"سڕینەوە","products.previous":"پێشوو","products.next":"دواتر","products.viewProduct":"بینینی بەرهەم"
});
const FLOW_EN = Object.freeze({
  "flow.rfqEyebrow":"Business Request for Quotation","flow.rfqTitle":"Tell us what you need.","flow.rfqDescription":"Submit a structured agricultural sourcing request through the Agro-Zia customer workflow.","flow.productQuantity":"1. Product & Quantity","flow.publishedProduct":"Published Product","flow.selectProduct":"Select a published product","flow.productCategory":"Product / Category","flow.productPlaceholder":"Product or category name","flow.quantity":"Quantity","flow.quantityPlaceholder":"e.g. 500 MT","flow.delivery":"2. Delivery Requirements","flow.destination":"Destination / Country","flow.deliveryPoint":"Delivery Point","flow.timing":"Required Timing","flow.timingPlaceholder":"e.g. 4 weeks","flow.technical":"3. Technical Specification","flow.technicalRequirements":"Technical requirements","flow.technicalPlaceholder":"Grade, formulation, standards, packaging, origin, certificates and other requirements","flow.packaging":"Packaging","flow.documents":"Documents / certificates required","flow.commercial":"4. Commercial Requirements","flow.privateLabel":"Private label / branding","flow.sample":"Sample required","flow.review":"5. Request Review","flow.reviewDescription":"Review the request before it is submitted to the authenticated customer RFQ API.","flow.browseProducts":"Browse Products","flow.reviewRfq":"Review RFQ","flow.rfqReview":"RFQ Review","flow.customerRfqs":"Customer RFQs","flow.submitRfq":"Submit RFQ","flow.loadingProducts":"Loading products…","flow.noProducts":"No published products are currently available. You can still use the RFQ with a product name.","flow.catalogUnavailable":"Product catalog is temporarily unavailable. Enter the product name manually below.","flow.selectOrEnter":"Please select a published product or enter a product name.","flow.reviewFirst":"Please review the RFQ first.","flow.invalidDraft":"The RFQ draft is invalid. Please start again.","flow.signInRfq":"Please sign in to your Agro-Zia customer account before submitting an RFQ.","flow.invalidRfq":"Please review the RFQ fields and try again.","flow.rfqUnavailable":"RFQ service is temporarily unavailable. No RFQ was created.","flow.rfqSuccess":"RFQ submitted successfully. Request {number} is now in the B2B workflow.","flow.networkError":"Network error. No RFQ confirmation was received; please try again.",
  "flow.cartEyebrow":"Commerce Cart","flow.cartTitle":"Your agricultural order","flow.cartLead":"Review your real cart, quantities and validated direct-sale terms before continuing to checkout.","flow.loadingCart":"Loading your cart…","flow.cartUnavailable":"Cart service unavailable.","flow.continueShopping":"Continue Shopping","flow.emptyCart":"Your cart is empty","flow.emptyCartLead":"Add a published direct-sale product to continue.","flow.cartItems":"Cart Items","flow.requestQuote":"Request a Quote Instead","flow.clearCart":"Clear Cart","flow.orderSummary":"Order Summary","flow.items":"Items","flow.currency":"Currency","flow.pending":"Pending","flow.directTerms":"Direct-sale terms validated by commerce API","flow.proceedCheckout":"Proceed to Checkout","flow.cartRule":"Only published products with final fixed pricing can enter this cart. B2B/RFQ-only products remain on the quotation path.","flow.priceValidated":"Price validated at checkout","flow.unit":"Unit","flow.product":"Product",
  "flow.checkoutEyebrow":"Commerce Checkout","flow.checkoutTitle":"Review the commercial details before placing your order.","flow.checkoutLead":"Checkout is authenticated and validates the live cart before creating a temporary checkout record.","flow.customerStep":"1. Customer","flow.deliveryStep":"2. Delivery","flow.reviewStep":"3. Review","flow.submitStep":"4. Submit","flow.customerCompany":"Customer / Company","flow.contactName":"Company / contact name","flow.contactPlaceholder":"Contact name","flow.phone":"Phone","flow.phonePlaceholder":"Phone / WhatsApp","flow.deliveryAddress":"Delivery Address","flow.country":"Country","flow.city":"City","flow.address":"Address","flow.addressPlaceholder":"Full delivery address","flow.postal":"Postal code","flow.postalOptional":"Optional","flow.checkoutNotice":"Direct Sale products are validated for published status, fixed final price, currency, availability and MOQ. B2B / Quote flows remain separate and do not bypass accepted-quote validation.","flow.createCheckout":"Create Checkout & Continue","flow.reviewCheckout":"Review your checkout before order creation.","flow.loadingCheckout":"Loading checkout…","flow.itemsLabel":"Items","flow.commercialSummary":"Commercial Summary","flow.subtotal":"Subtotal","flow.deliveryLabel":"Delivery","flow.backCart":"Back to Cart","flow.createOrder":"Create Direct Sale Order","flow.orderable":"Checkout is not orderable","flow.checkoutNotice2":"The next action creates a Direct Sale Order from this authenticated, valid checkout. B2B / accepted-quote orders use a separate endpoint and are not created here.","flow.orderConfirmation":"Direct Sale Order","flow.confirmationTitle":"Order creation is now connected to the live order API.","flow.confirmationText":"A successful Direct Sale Order is created only from an authenticated, orderable checkout. The order reference is returned by the API and displayed on the Orders page.","flow.viewOrders":"View Orders","flow.errorCreateCheckout":"Unable to create checkout: {error}","flow.errorLoadCheckout":"Unable to load checkout: {error}","flow.errorCreateOrder":"Unable to create order: {error}"
});
const FLOW_FA = Object.freeze({
  "flow.rfqEyebrow":"درخواست قیمت تجاری","flow.rfqTitle":"نیاز خود را به ما بگویید.","flow.rfqDescription":"درخواست ساختاریافته تأمین کشاورزی را از طریق فرایند مشتری آگروزیا ارسال کنید.","flow.productQuantity":"۱. محصول و مقدار","flow.publishedProduct":"محصول منتشرشده","flow.selectProduct":"انتخاب محصول منتشرشده","flow.productCategory":"محصول / دسته‌بندی","flow.productPlaceholder":"نام محصول یا دسته‌بندی","flow.quantity":"مقدار","flow.quantityPlaceholder":"مثلاً ۵۰۰ تن","flow.delivery":"۲. الزامات تحویل","flow.destination":"مقصد / کشور","flow.deliveryPoint":"نقطه تحویل","flow.timing":"زمان موردنیاز","flow.timingPlaceholder":"مثلاً ۴ هفته","flow.technical":"۳. مشخصات فنی","flow.technicalRequirements":"الزامات فنی","flow.technicalPlaceholder":"گرید، فرمولاسیون، استانداردها، بسته‌بندی، مبدأ، گواهی‌ها و سایر الزامات","flow.packaging":"بسته‌بندی","flow.documents":"اسناد / گواهی‌های موردنیاز","flow.commercial":"۴. الزامات تجاری","flow.privateLabel":"برند اختصاصی / برندسازی","flow.sample":"نمونه موردنیاز است","flow.review":"۵. بررسی درخواست","flow.reviewDescription":"درخواست را پیش از ارسال به API احراز هویت‌شده RFQ بررسی کنید.","flow.browseProducts":"مشاهده محصولات","flow.reviewRfq":"بررسی درخواست قیمت","flow.rfqReview":"بررسی درخواست قیمت","flow.customerRfqs":"درخواست‌های قیمت مشتری","flow.submitRfq":"ارسال درخواست قیمت","flow.loadingProducts":"در حال بارگذاری محصولات…","flow.noProducts":"در حال حاضر محصول منتشرشده‌ای موجود نیست. همچنان می‌توانید نام محصول را وارد کنید.","flow.catalogUnavailable":"کاتالوگ محصولات موقتاً در دسترس نیست. نام محصول را دستی وارد کنید.","flow.selectOrEnter":"یک محصول منتشرشده انتخاب کنید یا نام محصول را وارد کنید.","flow.reviewFirst":"ابتدا درخواست قیمت را بررسی کنید.","flow.invalidDraft":"پیش‌نویس درخواست قیمت معتبر نیست. دوباره شروع کنید.","flow.signInRfq":"پیش از ارسال درخواست قیمت وارد حساب مشتری آگروزیا شوید.","flow.invalidRfq":"فیلدهای درخواست قیمت را بررسی و دوباره تلاش کنید.","flow.rfqUnavailable":"سرویس درخواست قیمت موقتاً در دسترس نیست. درخواستی ایجاد نشد.","flow.rfqSuccess":"درخواست قیمت با موفقیت ارسال شد. شماره درخواست {number} وارد فرایند B2B شد.","flow.networkError":"خطای شبکه. تأییدیه‌ای برای درخواست قیمت دریافت نشد؛ دوباره تلاش کنید.",
  "flow.cartEyebrow":"سبد خرید تجاری","flow.cartTitle":"سفارش کشاورزی شما","flow.cartLead":"سبد خرید، مقادیر و شرایط فروش مستقیم تأییدشده را پیش از ادامه پرداخت بررسی کنید.","flow.loadingCart":"در حال بارگذاری سبد خرید…","flow.cartUnavailable":"سرویس سبد خرید در دسترس نیست.","flow.continueShopping":"ادامه خرید","flow.emptyCart":"سبد خرید شما خالی است","flow.emptyCartLead":"برای ادامه، یک محصول فروش مستقیم منتشرشده اضافه کنید.","flow.cartItems":"اقلام سبد خرید","flow.requestQuote":"درخواست قیمت به‌جای خرید","flow.clearCart":"خالی کردن سبد","flow.orderSummary":"خلاصه سفارش","flow.items":"اقلام","flow.currency":"ارز","flow.pending":"در انتظار","flow.directTerms":"شرایط فروش مستقیم توسط API تجاری تأیید شده است","flow.proceedCheckout":"ادامه به تسویه","flow.cartRule":"فقط محصولات منتشرشده با قیمت نهایی ثابت وارد این سبد می‌شوند. محصولات B2B/RFQ فقط از مسیر درخواست قیمت ادامه می‌یابند.","flow.priceValidated":"قیمت در مرحله تسویه تأیید می‌شود","flow.unit":"واحد","flow.product":"محصول",
  "flow.checkoutEyebrow":"تسویه تجاری","flow.checkoutTitle":"جزئیات تجاری را پیش از ثبت سفارش بررسی کنید.","flow.checkoutLead":"تسویه احراز هویت شده و سبد زنده را پیش از ایجاد رکورد موقت تسویه اعتبارسنجی می‌کند.","flow.customerStep":"۱. مشتری","flow.deliveryStep":"۲. تحویل","flow.reviewStep":"۳. بررسی","flow.submitStep":"۴. ثبت","flow.customerCompany":"مشتری / شرکت","flow.contactName":"نام شرکت / شخص تماس","flow.contactPlaceholder":"نام تماس","flow.phone":"تلفن","flow.phonePlaceholder":"تلفن / واتساپ","flow.deliveryAddress":"نشانی تحویل","flow.country":"کشور","flow.city":"شهر","flow.address":"نشانی","flow.addressPlaceholder":"نشانی کامل تحویل","flow.postal":"کد پستی","flow.postalOptional":"اختیاری","flow.checkoutNotice":"محصولات فروش مستقیم از نظر انتشار، قیمت نهایی ثابت، ارز، موجودی و حداقل سفارش اعتبارسنجی می‌شوند. مسیرهای B2B / پیش‌فاکتور جدا هستند.","flow.createCheckout":"ایجاد تسویه و ادامه","flow.reviewCheckout":"پیش از ایجاد سفارش، تسویه را بررسی کنید.","flow.loadingCheckout":"در حال بارگذاری تسویه…","flow.itemsLabel":"اقلام","flow.commercialSummary":"خلاصه تجاری","flow.subtotal":"جمع جزء","flow.deliveryLabel":"تحویل","flow.backCart":"بازگشت به سبد","flow.createOrder":"ایجاد سفارش فروش مستقیم","flow.orderable":"این تسویه قابل ثبت سفارش نیست","flow.checkoutNotice2":"اقدام بعدی یک سفارش فروش مستقیم را از این تسویه معتبر و احراز هویت‌شده ایجاد می‌کند. سفارش‌های B2B / مبتنی بر پیش‌فاکتور از مسیر جداگانه ایجاد می‌شوند.","flow.orderConfirmation":"سفارش فروش مستقیم","flow.confirmationTitle":"ایجاد سفارش اکنون به API زنده سفارش متصل است.","flow.confirmationText":"سفارش فروش مستقیم فقط از تسویه معتبر و قابل ثبت سفارش ایجاد می‌شود. مرجع سفارش از API دریافت و در صفحه سفارش‌ها نمایش داده می‌شود.","flow.viewOrders":"مشاهده سفارش‌ها","flow.errorCreateCheckout":"ایجاد تسویه ناموفق بود: {error}","flow.errorLoadCheckout":"بارگذاری تسویه ناموفق بود: {error}","flow.errorCreateOrder":"ایجاد سفارش ناموفق بود: {error}"
});
const FLOW_AR = Object.freeze(Object.fromEntries(Object.entries(FLOW_EN).map(([k,v])=>[k,v])));
const FLOW_TR = Object.freeze(Object.fromEntries(Object.entries(FLOW_EN).map(([k,v])=>[k,v])));
const FLOW_RU = Object.freeze(Object.fromEntries(Object.entries(FLOW_EN).map(([k,v])=>[k,v])));
const FLOW_UZ = Object.freeze(Object.fromEntries(Object.entries(FLOW_EN).map(([k,v])=>[k,v])));
const FLOW_CKB = Object.freeze(Object.fromEntries(Object.entries(FLOW_EN).map(([k,v])=>[k,v])));
const FLOW_TRANSLATION_OVERLAYS = {
  ar: {"flow.rfqEyebrow":"طلب عرض سعر تجاري","flow.rfqTitle":"أخبرنا بما تحتاجه.","flow.productQuantity":"١. المنتج والكمية","flow.publishedProduct":"منتج منشور","flow.selectProduct":"اختر منتجاً منشوراً","flow.quantity":"الكمية","flow.delivery":"٢. متطلبات التسليم","flow.technical":"٣. المواصفات الفنية","flow.commercial":"٤. المتطلبات التجارية","flow.review":"٥. مراجعة الطلب","flow.browseProducts":"استعراض المنتجات","flow.reviewRfq":"مراجعة طلب العرض","flow.submitRfq":"إرسال طلب العرض","flow.cartEyebrow":"سلة المشتريات التجارية","flow.cartTitle":"طلبك الزراعي","flow.emptyCart":"سلتك فارغة","flow.cartItems":"عناصر السلة","flow.clearCart":"إفراغ السلة","flow.orderSummary":"ملخص الطلب","flow.proceedCheckout":"المتابعة إلى الدفع","flow.checkoutEyebrow":"الدفع التجاري","flow.customerStep":"١. العميل","flow.deliveryStep":"٢. التسليم","flow.reviewStep":"٣. المراجعة","flow.submitStep":"٤. الإرسال","flow.createCheckout":"إنشاء الدفع والمتابعة","flow.reviewCheckout":"راجع عملية الدفع قبل إنشاء الطلب.","flow.backCart":"العودة إلى السلة","flow.createOrder":"إنشاء طلب بيع مباشر","flow.orderConfirmation":"طلب بيع مباشر","flow.viewOrders":"عرض الطلبات"},
  tr: {"flow.rfqEyebrow":"Ticari Teklif Talebi","flow.rfqTitle":"İhtiyacınızı bize bildirin.","flow.productQuantity":"1. Ürün ve Miktar","flow.publishedProduct":"Yayınlanmış Ürün","flow.selectProduct":"Yayınlanmış ürün seçin","flow.quantity":"Miktar","flow.delivery":"2. Teslimat Gereksinimleri","flow.technical":"3. Teknik Özellikler","flow.commercial":"4. Ticari Gereksinimler","flow.review":"5. Talep İncelemesi","flow.browseProducts":"Ürünlere Göz At","flow.reviewRfq":"RFQ'yu İncele","flow.submitRfq":"RFQ Gönder","flow.cartEyebrow":"Ticari Sepet","flow.cartTitle":"Tarım siparişiniz","flow.emptyCart":"Sepetiniz boş","flow.cartItems":"Sepet Ürünleri","flow.clearCart":"Sepeti Temizle","flow.orderSummary":"Sipariş Özeti","flow.proceedCheckout":"Ödemeye Geç","flow.checkoutEyebrow":"Ticari Ödeme","flow.customerStep":"1. Müşteri","flow.deliveryStep":"2. Teslimat","flow.reviewStep":"3. İnceleme","flow.submitStep":"4. Gönderim","flow.createCheckout":"Ödemeyi Oluştur ve Devam Et","flow.reviewCheckout":"Sipariş oluşturmadan önce ödemenizi inceleyin.","flow.backCart":"Sepete Dön","flow.createOrder":"Doğrudan Satış Siparişi Oluştur","flow.orderConfirmation":"Doğrudan Satış Siparişi","flow.viewOrders":"Siparişleri Görüntüle"},
  ru: {"flow.rfqEyebrow":"Коммерческий запрос предложения","flow.rfqTitle":"Расскажите, что вам нужно.","flow.productQuantity":"1. Товар и количество","flow.publishedProduct":"Опубликованный товар","flow.selectProduct":"Выберите опубликованный товар","flow.quantity":"Количество","flow.delivery":"2. Требования к поставке","flow.technical":"3. Технические характеристики","flow.commercial":"4. Коммерческие требования","flow.review":"5. Проверка запроса","flow.browseProducts":"Просмотреть продукцию","flow.reviewRfq":"Проверить RFQ","flow.submitRfq":"Отправить RFQ","flow.cartEyebrow":"Коммерческая корзина","flow.cartTitle":"Ваш сельскохозяйственный заказ","flow.emptyCart":"Корзина пуста","flow.cartItems":"Товары в корзине","flow.clearCart":"Очистить корзину","flow.orderSummary":"Итоги заказа","flow.proceedCheckout":"Перейти к оформлению","flow.checkoutEyebrow":"Коммерческое оформление","flow.customerStep":"1. Клиент","flow.deliveryStep":"2. Доставка","flow.reviewStep":"3. Проверка","flow.submitStep":"4. Отправка","flow.createCheckout":"Создать оформление и продолжить","flow.reviewCheckout":"Проверьте оформление перед созданием заказа.","flow.backCart":"Назад в корзину","flow.createOrder":"Создать заказ прямой продажи","flow.orderConfirmation":"Заказ прямой продажи","flow.viewOrders":"Просмотреть заказы"},
  uz: {"flow.rfqEyebrow":"Tijoriy narx so‘rovi","flow.rfqTitle":"Sizga nima kerakligini ayting.","flow.productQuantity":"1. Mahsulot va miqdor","flow.publishedProduct":"Nashr qilingan mahsulot","flow.selectProduct":"Nashr qilingan mahsulotni tanlang","flow.quantity":"Miqdor","flow.delivery":"2. Yetkazib berish talablari","flow.technical":"3. Texnik xususiyatlar","flow.commercial":"4. Tijoriy talablar","flow.review":"5. So‘rovni ko‘rib chiqish","flow.browseProducts":"Mahsulotlarni ko‘rish","flow.reviewRfq":"RFQni ko‘rib chiqish","flow.submitRfq":"RFQ yuborish","flow.cartEyebrow":"Tijoriy savat","flow.cartTitle":"Sizning qishloq xo‘jaligi buyurtmangiz","flow.emptyCart":"Savatingiz bo‘sh","flow.cartItems":"Savatdagi mahsulotlar","flow.clearCart":"Savatni tozalash","flow.orderSummary":"Buyurtma xulosasi","flow.proceedCheckout":"To‘lovga o‘tish","flow.checkoutEyebrow":"Tijoriy to‘lov","flow.customerStep":"1. Mijoz","flow.deliveryStep":"2. Yetkazib berish","flow.reviewStep":"3. Ko‘rib chiqish","flow.submitStep":"4. Yuborish","flow.createCheckout":"To‘lovni yaratish va davom etish","flow.reviewCheckout":"Buyurtma yaratishdan oldin to‘lovni tekshiring.","flow.backCart":"Savatga qaytish","flow.createOrder":"To‘g‘ridan-to‘g‘ri sotuv buyurtmasini yaratish","flow.orderConfirmation":"To‘g‘ridan-to‘g‘ri sotuv buyurtmasi","flow.viewOrders":"Buyurtmalarni ko‘rish"},
  ckb: {"flow.rfqEyebrow":"داواکاریی نرخی بازرگانی","flow.rfqTitle":"پێمان بڵێ چی دەوێت.","flow.productQuantity":"١. بەرهەم و بڕ","flow.publishedProduct":"بەرهەمی بڵاوکراوە","flow.selectProduct":"بەرهەمێکی بڵاوکراوە هەڵبژێرە","flow.quantity":"بڕ","flow.delivery":"٢. پێداویستییەکانی گەیاندن","flow.technical":"٣. تایبەتمەندییە تەکنیکییەکان","flow.commercial":"٤. پێداویستییە بازرگانییەکان","flow.review":"٥. پێداچوونەوەی داواکاری","flow.browseProducts":"بینینی بەرهەمەکان","flow.reviewRfq":"پێداچوونەوەی RFQ","flow.submitRfq":"ناردنی RFQ","flow.cartEyebrow":"سەبەتی بازرگانی","flow.cartTitle":"داواکاریی کشتوکاڵیی تۆ","flow.emptyCart":"سەبەتەکەت بەتاڵە","flow.cartItems":"بەرهەمەکانی سەبەت","flow.clearCart":"بەتاڵکردنەوەی سەبەت","flow.orderSummary":"پوختەی داواکاری","flow.proceedCheckout":"بڕۆ بۆ پارەدان","flow.checkoutEyebrow":"پارەدانی بازرگانی","flow.customerStep":"١. کڕیار","flow.deliveryStep":"٢. گەیاندن","flow.reviewStep":"٣. پێداچوونەوە","flow.submitStep":"٤. ناردن","flow.createCheckout":"دروستکردنی پارەدان و بەردەوامبوون","flow.reviewCheckout":"پێش دروستکردنی داواکاری، پارەدانەکەت پشکنە.","flow.backCart":"گەڕانەوە بۆ سەبەت","flow.createOrder":"دروستکردنی داواکاری فرۆشتنی ڕاستەوخۆ","flow.orderConfirmation":"داواکاری فرۆشتنی ڕاستەوخۆ","flow.viewOrders":"بینینی داواکارییەکان"}
};
const FLOW_DICTIONARIES = Object.freeze({en:FLOW_EN,fa:FLOW_FA,ar:Object.freeze({...FLOW_EN,...FLOW_TRANSLATION_OVERLAYS.ar}),tr:Object.freeze({...FLOW_EN,...FLOW_TRANSLATION_OVERLAYS.tr}),ru:Object.freeze({...FLOW_EN,...FLOW_TRANSLATION_OVERLAYS.ru}),uz:Object.freeze({...FLOW_EN,...FLOW_TRANSLATION_OVERLAYS.uz}),ckb:Object.freeze({...FLOW_EN,...FLOW_TRANSLATION_OVERLAYS.ckb})});
const DICTIONARIES = Object.freeze(Object.fromEntries(Object.entries({ en: EN, fa: FA, ar: AR, tr: TR, ru: RU, uz: UZ, ckb: CKB }).map(([lang,dict]) => [lang, Object.freeze({...dict, ...FLOW_DICTIONARIES[lang]})])));

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

export function resolveStoreLanguage(value) {
  if (value && typeof value === "object") {
    if (typeof value.url === "string") {
      try {
        const url = new URL(value.url, "https://agrozia-store.invalid");
        if (url.searchParams.get("lang")) return normalizeLanguage(url.searchParams.get("lang"));
      } catch {}
    }
    if (typeof value.get === "function") {
      const fromHeader = value.get("accept-language");
      if (fromHeader) return normalizeLanguage(fromHeader);
      const fromQuery = value.get("lang");
      if (fromQuery) return normalizeLanguage(fromQuery);
    }
  }
  if (typeof value === "string") {
    const candidate = value.split(",")[0].trim().split("-")[0];
    return normalizeLanguage(candidate);
  }
  return "en";
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
