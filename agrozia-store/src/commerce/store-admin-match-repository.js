function nowIso() { return new Date().toISOString(); }
function idOf(value) { const id = String(value ?? "").trim(); return id && id.length <= 120 ? id : null; }
function statusOf(value) { return ["matched", "declined", "removed"].includes(value) ? value : null; }
const COLUMNS = "id, rfq_id, supplier_id, status, created_at, updated_at";
export async function listMatches(db) { const r = await db.prepare(`SELECT ${COLUMNS} FROM commerce_rfq_supplier_matches ORDER BY created_at DESC`).all(); return r.results ?? []; }
export async function getMatchById(db, id) { const v=idOf(id); return v ? db.prepare(`SELECT ${COLUMNS} FROM commerce_rfq_supplier_matches WHERE id=?1 LIMIT 1`).bind(v).first() : null; }
async function exists(db, table, id) { return !!(await db.prepare(`SELECT id FROM ${table} WHERE id=?1 LIMIT 1`).bind(id).first()); }
export async function createMatch(db, input) {
  const rfq=idOf(input?.rfq_id), supplier=idOf(input?.supplier_id); if (!rfq || !supplier) throw new Error("invalid_match_reference");
  if (!(await exists(db,"commerce_rfqs",rfq))) throw new Error("rfq_not_found");
  const s=await db.prepare("SELECT id,status FROM commerce_suppliers WHERE id=?1 LIMIT 1").bind(supplier).first();
  if (!s) throw new Error("supplier_not_found"); if (s.status === "archived") throw new Error("supplier_archived");
  const status=statusOf(input?.status) ?? "matched", id=crypto.randomUUID(), now=nowIso();
  await db.prepare(`INSERT INTO commerce_rfq_supplier_matches (id,rfq_id,supplier_id,status,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?5)`).bind(id,rfq,supplier,status,now).run();
  return getMatchById(db,id);
}
export async function updateMatch(db,id,input) { const current=await getMatchById(db,id); if(!current)return null; const status=statusOf(input?.status); if(!status)throw new Error("invalid_match_status"); await db.prepare("UPDATE commerce_rfq_supplier_matches SET status=?1,updated_at=?2 WHERE id=?3").bind(status,nowIso(),current.id).run(); return getMatchById(db,current.id); }
export async function setMatchStatus(db,id,status) { return updateMatch(db,id,{status}); }
