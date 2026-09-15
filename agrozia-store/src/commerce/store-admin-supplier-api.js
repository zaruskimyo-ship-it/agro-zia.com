import { requireAdmin } from "../auth/admin-repository.js";
import {
  createSupplier,
  getSupplierById,
  listSuppliers,
  updateSupplier,
  setSupplierStatus
} from "./store-admin-supplier-repository.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

function route(pathname) {
  if (pathname === "/api/store-admin/suppliers") return { kind: "collection" };
  const match = pathname.match(/^\/api\/store-admin\/suppliers\/([^/]+)(?:\/(publish|archive))?$/);
  if (!match) return null;
  return { kind: match[2] ? "status" : "item", id: decodeURIComponent(match[1]), status: match[2] || null };
}

function mutationRole(role) { return role === "admin" || role === "manager"; }

function repositoryError(error) {
  const message = error instanceof Error ? error.message : "store_admin_supplier_error";
  if (["invalid_supplier_name", "invalid_supplier_status"].includes(message)) return json({ ok: false, error: message }, 400);
  return json({ ok: false, error: "store_admin_supplier_unavailable" }, 503);
}

export async function handleStoreAdminSuppliers(request, env, pathname) {
  if (!pathname.startsWith("/api/store-admin/suppliers")) return null;
  const auth = await requireAdmin(env.STORE_DB, request, ["admin", "manager", "operator"]);
  if (!auth.ok) return json({ ok: false, error: auth.status === 403 ? "forbidden" : "unauthorized" }, auth.status);
  const match = route(pathname);
  if (!match) return json({ ok: false, error: "not_found" }, 404);

  try {
    if (match.kind === "collection" && request.method === "GET") return json({ ok: true, suppliers: await listSuppliers(env.STORE_DB) });
    if (match.kind === "collection" && request.method === "POST") {
      if (!mutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const input = await body(request);
      if (!input) return json({ ok: false, error: "invalid_json" }, 400);
      return json({ ok: true, supplier: await createSupplier(env.STORE_DB, input) }, 201);
    }
    if (match.kind === "item" && request.method === "GET") {
      const supplier = await getSupplierById(env.STORE_DB, match.id);
      return supplier ? json({ ok: true, supplier }) : json({ ok: false, error: "not_found" }, 404);
    }
    if (match.kind === "item" && request.method === "PATCH") {
      if (!mutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const input = await body(request);
      if (!input) return json({ ok: false, error: "invalid_json" }, 400);
      const supplier = await updateSupplier(env.STORE_DB, match.id, input);
      return supplier ? json({ ok: true, supplier }) : json({ ok: false, error: "not_found" }, 404);
    }
    if (match.kind === "status" && request.method === "POST") {
      if (!mutationRole(auth.admin.role)) return json({ ok: false, error: "forbidden" }, 403);
      const supplier = await setSupplierStatus(env.STORE_DB, match.id, match.status);
      return supplier ? json({ ok: true, supplier }) : json({ ok: false, error: "not_found" }, 404);
    }
    return json({ ok: false, error: "method_not_allowed" }, 405);
  } catch (error) {
    return repositoryError(error);
  }
}
