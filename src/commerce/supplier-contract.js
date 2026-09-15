export const SUPPLIER_VERIFICATION_LEVELS = Object.freeze([
  "declared",
  "agrozia_checked",
  "third_party_verified",
]);

export const MAX_PUBLIC_PRODUCTS = 12;

const arrayFromJson = (value) => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").slice(0, 50);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 50) : [];
  } catch (_) {
    return [];
  }
};

export function publicSupplier(row, products = []) {
  if (!row || typeof row !== "object") return null;
  const level = SUPPLIER_VERIFICATION_LEVELS.includes(row.verification_level)
    ? row.verification_level
    : "declared";
  return {
    slug: row.slug,
    name: row.name,
    country: row.country || null,
    years_active: row.years_active == null ? null : Number(row.years_active),
    description: row.description || null,
    product_categories: arrayFromJson(row.product_categories_json),
    production_capacity: row.production_capacity || null,
    moq: row.moq || null,
    export_markets: arrayFromJson(row.export_markets_json),
    certifications: arrayFromJson(row.certifications_json),
    factory_capability: row.factory_capability || null,
    quality_control: row.quality_control || null,
    verification: { level, updated_at: row.verification_updated_at || null },
    products: Array.isArray(products) ? products.slice(0, MAX_PUBLIC_PRODUCTS) : [],
  };
}
