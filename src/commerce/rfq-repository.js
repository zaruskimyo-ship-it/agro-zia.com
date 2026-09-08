import { normalizeRfq, publicRfq } from "./rfq-contract.js";

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function createRequestNumber(now, id) {
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AGZ-RFQ-${stamp}-${id.slice(0, 8).toUpperCase()}`;
}

async function resolvePublishedProduct(db, productId) {
  if (!productId) return null;

  const result = await db
    .prepare(
      `SELECT id, name, status
       FROM commerce_products
       WHERE id = ? AND status = 'published'
       LIMIT 1`,
    )
    .bind(productId)
    .first();

  if (!result) throw new Error("invalid_rfq");
  return result;
}

export async function createRfq(db, input, now = new Date().toISOString()) {
  requireDb(db);

  const normalized = normalizeRfq(input);
  if (!normalized) throw new Error("invalid_rfq");

  const product = await resolvePublishedProduct(db, normalized.product_id);
  const productName = product?.name || normalized.product_name;

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
    productName,
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
    product_name: productName,
    id,
    request_number: requestNumber,
    status,
    created_at: now,
    updated_at: now,
  });
}
