export const B2B_ORDER_STATUSES = Object.freeze([
  "pending_confirmation", "confirmed", "proforma_pending", "payment_pending",
  "sourcing", "shipping", "delivered", "completed", "cancelled", "rejected",
]);

export const MAX_ID_LENGTH = 120;

export function normalizeB2BOrderId(value) {
  const id = String(value ?? "").trim();
  return id && id.length <= MAX_ID_LENGTH ? id : null;
}

export function publicB2BOrder(order, items = []) {
  if (!order) return null;
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    rfq_id: order.rfq_id,
    quote_id: order.quote_id,
    supplier_id: order.supplier_id,
    currency: order.currency,
    subtotal_minor: order.subtotal_minor,
    total_minor: order.total_minor,
    product_id: order.product_id,
    product_name: order.product_name,
    quantity: order.quantity,
    unit_price_minor: order.unit_price_minor,
    lead_time: order.lead_time,
    incoterm: order.incoterm,
    destination: order.destination,
    payment_terms: order.payment_terms,
    notes: order.notes,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    items,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

export function publicB2BOrderItem(item) {
  return {
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price_minor: item.unit_price_minor,
    currency: item.currency,
    line_total_minor: item.line_total_minor,
  };
}
