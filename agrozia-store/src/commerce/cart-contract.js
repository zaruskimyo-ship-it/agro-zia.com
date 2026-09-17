export const CART_STATUSES = Object.freeze(["active", "converted", "abandoned"]);
export const MAX_QUANTITY_LENGTH = 80;

function asQuantity(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0 || value > 1000000000) return null;
    return String(value);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_QUANTITY_LENGTH) return null;
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return null;
  if (Number(trimmed) <= 0 || Number(trimmed) > 1000000000) return null;
  return trimmed;
}

export function normalizeCartItem(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const productId = typeof input.product_id === "string" ? input.product_id.trim().slice(0, 128) : "";
  const quantity = asQuantity(input.quantity);
  if (!productId || !quantity) return null;
  return { product_id: productId, quantity };
}

export function publicCart(cart, items = []) {
  return {
    id: cart.id,
    status: cart.status,
    currency: cart.currency || null,
    items: items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit || null,
      price_visibility: item.price_visibility,
      currency: item.currency,
      price_min: item.price_min,
      price_max: item.price_max,
    })),
    updated_at: cart.updated_at,
  };
}
