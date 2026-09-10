import { getCustomerFromSession } from "../auth/customer-repository.js";
import { createRfq, listCustomerRfqs } from "./rfq-repository.js";

const MAX_BODY_BYTES = 32 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function readJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    throw new Error("unsupported_media_type");
  }
  const contentLength = Number.parseInt(request.headers.get("content-length") || "0", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BODY_BYTES) throw new Error("payload_too_large");
  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch (_) {
    throw new Error("invalid_json");
  }
}

function cookieToken(request) {
  const value = request.headers.get("Cookie") || "";
  const match = value.match(/(?:^|;\s*)agz_customer_session=([^;]+)/);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch (_) { return null; }
}

async function authenticatedCustomer(request, env) {
  if (!env?.STORE_DB) throw new Error("d1_unavailable");
  return getCustomerFromSession(env.STORE_DB, cookieToken(request));
}

export async function handleStoreRfqs(request, env, pathname) {
  if (pathname !== "/api/rfqs" && pathname !== "/api/customer/rfqs") return null;

  const customer = await authenticatedCustomer(request, env);
  if (!customer) return json({ error: "authentication_required" }, 401);

  try {
    if (pathname === "/api/rfqs" && request.method === "POST") {
      const input = await readJsonBody(request);
      const rfq = await createRfq(env.STORE_DB, customer, input);
      return json({ ok: true, rfq }, 201);
    }

    if (pathname === "/api/customer/rfqs" && request.method === "GET") {
      const url = new URL(request.url);
      const result = await listCustomerRfqs(env.STORE_DB, customer.id, {
        limit: url.searchParams.get("limit"),
        offset: url.searchParams.get("offset"),
      });
      return json({ ok: true, ...result });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (error) {
    if (error?.message === "unsupported_media_type") return json({ error: "unsupported_media_type" }, 415);
    if (error?.message === "payload_too_large") return json({ error: "payload_too_large" }, 413);
    if (error?.message === "invalid_json") return json({ error: "invalid_json" }, 400);
    if (error?.message === "invalid_rfq") return json({ error: "invalid_rfq" }, 400);
    if (error?.message === "d1_unavailable") return json({ error: "rfq_service_unavailable" }, 503);
    return json({ error: "rfq_service_unavailable" }, 503);
  }
}
