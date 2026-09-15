import {
  createAdmin,
  createAdminSession,
  findAdminByEmail,
  getAdminFromSession,
  requireAdmin,
  revokeAdminSession,
  verifyAdminPassword
} from "./admin-repository.js";
import { adminTokenFromRequest, adminSessionCookie, clearAdminSessionCookie, sha256Hex } from "./admin-session.js";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

function normalizeEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function handleAdminAuth(request, env, pathname) {
  if (pathname === "/api/store-admin/login" && request.method === "POST") {
    const input = await body(request);
    const email = normalizeEmail(input?.email);
    const password = String(input?.password ?? "");
    if (!email || !password) return json({ ok: false, error: "invalid_credentials" }, 400);

    const admin = await findAdminByEmail(env.STORE_DB, email);
    if (!admin || admin.status !== "active" || !(await verifyAdminPassword(password, admin))) {
      return json({ ok: false, error: "invalid_credentials" }, 401);
    }

    const session = await createAdminSession(env.STORE_DB, admin.id);
    return json({ ok: true, admin: {
      id: admin.id, email: admin.email, name: admin.name,
      role: admin.role, status: admin.status
    } }, 200, {
      "Set-Cookie": adminSessionCookie(session.token, 60 * 60 * 8)
    });
  }

  if (pathname === "/api/store-admin/logout" && request.method === "POST") {
    await revokeAdminSession(env.STORE_DB, adminTokenFromRequest(request));
    return json({ ok: true }, 200, { "Set-Cookie": clearAdminSessionCookie() });
  }

  if (pathname === "/api/store-admin/session" && request.method === "GET") {
    const admin = await getAdminFromSession(env.STORE_DB, adminTokenFromRequest(request));
    if (!admin) return json({ ok: false, authenticated: false }, 401);
    return json({ ok: true, authenticated: true, admin });
  }

  if (pathname === "/api/store-admin/bootstrap" && request.method === "POST") {
    if (!env.STORE_ADMIN_BOOTSTRAP_KEY) {
      return json({ ok: false, error: "bootstrap_not_configured" }, 503);
    }
    const input = await body(request);
    const suppliedKey = String(input?.bootstrapKey ?? "");
    if (!suppliedKey || (await sha256Hex(suppliedKey)) !== (await sha256Hex(env.STORE_ADMIN_BOOTSTRAP_KEY))) {
      return json({ ok: false, error: "forbidden" }, 403);
    }

    const count = await env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM store_admin_users").first();
    if (Number(count?.count ?? 0) > 0) return json({ ok: false, error: "bootstrap_already_completed" }, 409);

    const email = normalizeEmail(input?.email);
    const name = String(input?.name ?? "").trim();
    const password = String(input?.password ?? "");
    if (!email || name.length < 2 || password.length < 12) {
      return json({ ok: false, error: "invalid_bootstrap_input" }, 400);
    }

    const admin = await createAdmin(env.STORE_DB, { email, name, password, role: "admin" });
    return json({ ok: true, admin }, 201);
  }

  if (pathname === "/api/store-admin/me" && request.method === "GET") {
    const auth = await requireAdmin(env.STORE_DB, request);
    if (!auth.ok) return json({ ok: false, error: auth.status === 403 ? "forbidden" : "unauthorized" }, auth.status);
    return json({ ok: true, admin: auth.admin });
  }

  return null;
}
