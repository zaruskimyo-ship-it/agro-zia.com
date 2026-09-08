import { getPublicSupplierBySlug } from "./supplier-repository.js";

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
    const supplier = await getPublicSupplierBySlug(env.AGROZIA_DB, slug);
    if (!supplier) return json({ error: "not_found" }, 404);
    return json({ item: supplier });
  } catch (error) {
    console.error("Public supplier lookup failed", { name: String(error?.name || "Error").slice(0, 40) });
    return json({ error: "supplier_service_unavailable" }, 503);
  }
}
