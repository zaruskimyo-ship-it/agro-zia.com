import { readSupplierSession } from "./supplier-auth.js";

export async function requireSupplier(db, request, env) {
  if (!db) return null;
  const session = await readSupplierSession(request, env);
  if (!session) return null;
  return db.prepare(`
    SELECT sa.id AS account_id, sa.supplier_id, sa.email AS account_email, sa.status AS account_status,
           s.id, s.slug, s.name, s.country, s.status
    FROM supplier_accounts sa
    JOIN commerce_suppliers s ON s.id = sa.supplier_id
    WHERE sa.supplier_id = ? AND sa.status = 'active' AND s.status <> 'archived'
    LIMIT 1
  `).bind(session.supplierId).first();
}

export function ownsSupplier(resource, supplier) {
  if (!resource || !supplier) return false;
  return String(resource.supplier_id || "") === String(supplier.supplier_id || "");
}

export function supplierUnauthorized() {
  return new Response(JSON.stringify({ error: "supplier_unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" },
  });
}

export function supplierForbidden() {
  return new Response(JSON.stringify({ error: "supplier_forbidden" }), {
    status: 403,
    headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" },
  });
}
