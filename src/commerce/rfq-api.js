import { createRfq } from "./rfq-repository.js";

const MAX_BODY_BYTES = 32 * 1024;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
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

export async function handlePublicRfqs(request, env) {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  if (!env?.AGROZIA_DB) {
    return json({ error: "rfq_service_unavailable" }, 503);
  }

  try {
    const input = await readJsonBody(request);
    const rfq = await createRfq(env.AGROZIA_DB, input);
    return json({ rfq }, 201);
  } catch (error) {
    if (error?.message === "unsupported_media_type") {
      return json({ error: "unsupported_media_type" }, 415);
    }
    if (error?.message === "payload_too_large") {
      return json({ error: "payload_too_large" }, 413);
    }
    if (error?.message === "invalid_json") {
      return json({ error: "invalid_json" }, 400);
    }
    if (error?.message === "invalid_rfq") {
      return json({ error: "invalid_rfq" }, 400);
    }
    return json({ error: "rfq_service_unavailable" }, 503);
  }
}
