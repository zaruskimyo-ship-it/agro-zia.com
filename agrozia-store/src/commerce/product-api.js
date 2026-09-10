import { getPublicProductBySlug, listPublicCategories, listPublicProducts } from "./product-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=UTF-8",
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
    "x-content-type-options": "nosniff"
  }});
}

export async function handlePublicProducts(request, env, pathname) {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!env.STORE_DB) return json({ error: "d1_unavailable" }, 503);
  try {
    if (pathname === "/api/categories") {
      return json({ ok: true, items: await listPublicCategories(env.STORE_DB) });
    }
    if (pathname === "/api/products") {
      const url = new URL(request.url);
      const result = await listPublicProducts(env.STORE_DB, {
        limit: url.searchParams.get("limit"), offset: url.searchParams.get("offset"), search: url.searchParams.get("search")
      });
      return json({ ok: true, ...result });
    }
    if (pathname.startsWith("/api/products/")) {
      const rawSlug = pathname.slice("/api/products/".length);
      let slug;
      try { slug = decodeURIComponent(rawSlug); } catch { return json({ error: "invalid_slug" }, 400); }
      if (!slug || slug.includes("/")) return json({ error: "invalid_slug" }, 400);
      const product = await getPublicProductBySlug(env.STORE_DB, slug);
      return product ? json({ ok: true, product }) : json({ error: "not_found" }, 404);
    }
    return null;
  } catch (_) { return json({ error: "product_service_unavailable" }, 503); }
}
