import { normalizeRfq, publicRfq } from "./rfq-contract.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function requireDb(db) {
  if (!db) throw new Error("d1_unavailable");
  return db;
}

function createRequestNumber(now, id) {
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AGZ-RFQ-${stamp}-${id.slice(0, 8).toUpperCase()}`;
}

function clampLimit(value) {
  const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

function clampOffset(value) {
  const parsed = Number.parseInt(String(value || "0"), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(10000, Math.max(0, parsed));
}

function mapRow(row) {
  return publicRfq(row);
}

async function resolvePublishedProduct(db, productId) {
  if (!productId) return null;
  const result = await db.prepare(
    `SELECT id, name FROM commerce_products
     WHERE id = ? AND status = 'published' LIMIT 1`,
  ).bind(productId).first();
  if (!result) throw new Error("invalid_rfq");
  return result;
}

export async function createRfq(db, customer, input, now = new Date().toISOString()) {
  requireDb(db);
  if (!customer?.id || customer.status !== "active" || customer.role !== "customer") {
    throw new Error("authentication_required");
  }

  const normalized = normalizeRfq(input);
  if (!normalized) throw new Error("invalid_rfq");

  const product = await resolvePublishedProduct(db, normalized.product_id);
  const productName = product?.name || normalized.product_name;
  const id = crypto.randomUUID();
  const requestNumber = createRequestNumber(now, id);

  await db.prepare(
    `INSERT INTO commerce_rfqs (
      id, request_number, customer_id, status, language, product_id, product_name,
      quantity, destination_country, destination_location, packaging,
      private_label, sample_required, documents_required, target_timing,
      description, buyer_company, buyer_name, buyer_email, buyer_phone,
      attachment_count, created_at, updated_at
    ) VALUES (?, ?, ?, 'submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    requestNumber,
    customer.id,
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
    customer.company ?? null,
    customer.name ?? null,
    customer.email ?? null,
    customer.phone ?? null,
    normalized.attachment_count,
    now,
    now,
  ).run();

  return publicRfq({
    ...normalized,
    product_name: productName,
    request_number: requestNumber,
    status: "submitted",
  });
}

export async function listCustomerRfqs(db, customerId, params = {}) {
  requireDb(db);
  if (!customerId) throw new Error("authentication_required");
  const limit = clampLimit(params.limit);
  const offset = clampOffset(params.offset);

  const count = await db.prepare(
    `SELECT COUNT(*) AS total FROM commerce_rfqs WHERE customer_id = ?`,
  ).bind(customerId).first();

  const rows = await db.prepare(
    `SELECT request_number, status, language, product_id, product_name,
      quantity, destination_country, destination_location, packaging,
      private_label, sample_required, documents_required, target_timing,
      description, attachment_count
     FROM commerce_rfqs
     WHERE customer_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
  ).bind(customerId, limit, offset).all();

  return {
    items: (rows?.results || []).map(mapRow).filter(Boolean),
    pagination: { limit, offset, total: Number(count?.total || 0) },
  };
}
