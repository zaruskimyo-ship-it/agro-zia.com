const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomHex(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export function adminSessionCookie(token, maxAgeSeconds) {
  return [
    `agz_store_admin_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ].join("; ");
}

export function clearAdminSessionCookie() {
  return "agz_store_admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

export function adminTokenFromRequest(request) {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)agz_store_admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
