import { readSupplierSession } from "./supplier-auth.js";
import { requireSupplier, supplierUnauthorized } from "./supplier-ownership.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function currentSupplier(request, env) {
  if (!env.AGROZIA_DB) return null;
  return requireSupplier(env.AGROZIA_DB, request, env);
}

export async function handleSupplierWorkspaceRoute(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/supplier/workspace") return null;
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!env.AGROZIA_DB) return json({ error: "d1_unavailable" }, 503);

  const supplier = await currentSupplier(request, env);
  if (!supplier) return supplierUnauthorized();

  const [rfqs, quotes, orders] = await Promise.all([
    env.AGROZIA_DB.prepare(`
      SELECT r.id, r.status, r.product_name, r.quantity, r.destination_country,
             r.destination_location, r.created_at
      FROM commerce_rfqs r
      WHERE r.status NOT IN ('cancelled')
        AND EXISTS (
          SELECT 1 FROM commerce_rfq_supplier rs
          WHERE rs.rfq_id = r.id AND rs.supplier_id = ?
        )
      ORDER BY r.created_at DESC LIMIT 100
    `).bind(supplier.supplier_id).all(),
    env.AGROZIA_DB.prepare(`
      SELECT id, quote_number, rfq_id, product_name, quantity, total_amount_minor,
             currency, status, validity_until, created_at, updated_at
      FROM commerce_quotes
      WHERE supplier_id = ?
      ORDER BY created_at DESC LIMIT 100
    `).bind(supplier.supplier_id).all(),
    env.AGROZIA_DB.prepare(`
      SELECT id, order_number, quote_id, status, currency, total_amount_minor,
             created_at, updated_at
      FROM commerce_orders
      WHERE supplier_id = ?
      ORDER BY created_at DESC LIMIT 100
    `).bind(supplier.supplier_id).all(),
  ]);

  return json({
    ok: true,
    supplier: {
      id: supplier.supplier_id,
      name: supplier.name,
      slug: supplier.slug,
      country: supplier.country || null,
      email: supplier.account_email,
    },
    rfqs: rfqs.results || [],
    quotes: quotes.results || [],
    orders: orders.results || [],
  });
}

export async function requireSupplierSession(request, env) {
  const session = await readSupplierSession(request, env);
  return session || null;
}
