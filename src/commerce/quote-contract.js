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

export const MAX_MONEY_MINOR = 999_999_999_999n;
export const MAX_INFLATION_BPS = 100_000;
export const QUANTITY_SCALE = 6;
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
  if (!Number.isInteger(value) || value < 0 || BigInt(value) > MAX_MONEY_MINOR) return null;
  return value;
};

const adjustmentBps = (value) => {
  if (value == null || value === "") return 0;
  if (!Number.isInteger(value) || value < 0 || value > MAX_INFLATION_BPS) return null;
  return value;
};

function parseQuantity(value) {
  const text = String(value ?? "").trim().replace(/,/g, "");
  const match = text.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const numeric = match[1];
  const [whole, fraction = ""] = numeric.split(".");
  if (fraction.length > QUANTITY_SCALE) return null;
  return BigInt(whole) * 10n ** BigInt(QUANTITY_SCALE) + BigInt(fraction.padEnd(QUANTITY_SCALE, "0") || "0");
}

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
  const inflationFixed = money(input.inflation_adjustment_minor ?? 0);
  const inflationBps = adjustmentBps(input.inflation_adjustment_bps ?? 0);
  if (!rfqId || !supplierId || !productName || !quantity || !currency || unitPrice == null || packaging == null || shipping == null || insurance == null || other == null || inflationFixed == null || inflationBps == null || parseQuantity(quantity) == null) return null;
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
    inflation_adjustment_minor: inflationFixed,
    inflation_adjustment_bps: inflationBps,
    lead_time: asText(input.lead_time, MAX_LENGTHS.lead_time),
    validity_until: asText(input.validity_until, MAX_LENGTHS.validity_until),
    payment_terms: asText(input.payment_terms, MAX_LENGTHS.payment_terms),
    incoterm: asText(input.incoterm, MAX_LENGTHS.incoterm),
    destination: asText(input.destination, MAX_LENGTHS.destination),
    notes: asText(input.notes, MAX_LENGTHS.notes),
  };
}

export function calculateTotalMinor(quote) {
  const values = [quote?.unit_price_minor, quote?.packaging_cost_minor, quote?.shipping_cost_minor, quote?.insurance_cost_minor, quote?.other_fees_minor];
  if (!values.every((value) => Number.isInteger(value) && value >= 0 && BigInt(value) <= MAX_MONEY_MINOR)) return null;
  const quantity = parseQuantity(quote.quantity);
  if (quantity == null) return null;
  const fixed = quote.inflation_adjustment_minor ?? 0;
  const bps = quote.inflation_adjustment_bps ?? 0;
  if (!Number.isInteger(fixed) || fixed < 0 || BigInt(fixed) > MAX_MONEY_MINOR || !Number.isInteger(bps) || bps < 0 || bps > MAX_INFLATION_BPS) return null;

  const scale = 10n ** BigInt(QUANTITY_SCALE);
  const unit = BigInt(quote.unit_price_minor);
  const ancillary = values.slice(1).reduce((sum, value) => sum + BigInt(value), 0n);
  const productAmount = (unit * quantity + scale / 2n) / scale;
  const subtotal = productAmount + ancillary;
  const percentageAdjustment = (subtotal * BigInt(bps) + 5000n) / 10000n;
  const total = subtotal + BigInt(fixed) + percentageAdjustment;
  return total <= MAX_MONEY_MINOR ? Number(total) : null;
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
    inflation_adjustment_minor: quote.inflation_adjustment_minor ?? 0,
    inflation_adjustment_bps: quote.inflation_adjustment_bps ?? 0,
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
