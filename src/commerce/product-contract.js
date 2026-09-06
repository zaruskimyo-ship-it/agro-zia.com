const PRODUCT_STATUSES = new Set(["draft", "published", "archived"]);
const PRICE_VISIBILITY = new Set(["hidden", "starting_from", "fixed", "rfq"]);
const VERIFICATION_LEVELS = new Set(["declared", "agrozia_checked", "third_party_verified"]);

const MAX = {
  slug: 120,
  name: 200,
  brand: 160,
  originCountry: 80,
  moq: 120,
  unit: 40,
  leadTime: 120,
  currency: 10,
  supplyCapacity: 160,
  incoterms: 40,
  shortDescription: 500,
  description: 5000,
  packaging: 500,
  application: 1000,
  originStatement: 500,
};

function clean(value, maximum) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maximum);
}

function optionalPositiveNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function safeJson(value) {
  if (value === undefined || value === null) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

export function normalizeProduct(input = {}) {
  const status = PRODUCT_STATUSES.has(input.status) ? input.status : "draft";
  const priceVisibility = PRICE_VISIBILITY.has(input.price_visibility) ? input.price_visibility : "rfq";
  const verificationLevel = VERIFICATION_LEVELS.has(input.verification_level) ? input.verification_level : "declared";

  return {
    id: clean(input.id, 120),
    slug: clean(input.slug, MAX.slug),
    name: clean(input.name, MAX.name),
    brand: clean(input.brand, MAX.brand),
    category_id: clean(input.category_id, 120),
    status,
    origin_country: clean(input.origin_country, MAX.originCountry),
    moq: clean(input.moq, MAX.moq),
    unit: clean(input.unit, MAX.unit),
    availability_status: clean(input.availability_status, 60),
    lead_time: clean(input.lead_time, MAX.leadTime),
    price_visibility: priceVisibility,
    currency: clean(input.currency, MAX.currency).toUpperCase(),
    price_min: optionalPositiveNumber(input.price_min),
    price_max: optionalPositiveNumber(input.price_max),
    supply_capacity: clean(input.supply_capacity, MAX.supplyCapacity),
    incoterms: clean(input.incoterms, MAX.incoterms),
    short_description: clean(input.short_description, MAX.shortDescription),
    description: clean(input.description, MAX.description),
    specifications: safeJson(input.specifications),
    packaging: clean(input.packaging, MAX.packaging),
    application: clean(input.application, MAX.application),
    supplier_id: clean(input.supplier_id, 120),
    origin_statement: clean(input.origin_statement, MAX.originStatement),
    verification_level: verificationLevel,
    verification_updated_at: clean(input.verification_updated_at, 40),
  };
}

export function isPublicProduct(product) {
  return Boolean(product && product.status === "published" && product.name && product.slug);
}

export function publicProduct(product) {
  const normalized = normalizeProduct(product);
  if (!isPublicProduct(normalized)) return null;

  return {
    id: normalized.id,
    slug: normalized.slug,
    name: normalized.name,
    brand: normalized.brand,
    category_id: normalized.category_id,
    origin_country: normalized.origin_country,
    moq: normalized.moq,
    unit: normalized.unit,
    availability_status: normalized.availability_status,
    lead_time: normalized.lead_time,
    price_visibility: normalized.price_visibility,
    currency: normalized.currency,
    price_min: normalized.price_min,
    price_max: normalized.price_max,
    supply_capacity: normalized.supply_capacity,
    incoterms: normalized.incoterms,
    short_description: normalized.short_description,
    description: normalized.description,
    specifications: normalized.specifications,
    packaging: normalized.packaging,
    application: normalized.application,
    supplier_id: normalized.supplier_id,
    verification_level: normalized.verification_level,
    verification_updated_at: normalized.verification_updated_at,
  };
}

export { PRODUCT_STATUSES, PRICE_VISIBILITY, VERIFICATION_LEVELS };
