import { getPublicSupplierBySlug, listPublicSuppliers } from "./supplier-repository.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function handlePublicSuppliers(request, env, slug = null) {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!env.AGROZIA_DB) return json({ error: "supplier_service_unavailable" }, 503);
  try {
    if (slug !== null) {
      const supplier = await getPublicSupplierBySlug(env.AGROZIA_DB, slug);
      return supplier ? json({ ok: true, item: supplier }) : json({ error: "not_found" }, 404);
    }
    const url = new URL(request.url);
    const result = await listPublicSuppliers(env.AGROZIA_DB, {
      limit: url.searchParams.get("limit"),
      offset: url.searchParams.get("offset"),
      search: url.searchParams.get("search"),
      country: url.searchParams.get("country"),
    });
    return json({ ok: true, ...result });
  } catch (error) {
    console.error("Public supplier lookup failed", { name: String(error?.name || "Error").slice(0, 40) });
    return json({ error: "supplier_service_unavailable" }, 503);
  }
}
