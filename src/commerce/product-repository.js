import { publicProduct } from "./product-contract.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_SEARCH = 120;

function clampLimit(value) {
  const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

function cleanSearch(value) {
  return String(value || "").trim().slice(0, MAX_SEARCH);
}

function mapRow(row) {
  if (!row) return null;
  let specifications = {};
  try {
    const parsed = JSON.parse(row.specifications_json || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) specifications = parsed;
  } catch (_) {}
  return publicProduct({ ...row, specifications });
}

export async function listPublicProducts(db, params = {}) {
  if (!db) throw new Error("d1_unavailable");

  const limit = clampLimit(params.limit);
  const offsetRaw = Number.parseInt(String(params.offset || "0"), 10);
  const offset = Number.isFinite(offsetRaw) ? Math.min(10000, Math.max(0, offsetRaw)) : 0;
  const search = cleanSearch(params.search);

  const conditions = ["status = 'published'"];
  const values = [];
  if (search) {
    conditions.push("(name LIKE ? OR brand LIKE ? OR short_description LIKE ?)");
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }

  const where = ` WHERE ${conditions.join(" AND ")}`;
  const count = await db.prepare(`SELECT COUNT(*) AS total FROM commerce_products${where}`).bind(...values).first();
  const rows = await db.prepare(
    `SELECT id, slug, name, brand, category_id, status, origin_country, moq, unit,
            availability_status, lead_time, price_visibility, currency, price_min, price_max,
            supply_capacity, incoterms, short_description, description, specifications_json,
            packaging, application, supplier_id, verification_level, verification_updated_at
     FROM commerce_products${where}
     ORDER BY published_at DESC, created_at DESC
     LIMIT ? OFFSET ?`,
  ).bind(...values, limit, offset).all();

  return {
    items: (rows?.results || []).map(mapRow).filter(Boolean),
    pagination: { limit, offset, total: Number(count?.total || 0) },
  };
}

export async function getPublicProductBySlug(db, slug) {
  if (!db) throw new Error("d1_unavailable");
  const normalizedSlug = String(slug || "").trim().slice(0, 120);
  if (!normalizedSlug || !/^[a-z0-9][a-z0-9-]{0,118}[a-z0-9]$|^[a-z0-9]$/.test(normalizedSlug)) return null;

  const row = await db.prepare(
    `SELECT id, slug, name, brand, category_id, status, origin_country, moq, unit,
            availability_status, lead_time, price_visibility, currency, price_min, price_max,
            supply_capacity, incoterms, short_description, description, specifications_json,
            packaging, application, supplier_id, verification_level, verification_updated_at
     FROM commerce_products
     WHERE slug = ? AND status = 'published'
     LIMIT 1`,
  ).bind(normalizedSlug).first();

  return mapRow(row);
}
