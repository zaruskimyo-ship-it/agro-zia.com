import { getPublicSupplierById, listPublicSuppliers } from "./supplier-public-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=UTF-8",
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
    "x-content-type-options": "nosniff"
  }});
}

export async function handlePublicSuppliers(request, env, pathname) {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!env.STORE_DB) return json({ error: "d1_unavailable" }, 503);
  try {
    if (pathname === "/api/suppliers") {
      return json({ ok: true, items: await listPublicSuppliers(env.STORE_DB) });
    }
    if (pathname.startsWith("/api/suppliers/")) {
      const rawId = pathname.slice("/api/suppliers/".length);
      let id;
      try { id = decodeURIComponent(rawId); } catch { return json({ error: "invalid_supplier_id" }, 400); }
      if (!id || id.includes("/")) return json({ error: "invalid_supplier_id" }, 400);
      const supplier = await getPublicSupplierById(env.STORE_DB, id);
      return supplier ? json({ ok: true, supplier }) : json({ error: "not_found" }, 404);
    }
    return null;
  } catch (_) {
    return json({ error: "supplier_service_unavailable" }, 503);
  }
}
