function nowIso() { return new Date().toISOString(); }

function normalizeId(value) {
  const id = String(value ?? "").trim();
  return id && id.length <= 120 ? id : null;
}

function normalizeStatus(value) {
  return ["draft", "published", "archived"].includes(value) ? value : null;
}

function clean(value) {
  return value == null || String(value).trim() === "" ? null : String(value).trim();
}

const COLUMNS = "id, name, status, country, created_at, updated_at";

export async function listSuppliers(db) {
  const result = await db.prepare(`SELECT ${COLUMNS} FROM commerce_suppliers ORDER BY created_at DESC`).all();
  return result.results ?? [];
}

export async function getSupplierById(db, id) {
  const normalized = normalizeId(id);
  if (!normalized) return null;
  return db.prepare(`SELECT ${COLUMNS} FROM commerce_suppliers WHERE id = ?1 LIMIT 1`).bind(normalized).first();
}

export async function createSupplier(db, input) {
  const name = String(input?.name ?? "").trim();
  if (!name) throw new Error("invalid_supplier_name");
  const status = normalizeStatus(input?.status) ?? "draft";
  const id = crypto.randomUUID();
  const now = nowIso();
  await db.prepare(`INSERT INTO commerce_suppliers (id, name, status, country, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?5)`).bind(id, name, status, clean(input?.country), now).run();
  return getSupplierById(db, id);
}

export async function updateSupplier(db, id, input) {
  const normalizedId = normalizeId(id);
  const current = await getSupplierById(db, normalizedId);
  if (!current) return null;
  const name = input?.name == null ? current.name : String(input.name).trim();
  const status = input?.status == null ? current.status : normalizeStatus(input.status);
  if (!name) throw new Error("invalid_supplier_name");
  if (!status) throw new Error("invalid_supplier_status");
  await db.prepare(`UPDATE commerce_suppliers SET name=?1, status=?2, country=?3, updated_at=?4 WHERE id=?5`)
    .bind(name, status, input?.country == null ? current.country : clean(input.country), nowIso(), normalizedId).run();
  return getSupplierById(db, normalizedId);
}

export async function setSupplierStatus(db, id, status) {
  const normalizedId = normalizeId(id);
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedId || !normalizedStatus) return null;
  const current = await getSupplierById(db, normalizedId);
  if (!current) return null;
  await db.prepare("UPDATE commerce_suppliers SET status=?1, updated_at=?2 WHERE id=?3")
    .bind(normalizedStatus, nowIso(), normalizedId).run();
  return getSupplierById(db, normalizedId);
}
