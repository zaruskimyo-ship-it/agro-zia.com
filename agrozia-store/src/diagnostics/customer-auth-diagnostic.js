const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
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
  const database = {
    read: false,
    customerLookup: false,
    sessionTableRead: false,
    passwordFields: false,
    saltDecode: false,
    hashDecode: false,
    iterationsValid: false,
    diagnosticIterations: 10000,
    dummyImportKey: false,
    dummyDeriveBits: false,
    derivedLength: 0,
    expectedHashLength: 0
  };

  try {
    await env.STORE_DB.prepare("SELECT 1 AS ok").first();
    database.read = true;
  } catch {}

  try {
    const row = await env.STORE_DB.prepare(
      "SELECT password_hash, password_salt, password_iterations FROM customers WHERE email = ?1 LIMIT 1"
    ).bind("agrozia.store.test@example.com").first();
    database.customerLookup = Boolean(row);

    if (row) {
      database.passwordFields = Boolean(row.password_hash && row.password_salt && row.password_iterations);

      let saltBytes = null;
      let expectedHash = null;

      try {
        saltBytes = base64ToBytes(row.password_salt);
        database.saltDecode = saltBytes.length > 0;
      } catch {}

      try {
        expectedHash = base64ToBytes(row.password_hash);
        database.hashDecode = expectedHash.length > 0;
        database.expectedHashLength = expectedHash.length;
      } catch {}

      const iterations = Number(row.password_iterations);
      database.iterationsValid = Number.isInteger(iterations) && iterations > 0;

      if (database.saltDecode) {
        try {
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode("agrozia-diagnostic-dummy-password"),
            "PBKDF2",
            false,
            ["deriveBits"]
          );
          database.dummyImportKey = true;

          const bits = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt: saltBytes, iterations: database.diagnosticIterations, hash: "SHA-256" },
            key,
            256
          );
          const derived = new Uint8Array(bits);
          database.dummyDeriveBits = true;
          database.derivedLength = derived.length;
        } catch {}
      }
    }
  } catch {}

  try {
    await env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM customer_sessions").first();
    database.sessionTableRead = true;
  } catch {}

  return json({
    ok: true,
    diagnostic: "customer-auth-runtime-isolated",
    crypto: cryptoProbe,
    database,
    note: "No passwords, hashes, salts, session tokens, or customer PII are returned."
  });
}
