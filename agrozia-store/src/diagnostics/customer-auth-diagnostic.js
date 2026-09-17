const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function probeWebCrypto() {
  const result = {
    randomUUID: false,
    randomValues: false,
    subtleImportKey: false,
    subtleDeriveBits: false
  };

  try {
    result.randomUUID = typeof crypto.randomUUID === "function" && Boolean(crypto.randomUUID());
  } catch {}

  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    result.randomValues = bytes.some((byte) => byte !== 0);
  } catch {}

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode("agrozia-diagnostic"),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    result.subtleImportKey = true;
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: encoder.encode("agrozia-diagnostic-salt"), iterations: 1000, hash: "SHA-256" },
      key,
      256
    );
    result.subtleDeriveBits = true;
  } catch {}

  return result;
}

export async function handleCustomerAuthDiagnostic(request, env, pathname) {
  if (pathname !== "/__diag/customer-auth/8d6f1b2c9a7e4f31" || request.method !== "GET") return null;

  const cryptoProbe = await probeWebCrypto();
  let dbRead = false;
  let customerLookup = false;
  let sessionTableRead = false;

  try {
    await env.STORE_DB.prepare("SELECT 1 AS ok").first();
    dbRead = true;
  } catch {}

  try {
    const row = await env.STORE_DB.prepare(
      "SELECT id, status, password_iterations, length(password_hash) AS hash_len, length(password_salt) AS salt_len FROM customers WHERE email = ?1 LIMIT 1"
    ).bind("agrozia.store.test@example.com").first();
    customerLookup = Boolean(row);
  } catch {}

  try {
    await env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM customer_sessions").first();
    sessionTableRead = true;
  } catch {}

  return json({
    ok: true,
    diagnostic: "customer-auth-runtime",
    crypto: cryptoProbe,
    database: { read: dbRead, customerLookup, sessionTableRead },
    note: "No passwords, hashes, salts, session tokens, or customer PII are returned."
  });
}
