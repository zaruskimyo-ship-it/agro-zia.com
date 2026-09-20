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

const DICTIONARIES = Object.freeze({ en: EN });

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
