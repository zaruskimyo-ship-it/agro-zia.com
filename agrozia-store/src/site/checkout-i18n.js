const CHECKOUT_RUNTIME_I18N = Object.freeze({
  en: Object.freeze({ missingReference: "Missing checkout reference.", status: "Status:", expires: "Expires:" }),
  fa: Object.freeze({ missingReference: "مرجع پرداخت پیدا نشد.", status: "وضعیت:", expires: "انقضا:" }),
  ar: Object.freeze({ missingReference: "تعذر العثور على مرجع إتمام الطلب.", status: "الحالة:", expires: "تنتهي الصلاحية:" }),
  tr: Object.freeze({ missingReference: "Ödeme referansı bulunamadı.", status: "Durum:", expires: "Son geçerlilik:" }),
  ru: Object.freeze({ missingReference: "Ссылка на оформление заказа не найдена.", status: "Статус:", expires: "Истекает:" }),
  uz: Object.freeze({ missingReference: "To‘lov rasmiylashtirish havolasi topilmadi.", status: "Holat:", expires: "Amal qilish muddati:" }),
  ckb: Object.freeze({ missingReference: "بەستەری Checkout نەدۆزرایەوە.", status: "دۆخ:", expires: "بەسەر دەچێت:" })
});

export function getCheckoutRuntimeI18n(language = "en") {
  return CHECKOUT_RUNTIME_I18N[language] || CHECKOUT_RUNTIME_I18N.en;
}
