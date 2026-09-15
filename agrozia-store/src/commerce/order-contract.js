export const ORDER_STATUSES = Object.freeze([
  "pending_confirmation", "confirmed", "proforma_pending", "payment_pending",
  "sourcing", "shipping", "delivered", "completed", "cancelled", "rejected"
]);

export const MAX_ORDER_ID_LENGTH = 120;

export function publicOrder(order, items = []) {
  if (!order) return null;
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    currency: order.currency,
    subtotal: order.subtotal,
    total: order.total,
    shipping: {
      name: order.shipping_name,
      phone: order.shipping_phone,
      country: order.shipping_country,
      city: order.shipping_city,
      address: order.shipping_address,
      postal_code: order.shipping_postal_code || null,
    },
    items: items.map((item) => ({
      product_id: item.product_id,
      product_slug: item.product_slug,
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit || null,
      unit_price: item.unit_price,
      currency: item.currency,
      line_total: item.line_total,
    })),
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}
