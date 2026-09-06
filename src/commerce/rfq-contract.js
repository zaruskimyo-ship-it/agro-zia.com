export const RFQ_STATUSES = Object.freeze([
  "submitted",
  "reviewing",
  "matched",
  "quoted",
  "negotiating",
  "converted",
  "cancelled",
]);

export const MAX_LENGTHS = Object.freeze({
  request_number: 64,
  language: 16,
  product_id: 128,
  product_name: 200,
  quantity: 120,
  destination_country: 120,
  destination_location: 200,
  packaging: 500,
  private_label: 120,
  documents_required: 1000,
  target_timing: 200,
  description: 5000,
  buyer_company: 200,
  buyer_name: 160,
  buyer_email: 254,
  buyer_phone: 80,
});

export const MAX_ATTACHMENTS = 10;

const asText = (value, max) => {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
};

const asRequiredText = (value, max) => asText(value, max);

export function normalizeRfq(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const productName = asRequiredText(input.product_name, MAX_LENGTHS.product_name);
  if (!productName) return null;

  const sampleRequired = input.sample_required === true || input.sample_required === 1;

  const attachmentCount = Number.isInteger(input.attachment_count)
    ? input.attachment_count
    : 0;
  if (attachmentCount < 0 || attachmentCount > MAX_ATTACHMENTS) return null;

  return {
    request_number: asText(input.request_number, MAX_LENGTHS.request_number),
    status: RFQ_STATUSES.includes(input.status) ? input.status : "submitted",
    language: asText(input.language, MAX_LENGTHS.language) || "en",
    product_id: asText(input.product_id, MAX_LENGTHS.product_id),
    product_name: productName,
    quantity: asText(input.quantity, MAX_LENGTHS.quantity),
    destination_country: asText(input.destination_country, MAX_LENGTHS.destination_country),
    destination_location: asText(input.destination_location, MAX_LENGTHS.destination_location),
    packaging: asText(input.packaging, MAX_LENGTHS.packAGING || MAX_LENGTHS.packaging),
    private_label: asText(input.private_label, MAX_LENGTHS.private_label),
    sample_required: sampleRequired,
    documents_required: asText(input.documents_required, MAX_LENGTHS.documents_required),
    target_timing: asText(input.target_timing, MAX_LENGTHS.target_timing),
    description: asText(input.description, MAX_LENGTHS.description),
    buyer_company: asText(input.buyer_company, MAX_LENGTHS.buyer_company),
    buyer_name: asText(input.buyer_name, MAX_LENGTHS.buyer_name),
    buyer_email: asText(input.buyer_email, MAX_LENGTHS.buyer_email),
    buyer_phone: asText(input.buyer_phone, MAX_LENGTHS.buyer_phone),
    attachment_count: attachmentCount,
  };
}

export function publicRfq(rfq) {
  if (!rfq || typeof rfq !== "object") return null;
  return {
    request_number: rfq.request_number,
    status: rfq.status,
    language: rfq.language,
    product_id: rfq.product_id,
    product_name: rfq.product_name,
    quantity: rfq.quantity,
    destination_country: rfq.destination_country,
    destination_location: rfq.destination_location,
    packaging: rfq.packaging,
    private_label: rfq.private_label,
    sample_required: Boolean(rfq.sample_required),
    documents_required: rfq.documents_required,
    target_timing: rfq.target_timing,
    description: rfq.description,
    attachment_count: rfq.attachment_count,
  };
}
