import { normalizeRfq, publicRfq } from "./rfq-contract.js";

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function createRequestNumber(now, id) {
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AGZ-RFQ-${stamp}-${id.slice(0, 8).toUpperCase()}`;
}

export async function createRfq(db, input, now = new Date().toISOString()) {
  requireDb(db);

  const normalized = normalizeRfq(input);
  if (!normalized) throw new Error("invalid_rfq");

  const id = crypto.randomUUID();
  const requestNumber = createRequestNumber(now, id);
  const status = "submitted";

  await db.prepare(
    `INSERT INTO commerce_rfqs (
      id, request_number, status, language, product_id, product_name,
      quantity, destination_country, destination_location, packaging,
      private_label, sample_required, documents_required, target_timing,
      description, buyer_company, buyer_name, buyer_email, buyer_phone,
      attachment_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    requestNumber,
    status,
    normalized.language,
    normalized.product_id,
    normalized.product_name,
    normalized.quantity,
    normalized.destination_country,
    normalized.destination_location,
    normalized.packaging,
    normalized.private_label,
    normalized.sample_required ? 1 : 0,
    normalized.documents_required,
    normalized.target_timing,
    normalized.description,
    normalized.buyer_company,
    normalized.buyer_name,
    normalized.buyer_email,
    normalized.buyer_phone,
    normalized.attachment_count,
    now,
    now,
  ).run();

  return publicRfq({
    ...normalized,
    id,
    request_number: requestNumber,
    status,
    created_at: now,
    updated_at: now,
  });
}
