function nowIso() { return new Date().toISOString(); }

const PRODUCT_COLUMNS = `id, slug, name, brand, category_id, status, origin_country, moq, unit,
  availability_status, lead_time, price_visibility, currency, price_min, price_max,
  supply_capacity, incoterms, short_description, description, specifications_json,
  packaging, application, supplier_id, origin_statement, verification_level,
  verification_updated_at, created_at, updated_at, published_at`;

function normalizeId(value) {
  const id = String(value ?? "").trim();
  return id && id.length <= 120 ? id : null;
}

function normalizeStatus(value) {
  return ["draft", "published", "archived"].includes(value) ? value : null;
}

function normalizePrice(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error("invalid_product_price");
  return number;
}

function normalizePriceVisibility(value) {
  const visibility = String(value ?? "rfq").trim();
  return ["hidden", "starting_from", "fixed", "rfq"].includes(visibility) ? visibility : null;
}

function normalizeJson(value) {
  if (value == null || value === "") return "{}";
  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid_specifications");
    return JSON.stringify(parsed);
  }
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_specifications");
  return JSON.stringify(value);
}

function clean(value) {
  return value == null || String(value).trim() === "" ? null : String(value).trim();
}

function validatePrices(min, max) {
  if (min != null && max != null && max < min) throw new Error("invalid_product_price_range");
}

export async function listProducts(db) {
  return db.prepare(`SELECT ${PRODUCT_COLUMNS} FROM commerce_products ORDER BY created_at DESC`)
    .all().then((result) => result.results ?? []);
}

export async function getProductById(db, id) {
  const normalized = normalizeId(id);
  if (!normalized) return null;
  return db.prepare(`SELECT ${PRODUCT_COLUMNS} FROM commerce_products WHERE id = ?1 LIMIT 1`)
    .bind(normalized).first();
}

export async function createProduct(db, input) {
  const id = crypto.randomUUID();
  const now = nowIso();
  const name = String(input?.name ?? "").trim();
  const slug = String(input?.slug ?? "").trim();
  if (!name) throw new Error("invalid_product_name");
  if (!slug || !/^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/.test(slug)) throw new Error("invalid_product_slug");

  const status = normalizeStatus(input?.status) ?? "draft";
  const priceVisibility = normalizePriceVisibility(input?.price_visibility);
  if (!priceVisibility) throw new Error("invalid_price_visibility");
  const priceMin = normalizePrice(input?.price_min);
  const priceMax = normalizePrice(input?.price_max);
  validatePrices(priceMin, priceMax);
  const specifications = normalizeJson(input?.specifications_json ?? input?.specifications);

  await db.prepare(`INSERT INTO commerce_products
    (id, slug, name, brand, category_id, status, origin_country, moq, unit,
     availability_status, lead_time, price_visibility, currency, price_min, price_max,
     supply_capacity, incoterms, short_description, description, specifications_json,
     packaging, application, supplier_id, origin_statement, verification_level,
     verification_updated_at, created_at, updated_at, published_at)
    VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29)`)
    .bind(id, slug, name, clean(input?.brand), clean(input?.category_id), status, clean(input?.origin_country), clean(input?.moq),
      clean(input?.unit), clean(input?.availability_status), clean(input?.lead_time), priceVisibility, clean(input?.currency),
      priceMin, priceMax, clean(input?.supply_capacity), clean(input?.incoterms), clean(input?.short_description),
      clean(input?.description), specifications, clean(input?.packaging), clean(input?.application), clean(input?.supplier_id),
      clean(input?.origin_statement), input?.verification_level ?? "declared", clean(input?.verification_updated_at), now, now,
      status === "published" ? now : null).run();
  return getProductById(db, id);
}

export async function updateProduct(db, id, input) {
  const normalizedId = normalizeId(id);
  const current = await getProductById(db, normalizedId);
  if (!current) return null;

  const status = input?.status == null ? current.status : normalizeStatus(input.status);
  if (!status) throw new Error("invalid_product_status");
  const priceVisibility = input?.price_visibility == null ? current.price_visibility : normalizePriceVisibility(input.price_visibility);
  if (!priceVisibility) throw new Error("invalid_price_visibility");
  const priceMin = input?.price_min == null ? current.price_min : normalizePrice(input.price_min);
  const priceMax = input?.price_max == null ? current.price_max : normalizePrice(input.price_max);
  validatePrices(priceMin, priceMax);

  const fields = {
    slug: input?.slug == null ? current.slug : String(input.slug).trim(),
    name: input?.name == null ? current.name : String(input.name).trim(),
    brand: input?.brand == null ? current.brand : clean(input.brand),
    category_id: input?.category_id == null ? current.category_id : clean(input.category_id),
    origin_country: input?.origin_country == null ? current.origin_country : clean(input.origin_country),
    moq: input?.moq == null ? current.moq : clean(input.moq),
    unit: input?.unit == null ? current.unit : clean(input.unit),
    availability_status: input?.availability_status == null ? current.availability_status : clean(input.availability_status),
    lead_time: input?.lead_time == null ? current.lead_time : clean(input.lead_time),
    supply_capacity: input?.supply_capacity == null ? current.supply_capacity : clean(input.supply_capacity),
    incoterms: input?.incoterms == null ? current.incoterms : clean(input.incoterms),
    short_description: input?.short_description == null ? current.short_description : clean(input.short_description),
    description: input?.description == null ? current.description : clean(input.description),
    specifications_json: input?.specifications_json == null && input?.specifications == null ? current.specifications_json : normalizeJson(input.specifications_json ?? input.specifications),
    packaging: input?.packaging == null ? current.packaging : clean(input.packaging),
    application: input?.application == null ? current.application : clean(input.application),
    supplier_id: input?.supplier_id == null ? current.supplier_id : clean(input.supplier_id),
    origin_statement: input?.origin_statement == null ? current.origin_statement : clean(input.origin_statement),
    verification_level: input?.verification_level == null ? current.verification_level : input.verification_level,
    verification_updated_at: input?.verification_updated_at == null ? current.verification_updated_at : clean(input.verification_updated_at),
    currency: input?.currency == null ? current.currency : clean(input.currency)
  };
  if (!fields.name) throw new Error("invalid_product_name");
  if (!fields.slug || !/^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/.test(fields.slug)) throw new Error("invalid_product_slug");
  if (!["declared", "agrozia_checked", "third_party_verified"].includes(fields.verification_level)) throw new Error("invalid_verification_level");

  const publishedAt = status === "published" ? (current.published_at || nowIso()) : current.published_at;
  await db.prepare(`UPDATE commerce_products SET
    slug=?1, name=?2, brand=?3, category_id=?4, status=?5, origin_country=?6, moq=?7, unit=?8,
    availability_status=?9, lead_time=?10, price_visibility=?11, currency=?12, price_min=?13, price_max=?14,
    supply_capacity=?15, incoterms=?16, short_description=?17, description=?18, specifications_json=?19,
    packaging=?20, application=?21, supplier_id=?22, origin_statement=?23, verification_level=?24,
    verification_updated_at=?25, updated_at=?26, published_at=?27 WHERE id=?28`)
    .bind(fields.slug, fields.name, fields.brand, fields.category_id, status, fields.origin_country, fields.moq, fields.unit,
      fields.availability_status, fields.lead_time, priceVisibility, fields.currency, priceMin, priceMax, fields.supply_capacity,
      fields.incoterms, fields.short_description, fields.description, fields.specifications_json, fields.packaging, fields.application,
      fields.supplier_id, fields.origin_statement, fields.verification_level, fields.verification_updated_at, nowIso(), publishedAt, normalizedId).run();
  return getProductById(db, normalizedId);
}

export async function setProductStatus(db, id, status) {
  const normalizedId = normalizeId(id);
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedId || !normalizedStatus) return null;
  const current = await getProductById(db, normalizedId);
  if (!current) return null;
  const now = nowIso();
  const publishedAt = normalizedStatus === "published" ? (current.published_at || now) : current.published_at;
  await db.prepare(`UPDATE commerce_products SET status=?1, updated_at=?2, published_at=?3 WHERE id=?4`)
    .bind(normalizedStatus, now, publishedAt, normalizedId).run();
  return getProductById(db, normalizedId);
}
