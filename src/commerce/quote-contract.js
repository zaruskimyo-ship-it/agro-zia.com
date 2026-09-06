export const QUOTE_STATUSES = Object.freeze([
  "draft",
  "sent",
  "negotiating",
  "accepted",
  "rejected",
  "expired",
  "withdrawn",
]);

export const RFQ_QUOTE_ELIGIBLE_STATUSES = Object.freeze([
  "matched",
  "quoted",
  "negotiating",
]);

export const MAX_MONEY_MINOR = 9_999_999_999_99;
export const MAX_LENGTHS = Object.freeze({
  rfq_id: 128,
  supplier_id: 128,
  product_id: 128,
  product_name: 200,
  quantity: 120,
  currency: 8,
  lead_time: 200,
  validity_until: 64,
  payment_terms: 500,
  incoterm: 32,
  destination: 200,
  notes: 4000,
});

const asText = (value, max, required = false) => {
  if (value == null) return required ? null : null;
  if (typeof value !== "string") return null;
  const text = value.trim();
  if ((!text && required) || text.length > max) return null;
  return text || null;
};

const money = (value) => {
  if (!Number.isInteger(value) || value < 0 || value > MAX_MONEY_MINOR) return null;
  return value;
};

export function normalizeQuote(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const rfqId = asText(input.rfq_id, MAX_LENGTHS.rfq_id, true);
  const supplierId = asText(input.supplier_id, MAX_LENGTHS.supplier_id, true);
  const productId = asText(input.product_id, MAX_LENGTHS.product_id);
  const productName = asText(input.product_name, MAX_LENGTHS.product_name, true);
  const quantity = asText(input.quantity, MAX_LENGTHS.quantity, true);
  const currency = asText(input.currency, MAX_LENGTHS.currency, true)?.toUpperCase();
  const unitPrice = money(input.unit_price_minor);
  const packaging = money(input.packaging_cost_minor ?? 0);
  const shipping = money(input.shipping_cost_minor ?? 0);
  const insurance = money(input.insurance_cost_minor ?? 0);
  const other = money(input.other_fees_minor ?? 0);
  if (!rfqId || !supplierId || !productName || !quantity || !currency || unitPrice == null || packaging == null || shipping == null || insurance == null || other == null) return null;
  return {
    rfq_id: rfqId,
    supplier_id: supplierId,
    product_id: productId,
    product_name: productName,
    quantity,
    unit_price_minor: unitPrice,
    currency,
    packaging_cost_minor: packaging,
    shipping_cost_minor: shipping,
    insurance_cost_minor: insurance,
    other_fees_minor: other,
    lead_time: asText(input.lead_time, MAX_LENGTHS.lead_time),
    validity_until: asText(input.validity_until, MAX_LENGTHS.validity_until),
    payment_terms: asText(input.payment_terms, MAX_LENGTHS.payment_terms),
    incoterm: asText(input.incoterm, MAX_LENGTHS.incoterm),
    destination: asText(input.destination, MAX_LENGTHS.destination),
    notes: asText(input.notes, MAX_LENGTHS.notes),
  };
}

export function calculateTotalMinor(quote) {
  const values = [quote.unit_price_minor, quote.packaging_cost_minor, quote.shipping_cost_minor, quote.insurance_cost_minor, quote.other_fees_minor];
  if (!values.every((value) => Number.isInteger(value) && value >= 0)) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total <= MAX_MONEY_MINOR ? total : null;
}

export function publicQuote(quote) {
  if (!quote || typeof quote !== "object") return null;
  return {
    quote_number: quote.quote_number,
    rfq_id: quote.rfq_id,
    product_id: quote.product_id || null,
    product_name: quote.product_name,
    quantity: quote.quantity,
    unit_price_minor: quote.unit_price_minor,
    currency: quote.currency,
    packaging_cost_minor: quote.packaging_cost_minor,
    shipping_cost_minor: quote.shipping_cost_minor,
    insurance_cost_minor: quote.insurance_cost_minor,
    other_fees_minor: quote.other_fees_minor,
    total_amount_minor: quote.total_amount_minor,
    lead_time: quote.lead_time || null,
    validity_until: quote.validity_until || null,
    payment_terms: quote.payment_terms || null,
    incoterm: quote.incoterm || null,
    destination: quote.destination || null,
    status: quote.status,
    created_at: quote.created_at || null,
    updated_at: quote.updated_at || null,
  };
}
