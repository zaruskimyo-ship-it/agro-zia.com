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

function productId(pathname) {
  const match = pathname.match(/^\/api\/store-admin\/products\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function handleStoreAdminProducts(request, env, pathname) {
  if (!pathname.startsWith("/api/store-admin/products")) return null;

  const auth = await requireAdmin(env.STORE_DB, request, ["admin", "manager", "operator"]);
  if (!auth.ok) return json({ ok: false, error: auth.status === 403 ? "forbidden" : "unauthorized" }, auth.status);

  const id = productId(pathname);

  if (pathname === "/api/store-admin/products" && request.method === "GET") {
    return json({ ok: true, products: await listProducts(env.STORE_DB) });
  }

  if (pathname === "/api/store-admin/products" && request.method === "POST") {
    if (!["admin", "manager"].includes(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
    const input = await body(request);
    if (!input) return json({ ok: false, error: "invalid_json" }, 400);
    return json({ ok: true, product: await createProduct(env.STORE_DB, input) }, 201);
  }

  if (id && request.method === "GET") {
    const product = await getProductById(env.STORE_DB, id);
    return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
  }

  if (id && request.method === "PATCH") {
    if (!["admin", "manager"].includes(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
    const input = await body(request);
    if (!input) return json({ ok: false, error: "invalid_json" }, 400);
    const product = await updateProduct(env.STORE_DB, id, input);
    return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
  }

  if (id && request.method === "POST" && pathname.endsWith("/publish")) {
    if (!["admin", "manager"].includes(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
    const product = await setProductStatus(env.STORE_DB, id, "published");
    return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
  }

  if (id && request.method === "POST" && pathname.endsWith("/archive")) {
    if (!["admin", "manager"].includes(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
    const product = await setProductStatus(env.STORE_DB, id, "archived");
    return product ? json({ ok: true, product }) : json({ ok: false, error: "not_found" }, 404);
  }

  return json({ ok: false, error: "method_not_allowed" }, 405);
}
