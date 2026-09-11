function nowIso() { return new Date().toISOString(); }

function normalizeId(value) {
  const id = String(value ?? "").trim();
  return id && id.length <= 120 ? id : null;
}

function normalizeStatus(value) {
  return ["draft", "published", "archived"].includes(value) ? value : null;
}

export async function listProducts(db) {
  return db.prepare(
    `SELECT id, name, slug, description, unit, currency, price_visibility,
            price_minor, status, created_at, updated_at
       FROM commerce_products
      ORDER BY created_at DESC`
  ).all().then((result) => result.results ?? []);
}

export async function getProductById(db, id) {
  const normalized = normalizeId(id);
  if (!normalized) return null;
  return db.prepare(
    `SELECT id, name, slug, description, unit, currency, price_visibility,
            price_minor, status, created_at, updated_at
       FROM commerce_products WHERE id = ?1 LIMIT 1`
  ).bind(normalized).first();
}

export async function createProduct(db, input) {
  const id = crypto.randomUUID();
  const now = nowIso();
  const name = String(input?.name ?? "").trim();
  if (!name) throw new Error("invalid_product_name");
  const status = normalizeStatus(input?.status) ?? "draft";
  await db.prepare(
    `INSERT INTO commerce_products
      (id, name, slug, description, unit, currency, price_visibility, price_minor, status, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)`
  ).bind(
    id, name, String(input?.slug ?? "").trim() || null,
    String(input?.description ?? "").trim() || null,
    String(input?.unit ?? "").trim() || null,
    String(input?.currency ?? "").trim() || null,
    String(input?.price_visibility ?? "hidden").trim(),
    input?.price_minor == null ? null : Number(input.price_minor),
    status, now
  ).run();
  return getProductById(db, id);
}

export async function updateProduct(db, id, input) {
  const current = await getProductById(db, id);
  if (!current) return null;
  const fields = {
    name: input?.name == null ? current.name : String(input.name).trim(),
    slug: input?.slug == null ? current.slug : String(input.slug).trim() || null,
    description: input?.description == null ? current.description : String(input.description).trim() || null,
    unit: input?.unit == null ? current.unit : String(input.unit).trim() || null,
    currency: input?.currency == null ? current.currency : String(input.currency).trim() || null,
    price_visibility: input?.price_visibility == null ? current.price_visibility : String(input.price_visibility).trim(),
    price_minor: input?.price_minor == null ? current.price_minor : Number(input.price_minor),
    status: input?.status == null ? current.status : normalizeStatus(input.status)
  };
  if (!fields.name || !fields.status) throw new Error("invalid_product_update");
  await db.prepare(
    `UPDATE commerce_products
        SET name=?1, slug=?2, description=?3, unit=?4, currency=?5,
            price_visibility=?6, price_minor=?7, status=?8, updated_at=?9
      WHERE id=?10`
  ).bind(fields.name, fields.slug, fields.description, fields.unit, fields.currency,
    fields.price_visibility, fields.price_minor, fields.status, nowIso(), id).run();
  return getProductById(db, id);
}

export async function setProductStatus(db, id, status) {
  const normalized = normalizeId(id);
  if (!normalized || !normalizeStatus(status)) return null;
  const result = await db.prepare(
    `UPDATE commerce_products SET status=?1, updated_at=?2 WHERE id=?3`
  ).bind(status, nowIso(), normalized).run();
  if (!result.meta?.changes) return null;
  return getProductById(db, normalized);
}
