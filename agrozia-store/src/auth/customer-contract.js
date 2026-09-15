export const CUSTOMER_SESSION_COOKIE = "agz_customer_session";
export const CUSTOMER_ROLE = "customer";
export const CUSTOMER_STATUS = "active";

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function validateRegistrationInput(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password ?? "");
  const name = String(input?.name ?? "").trim();

  if (!email || !email.includes("@") || email.length > 254) {
    return { ok: false, error: "invalid_email" };
  }
  if (password.length < 10 || password.length > 256) {
    return { ok: false, error: "invalid_password" };
  }
  if (!name || name.length > 120) {
    return { ok: false, error: "invalid_name" };
  }

  return { ok: true, value: { email, password, name } };
}
