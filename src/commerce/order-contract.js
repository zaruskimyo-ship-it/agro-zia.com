export const ORDER_STATUSES = Object.freeze([
  "pending_confirmation",
  "confirmed",
  "proforma_pending",
  "payment_pending",
  "sourcing",
  "shipping",
  "delivered",
  "completed",
  "cancelled",
  "rejected",
]);

export const MAX_LENGTHS = Object.freeze({
  quote_id: 128,
  buyer_company: 200,
  buyer_name: 160,
  buyer_email: 320,
  buyer_phone: 64,
});

const text = (value, max) => {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const valueTrimmed = value.trim();
  return valueTrimmed && valueTrimmed.length <= max ? valueTrimmed : null;
};

export function normalizeOrderInput(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const quoteId = text(input.quote_id, MAX_LENGTHS.quote_id);
  if (!quoteId) return null;
  return {
    quote_id: quoteId,
    buyer_company: text(input.buyer_company, MAX_LENGTHS.buyer_company),
    buyer_name: text(input.buyer_name, MAX_LENGTHS.buyer_name),
    buyer_email: text(input.buyer_email, MAX_LENGTHS.buyer_email),
    buyer_phone: text(input.buyer_phone, MAX_LENGTHS.buyer_phone),
  };
}

export function publicOrder(order) {
  if (!order || typeof order !== "object") return null;
  return {
    order_number: order.order_number,
    quote_id: order.quote_id,
    rfq_id: order.rfq_id,
    supplier_id: order.supplier_id,
    product_id: order.product_id || null,
    product_name: order.product_name,
    quantity: order.quantity,
    currency: order.currency,
    unit_price_minor: order.unit_price_minor,
    quoted_amount_minor: order.quoted_amount_minor,
    destination: order.destination || null,
    status: order.status,
    created_at: order.created_at || null,
    updated_at: order.updated_at || null,
  };
}
