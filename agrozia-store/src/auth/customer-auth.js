import {
  CUSTOMER_SESSION_COOKIE,
  validateRegistrationInput,
  normalizeEmail
} from "./customer-contract.js";
import {
  findCustomerByEmail,
  createCustomer,
  createSession,
  getCustomerFromSession,
  revokeSession,
  verifyPassword
} from "./customer-repository.js";
import { clearSessionCookie, sessionCookie } from "./session.js";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

function cookieToken(request) {
  const value = request.headers.get("Cookie") ?? "";
  const match = value.match(/(?:^|;\s*)agz_customer_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function handleCustomerAuth(request, env, pathname) {
  if (pathname === "/api/customer/register" && request.method === "POST") {
    const input = await body(request);
    const validation = validateRegistrationInput(input);
    if (!validation.ok) return json({ ok: false, error: validation.error }, 400);

    const existing = await findCustomerByEmail(env.STORE_DB, validation.value.email);
    if (existing) return json({ ok: false, error: "email_already_registered" }, 409);

    const customer = await createCustomer(env.STORE_DB, {
      ...validation.value,
      phone: input?.phone,
      company: input?.company,
      country: input?.country
    });
    const session = await createSession(env.STORE_DB, customer.id);

    return json({ ok: true, customer }, 201, {
      "Set-Cookie": sessionCookie(session.token, 60 * 60 * 24 * 30)
    });
  }

  if (pathname === "/api/customer/login" && request.method === "POST") {
    const input = await body(request);
    const email = normalizeEmail(input?.email);
    const password = String(input?.password ?? "");
    if (!email || !password) return json({ ok: false, error: "invalid_credentials" }, 400);

    const customer = await findCustomerByEmail(env.STORE_DB, email);
    if (!customer || customer.status !== "active" || !(await verifyPassword(password, customer))) {
      return json({ ok: false, error: "invalid_credentials" }, 401);
    }

    const session = await createSession(env.STORE_DB, customer.id);
    return json({ ok: true, customer: {
      id: customer.id, email: customer.email, name: customer.name,
      phone: customer.phone, company: customer.company, country: customer.country,
      role: customer.role, status: customer.status
    } }, 200, {
      "Set-Cookie": sessionCookie(session.token, 60 * 60 * 24 * 30)
    });
  }

  if (pathname === "/api/customer/logout" && request.method === "POST") {
    await revokeSession(env.STORE_DB, cookieToken(request));
    return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
  }

  if (pathname === "/api/customer/session" && request.method === "GET") {
    const customer = await getCustomerFromSession(env.STORE_DB, cookieToken(request));
    if (!customer) return json({ ok: false, authenticated: false }, 401);
    return json({ ok: true, authenticated: true, customer });
  }

  return null;
}
