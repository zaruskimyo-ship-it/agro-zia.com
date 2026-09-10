import { handleCustomerAuth } from "./src/auth/customer-auth.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      let db = "not_checked";
      try {
        await env.STORE_DB.prepare("SELECT 1 AS ok").first();
        db = "ok";
      } catch {
        db = "unavailable";
      }

      return json({
        ok: true,
        service: "agrozia-store",
        environment: "foundation",
        database: db,
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname.startsWith("/api/customer/")) {
      try {
        const response = await handleCustomerAuth(request, env, url.pathname);
        if (response) return response;
      } catch {
        return json({ ok: false, error: "customer_auth_unavailable" }, 503);
      }
    }

    return new Response("Agro-Zia Store foundation is running.", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
