const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derivePassword(password, saltBytes, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
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
    passwordVerification: false,
    passwordVerificationError: false
  };

  try {
    await env.STORE_DB.prepare("SELECT 1 AS ok").first();
    database.read = true;
  } catch {}

  try {
    const row = await env.STORE_DB.prepare(
      "SELECT id, status, password_hash, password_salt, password_iterations FROM customers WHERE email = ?1 LIMIT 1"
    ).bind("agrozia.store.test@example.com").first();
    database.customerLookup = Boolean(row);

    if (row?.password_hash && row?.password_salt && row?.password_iterations) {
      try {
        const actual = await derivePassword(
          "AgroZiaStore-Test-2026!",
          base64ToBytes(row.password_salt),
          Number(row.password_iterations)
        );
        const expected = base64ToBytes(row.password_hash);
        database.passwordVerification = equalBytes(actual, expected);
      } catch {
        database.passwordVerificationError = true;
      }
    }
  } catch {}

  try {
    await env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM customer_sessions").first();
    database.sessionTableRead = true;
  } catch {}

  return json({
    ok: true,
    diagnostic: "customer-auth-runtime",
    crypto: cryptoProbe,
    database,
    note: "No passwords, hashes, salts, session tokens, or customer PII are returned."
  });
}
