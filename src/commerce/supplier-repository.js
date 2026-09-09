import { MAX_PUBLIC_PRODUCTS, publicSupplier } from "./supplier-contract.js";

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function cleanSlug(value) {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  if (slug.length > 120 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) return null;
  return slug;
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) { return []; }
}

function mapSupplier(row) {
  return {
    ...row,
    product_categories_json: parseJsonArray(row.product_categories_json),
    export_markets_json: parseJsonArray(row.export_markets_json),
    certifications_json: parseJsonArray(row.certifications_json),
  };
}

export async function listPublicSuppliers(db, params = {}) {
  requireDb(db);
  const limit = Math.min(30, Math.max(1, Number.parseInt(String(params.limit || 18), 10) || 18));
  const offset = Math.min(10000, Math.max(0, Number.parseInt(String(params.offset || 0), 10) || 0));
  const country = typeof params.country === "string" ? params.country.trim().slice(0, 80) : "";
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 120) : "";
  const conditions = ["status = 'published'"];
  const values = [];
  if (country) { conditions.push("country LIKE ?"); values.push(`%${country}%`); }
  if (search) {
    conditions.push("(name LIKE ? OR country LIKE ? OR description LIKE ? OR product_categories_json LIKE ?)");
    const pattern = `%${search}%`; values.push(pattern, pattern, pattern, pattern);
  }
  const where = ` WHERE ${conditions.join(" AND ")}`;
  const count = await db.prepare(`SELECT COUNT(*) AS total FROM commerce_suppliers${where}`).bind(...values).first();
  const rows = await db.prepare(
    `SELECT id, slug, name, country, years_active, description, product_categories_json,
            production_capacity, moq, export_markets_json, certifications_json,
            factory_capability, quality_control, verification_level, verification_updated_at
       FROM commerce_suppliers${where}
      ORDER BY published_at DESC, created_at DESC
      LIMIT ? OFFSET ?`,
  ).bind(...values, limit, offset).all();
  return {
    items: (rows?.results || []).map(mapSupplier).map((row) => publicSupplier(row, [])).filter(Boolean),
    pagination: { limit, offset, total: Number(count?.total || 0) },
  };
}

export async function getPublicSupplierBySlug(db, rawSlug) {
  requireDb(db);
  const slug = cleanSlug(rawSlug);
  if (!slug) return null;
  const supplier = await db.prepare(
    `SELECT id, slug, name, country, years_active, description,
            product_categories_json, production_capacity, moq,
            export_markets_json, certifications_json, factory_capability,
            quality_control, verification_level, verification_updated_at
       FROM commerce_suppliers
      WHERE slug = ? AND status = 'published'
      LIMIT 1`,
  ).bind(slug).first();
  if (!supplier) return null;
  const productRows = await db.prepare(
    `SELECT slug, name, brand, origin_country, moq, unit,
            availability_status, lead_time, price_visibility,
            currency, price_min, price_max, short_description
       FROM commerce_products
      WHERE supplier_id = ? AND status = 'published'
      ORDER BY published_at DESC, created_at DESC
      LIMIT ${MAX_PUBLIC_PRODUCTS}`,
  ).bind(supplier.id).all();
  const products = (productRows?.results || []).map((product) => ({
    slug: product.slug,
    name: product.name,
    brand: product.brand || null,
    origin_country: product.origin_country || null,
    moq: product.moq || null,
    unit: product.unit || null,
    availability_status: product.availability_status || null,
    lead_time: product.lead_time || null,
    price_visibility: product.price_visibility || "rfq",
    currency: product.currency || null,
    price_min: product.price_min ?? null,
    price_max: product.price_max ?? null,
    short_description: product.short_description || null,
  }));
  return publicSupplier(supplier, products);
}
