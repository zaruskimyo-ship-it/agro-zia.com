import { requireAdmin } from "../auth/admin-repository.js";
import {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  setProductStatus
} from "./store-admin-product-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

function route(pathname) {
  if (pathname === "/api/store-admin/products") return { kind: "collection" };
  const match = pathname.match(/^\/api\/store-admin\/products\/([^/]+)(?:\/(publish|archive))?$/);
  if (!match) return null;
  return { kind: match[2] ? "status" : "item", id: decodeURIComponent(match[1]), status: match[2] || null };
}

function isMutationRole(role) { return role === "admin" || role === "manager"; }

function repositoryError(error) {
  const message = error instanceof Error ? error.message : "store_admin_product_error";
  const known = new Set([
    "invalid_product_name", "invalid_product_slug", "invalid_product_price", "invalid_product_price_range",
    "invalid_price_visibility", "invalid_specifications", "invalid_product_status", "invalid_verification_level"
  ]);
  if (known.has(message)) return json({ ok: false, error: message }, 400);
  if (message.includes("UNIQUE constraint failed: commerce_products.slug")) return json({ ok: false, error: "duplicate_product_slug" }, 409);
  return json({ ok: false, error: "store_admin_product_unavailable" }, 503);
}

export async function handleStoreAdminProducts(request, env, pathname) {
  if (!pathname.startsWith("/api/store-admin/products")) return null;

  const auth = await requireAdmin(env.STORE_DB, request, ["admin", "manager", "operator"]);
  if (!auth.ok) return json({ ok: false, error: auth.status === 403 ? "forbidden" : "unauthorized" }, auth.status);

  const match = route(pathname);
  if (!match) return json({ ok: false, error: "not_found" }, 404);

  try {
    if (match.kind === "collection" && request.method === "GET") {
      return json({ ok: true, products: await listProducts(env.STORE_DB) });
    }

    if (match.kind === "collection" && request.method === "POST") {
      if (!isMutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const input = await body(request);
      if (!input) return json({ ok: false, error: "invalid_json" }, 400);
      return json({ ok: true, product: await createProduct(env.STORE_DB, input) }, 201);
    }

    if (match.kind === "item" && request.method === "GET") {
      const product = await getProductById(env.STORE_DB, match.id);
      return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
    }

    if (match.kind === "item" && request.method === "PATCH") {
      if (!isMutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const input = await body(request);
      if (!input) return json({ ok: false, error: "invalid_json" }, 400);
      const product = await updateProduct(env.STORE_DB, match.id, input);
      return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
    }

    if (match.kind === "status" && request.method === "POST") {
      if (!isMutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const product = await setProductStatus(env.STORE_DB, match.id, match.status);
      return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
    }

    return json({ ok: false, error: "method_not_allowed" }, 405);
  } catch (error) {
    return repositoryError(error);
  }
}
