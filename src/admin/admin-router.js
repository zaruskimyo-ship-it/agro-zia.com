import {
  adminGetInquiry,
  adminListInquiries,
  adminLogin,
  adminLogout,
  adminSession,
} from "./admin-api.js";

/**
 * Dispatches only /api/admin/* requests.
 * Returns null for non-admin routes so the existing Worker router remains authoritative.
 */
export async function dispatchAdminRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/admin/login") return adminLogin(request, env);
  if (path === "/api/admin/logout") return adminLogout(request, env);
  if (path === "/api/admin/session") return adminSession(request, env);
  if (path === "/api/admin/inquiries") return adminListInquiries(request, env);

  const detailMatch = path.match(/^\/api\/admin\/inquiries\/(.+)$/);
  if (detailMatch) return adminGetInquiry(request, env, decodeURIComponent(detailMatch[1]));

  return null;
}
