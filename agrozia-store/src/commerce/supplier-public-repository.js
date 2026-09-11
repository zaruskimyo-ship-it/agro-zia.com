const COLUMNS = "id, name, country, status, created_at, updated_at";

function normalizeId(value) {
  const id = String(value ?? "").trim();
  return id && id.length <= 120 ? id : null;
}

function mapSupplier(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    country: row.country || null,
    status: row.status
  };
}

export async function listPublicSuppliers(db) {
  if (!db) throw new Error("d1_unavailable");
  const result = await db.prepare(`SELECT ${COLUMNS} FROM commerce_suppliers WHERE status = 'published' ORDER BY name ASC`).all();
  return (result?.results || []).map(mapSupplier).filter(Boolean);
}

export async function getPublicSupplierById(db, id) {
  if (!db) throw new Error("d1_unavailable");
  const normalized = normalizeId(id);
  if (!normalized) return null;
  const row = await db.prepare(`SELECT ${COLUMNS} FROM commerce_suppliers WHERE id = ?1 AND status = 'published' LIMIT 1`).bind(normalized).first();
  return mapSupplier(row);
}
