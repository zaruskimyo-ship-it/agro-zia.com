import { requireAdmin } from "../auth/admin-repository.js";
import { createQuote, getQuoteById, listQuotes, setQuoteStatus, updateQuote } from "./store-admin-quote-repository.js";

function json(data, status=200) { return new Response(JSON.stringify(data), { status, headers:{"content-type":"application/json; charset=utf-8"} }); }
async function body(request) { try { return await request.json(); } catch { return null; } }
function route(pathname) {
  if (pathname === "/api/store-admin/quotes") return {kind:"collection"};
  const m = pathname.match(/^\/api\/store-admin\/quotes\/([^/]+)(?:\/(send|reject|expire|cancel))?$/);
  if (!m) return null;
  return {kind:m[2]?"status":"item", id:decodeURIComponent(m[1]), status:m[2]||null};
}
function mutationRole(role) { return role === "admin" || role === "manager"; }
function errorResponse(error) {
  const e = error instanceof Error ? error.message : "store_admin_quote_error";
  const bad = ["invalid_quote_reference","rfq_not_found","supplier_not_found","supplier_not_available","supplier_match_required","invalid_quote_product","product_not_available","invalid_quote_terms","customer_acceptance_required"];
  return json({ok:false,error:e}, bad.includes(e)?400:503);
}
export async function handleStoreAdminQuotes(request, env, pathname) {
  if (!pathname.startsWith("/api/store-admin/quotes")) return null;
  const auth = await requireAdmin(env.STORE_DB, request, ["admin","manager","operator"]);
  if (!auth.ok) return json({ok:false,error:auth.status===403?"forbidden":"unauthorized"}, auth.status);
  const r = route(pathname); if (!r) return json({ok:false,error:"not_found"},404);
  try {
    if (r.kind === "collection" && request.method === "GET") return json({ok:true,quotes:await listQuotes(env.STORE_DB)});
    if (r.kind === "collection" && request.method === "POST") {
      if (!mutationRole(auth.admin.role)) return json({ok:false,error:"forbidden"},403);
      const input=await body(request); if(!input) return json({ok:false,error:"invalid_json"},400);
      return json({ok:true,quote:await createQuote(env.STORE_DB,input)},201);
    }
    if (r.kind === "item" && request.method === "GET") { const q=await getQuoteById(env.STORE_DB,r.id); return q?json({ok:true,quote:q}):json({ok:false,error:"not_found"},404); }
    if (r.kind === "item" && request.method === "PATCH") {
      if (!mutationRole(auth.admin.role)) return json({ok:false,error:"forbidden"},403);
      const input=await body(request); if(!input) return json({ok:false,error:"invalid_json"},400);
      const q=await updateQuote(env.STORE_DB,r.id,input); return q?json({ok:true,quote:q}):json({ok:false,error:"not_found"},404);
    }
    if (r.kind === "status" && request.method === "POST") {
      if (!mutationRole(auth.admin.role)) return json({ok:false,error:"forbidden"},403);
      const map={send:"sent",reject:"rejected",expire:"expired",cancel:"cancelled"};
      const q=await setQuoteStatus(env.STORE_DB,r.id,map[r.status]); return q?json({ok:true,quote:q}):json({ok:false,error:"not_found"},404);
    }
    return json({ok:false,error:"method_not_allowed"},405);
  } catch(error) { return errorResponse(error); }
}
