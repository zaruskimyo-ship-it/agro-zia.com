export const CHECKOUT_STATUSES = Object.freeze(["open", "expired", "completed", "cancelled"]);
export const MAX_IDEMPOTENCY_KEY_LENGTH = 120;
export const MAX_ADDRESS_LENGTH = 500;
export const MAX_CITY_LENGTH = 120;
export const MAX_COUNTRY_LENGTH = 80;
export const MAX_POSTAL_LENGTH = 40;
export const MAX_PHONE_LENGTH = 40;
export const MAX_NAME_LENGTH = 120;
export const CHECKOUT_TTL_MINUTES = 30;

function text(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeCheckoutInput(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const idempotencyKey = text(input.idempotency_key, MAX_IDEMPOTENCY_KEY_LENGTH);
  const shipping = input.shipping_address;
  if (!shipping || typeof shipping !== "object" || Array.isArray(shipping)) return null;

  const value = {
    idempotency_key: idempotencyKey,
    shipping_address: {
      name: text(shipping.name, MAX_NAME_LENGTH),
      phone: text(shipping.phone, MAX_PHONE_LENGTH),
      country: text(shipping.country, MAX_COUNTRY_LENGTH),
      city: text(shipping.city, MAX_CITY_LENGTH),
      address: text(shipping.address, MAX_ADDRESS_LENGTH),
      postal_code: text(shipping.postal_code, MAX_POSTAL_LENGTH),
    },
  };
  if (!value.idempotency_key || !/^[A-Za-z0-9._:-]+$/.test(value.idempotency_key)) return null;
  const a = value.shipping_address;
  if (!a.name || !a.phone || !a.country || !a.city || !a.address) return null;
  return value;
}

function decimalParts(value) {
  const raw = String(value).trim();
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) return null;
  const [whole, fraction = ""] = raw.split(".");
  if (fraction.length > 6) return null;
  return { whole, fraction: fraction.padEnd(6, "0") };
}

export function decimalToMicros(value) {
  const parts = decimalParts(value);
  if (!parts) return null;
  try { return BigInt(parts.whole) * 1000000n + BigInt(parts.fraction); } catch { return null; }
}

export function multiplyDecimalToMicros(a, b) {
  const left = decimalToMicros(a);
  const right = decimalToMicros(b);
  if (left === null || right === null) return null;
  return (left * right) / 1000000n;
}

export function microsToDecimal(value) {
  const micros = typeof value === "bigint" ? value : BigInt(value);
  if (micros < 0n) return null;
  const whole = micros / 1000000n;
  const fraction = String(micros % 1000000n).padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function publicCheckout(checkout, items = []) {
  return {
    id: checkout.id,
    status: checkout.status,
    currency: checkout.currency,
    subtotal: checkout.subtotal,
    shipping_address: {
      name: checkout.shipping_name,
      phone: checkout.shipping_phone,
      country: checkout.shipping_country,
      city: checkout.shipping_city,
      address: checkout.shipping_address,
      postal_code: checkout.shipping_postal_code || null,
    },
    items: items.map((item) => ({
      product_id: item.product_id,
      slug: item.product_slug,
      name: item.product_name,
      quantity: item.quantity,
      unit: item.unit || null,
      unit_price: item.unit_price,
      currency: item.currency,
      line_total: item.line_total,
    })),
    expires_at: checkout.expires_at,
    created_at: checkout.created_at,
  };
}
