import { createQuote } from "./quote-repository.js";

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

export async function handlePrivateQuotes(request, env, { authorized = false } = {}) {
  if (!authorized) return json({ error: "not_found" }, 404);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!env.AGROZIA_DB) return json({ error: "quote_service_unavailable" }, 503);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return json({ error: "unsupported_media_type" }, 415);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 32 * 1024) return json({ error: "payload_too_large" }, 413);
    body = JSON.parse(raw);
  } catch (_) {
    return json({ error: "invalid_json" }, 400);
  }

  try {
    const quote = await createQuote(env.AGROZIA_DB, body);
    return json({ ok: true, item: quote }, 201);
  } catch (error) {
    const code = String(error?.message || "");
    if (code.startsWith("invalid_quote") || code.startsWith("quote_")) return json({ error: code }, 400);
    console.error("Private quote creation failed", { name: String(error?.name || "Error").slice(0, 40) });
    return json({ error: "quote_service_unavailable" }, 503);
  }
}
