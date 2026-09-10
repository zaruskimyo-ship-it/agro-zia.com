import { getStoreAdmin } from "./store-admin-auth.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff"
  }});
}
function body(request) { return request.json().catch(() => null); }
function id(value) { const v = String(value ?? "").trim(); return v && v.length <= 120 ? v : null; }
function now() { return new Date().toISOString(); }
function originOk(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function handleStoreAdmin(request, env, pathname) {
  if (pathname === "/api/store-admin/login" || pathname === "/api/store-admin/logout") return null;
  if (!pathname.startsWith("/api/store-admin/")) return null;
  const admin = await getStoreAdmin(request, env);
  if (!admin) return json({ ok: false, error: "admin_authentication_required" }, 401);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !originOk(request)) return json({ ok: false, error: "invalid_origin" }, 403);

  try {
    if (request.method === "GET" && pathname === "/api/store-admin/summary") {
      const [products, rfqs, quotes, orders, customers, suppliers] = await Promise.all([
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM commerce_products").first(),
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM commerce_rfqs WHERE status NOT IN ('converted','cancelled')").first(),
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM commerce_quotes WHERE status IN ('sent','accepted')").first(),
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM commerce_b2b_orders WHERE status NOT IN ('completed','cancelled','rejected')").first(),
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM customers").first(),
        env.STORE_DB.prepare("SELECT COUNT(*) AS count FROM commerce_suppliers").first()
      ]);
      return json({ ok: true, summary: { products: products?.count ?? 0, rfqs: rfqs?.count ?? 0, quotes: quotes?.count ?? 0, b2b_orders: orders?.count ?? 0, customers: customers?.count ?? 0, suppliers: suppliers?.count ?? 0 } });
    }

    if (request.method === "GET" && pathname === "/api/store-admin/products") {
      const rows = await env.STORE_DB.prepare(`SELECT id, slug, name, brand, category_id, status, currency, price_visibility, price_min, price_max, supplier_id, verification_level, created_at, updated_at FROM commerce_products ORDER BY updated_at DESC LIMIT 200`).all();
      return json({ ok: true, products: rows.results || [] });
    }
    if (request.method === "POST" && pathname === "/api/store-admin/products") {
      const b = await body(request); if (!b) return json({ ok: false, error: "invalid_json" }, 400);
      const productId = crypto.randomUUID(), stamp = now();
      const slug = String(b.slug ?? "").trim(), name = String(b.name ?? "").trim();
      if (!slug || slug.length > 160 || !name || name.length > 200) return json({ ok: false, error: "invalid_product" }, 400);
      await env.STORE_DB.prepare(`INSERT INTO commerce_products (id,slug,name,brand,category_id,status,origin_country,moq,unit,availability_status,lead_time,price_visibility,currency,price_min,price_max,supply_capacity,incoterms,short_description,description,specifications_json,packaging,application,supplier_id,origin_statement,verification_level,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,'draft',?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,'declared',?24,?24)`).bind(productId,slug,name,b.brand??null,b.category_id??null,b.origin_country??null,b.moq??null,b.unit??null,b.availability_status??null,b.lead_time??null,b.price_visibility??'rfq',b.currency??null,b.price_min??null,b.price_max??null,b.supply_capacity??null,b.incoterms??null,b.short_description??null,b.description??null,typeof b.specifications_json === 'string' ? b.specifications_json : JSON.stringify(b.specifications_json ?? {}),b.packaging??null,b.application??null,b.supplier_id??null,b.origin_statement??null,stamp).run();
      return json({ ok: true, product_id: productId }, 201);
    }
    if (request.method === "POST" && pathname.startsWith("/api/store-admin/products/") && pathname.endsWith("/status")) {
      const productId = id(pathname.slice("/api/store-admin/products/".length, -"/status".length));
      const b = await body(request); const status = String(b?.status ?? "");
      if (!productId || !["draft","published","archived"].includes(status)) return json({ ok:false,error:"invalid_product_status" },400);
      const publishedAt = status === "published" ? now() : null;
      const result = await env.STORE_DB.prepare("UPDATE commerce_products SET status=?1, published_at=?2, updated_at=?2 WHERE id=?3").bind(status,publishedAt,productId).run();
      if (!result.meta?.changes) return json({ ok:false,error:"product_not_found" },404);
      return json({ ok:true });
    }

    if (request.method === "GET" && pathname === "/api/store-admin/categories") {
      const rows = await env.STORE_DB.prepare("SELECT id,parent_id,slug,name,status,created_at,updated_at FROM commerce_categories ORDER BY name LIMIT 200").all();
      return json({ ok:true,categories:rows.results||[] });
    }
    if (request.method === "POST" && pathname === "/api/store-admin/categories") {
      const b=await body(request); const slug=String(b?.slug??"").trim(), name=String(b?.name??"").trim();
      if(!slug||!name||slug.length>160||name.length>200) return json({ok:false,error:"invalid_category"},400);
      const stamp=now(), categoryId=crypto.randomUUID();
      await env.STORE_DB.prepare("INSERT INTO commerce_categories (id,parent_id,slug,name,status,created_at,updated_at) VALUES (?1,?2,?3,?4,'draft',?5,?5)").bind(categoryId,b.parent_id??null,slug,name,stamp).run();
      return json({ok:true,category_id:categoryId},201);
    }

    if (request.method === "GET" && pathname === "/api/store-admin/suppliers") {
      const rows=await env.STORE_DB.prepare("SELECT id,name,status,country,created_at,updated_at FROM commerce_suppliers ORDER BY updated_at DESC LIMIT 200").all();
      return json({ok:true,suppliers:rows.results||[]});
    }
    if (request.method === "POST" && pathname === "/api/store-admin/suppliers") {
      const b=await body(request); const name=String(b?.name??"").trim();
      if(!name||name.length>200) return json({ok:false,error:"invalid_supplier"},400);
      const supplierId=crypto.randomUUID(), stamp=now();
      await env.STORE_DB.prepare("INSERT INTO commerce_suppliers (id,name,status,country,created_at,updated_at) VALUES (?1,?2,'draft',?3,?4,?4)").bind(supplierId,name,b.country??null,stamp).run();
      return json({ok:true,supplier_id:supplierId},201);
    }
    if (request.method === "POST" && pathname.startsWith("/api/store-admin/suppliers/") && pathname.endsWith("/status")) {
      const supplierId=id(pathname.slice("/api/store-admin/suppliers/".length,-"/status".length)); const b=await body(request); const status=String(b?.status??"");
      if(!supplierId||!["draft","published","archived"].includes(status)) return json({ok:false,error:"invalid_supplier_status"},400);
      const r=await env.STORE_DB.prepare("UPDATE commerce_suppliers SET status=?1,updated_at=?2 WHERE id=?3").bind(status,now(),supplierId).run();
      if(!r.meta?.changes) return json({ok:false,error:"supplier_not_found"},404); return json({ok:true});
    }

    if (request.method === "GET" && pathname === "/api/store-admin/rfqs") {
      const rows=await env.STORE_DB.prepare(`SELECT id,request_number,customer_id,status,product_id,product_name,quantity,destination_country,destination_location,target_timing,description,created_at,updated_at FROM commerce_rfqs ORDER BY created_at DESC LIMIT 200`).all();
      return json({ok:true,rfqs:rows.results||[]});
    }
    if (request.method === "POST" && pathname.startsWith("/api/store-admin/rfqs/") && pathname.endsWith("/status")) {
      const rfqId=id(pathname.slice("/api/store-admin/rfqs/".length,-"/status".length)); const b=await body(request); const status=String(b?.status??"");
      if(!rfqId||!["submitted","reviewing","matched","quoted","negotiating","converted","cancelled"].includes(status)) return json({ok:false,error:"invalid_rfq_status"},400);
      const r=await env.STORE_DB.prepare("UPDATE commerce_rfqs SET status=?1,updated_at=?2 WHERE id=?3").bind(status,now(),rfqId).run(); if(!r.meta?.changes)return json({ok:false,error:"rfq_not_found"},404); return json({ok:true});
    }
    if (request.method === "POST" && pathname === "/api/store-admin/rfq-matches") {
      const b=await body(request); if(!id(b?.rfq_id)||!id(b?.supplier_id))return json({ok:false,error:"invalid_match"},400);
      const matchId=crypto.randomUUID(),stamp=now();
      await env.STORE_DB.prepare("INSERT INTO commerce_rfq_supplier_matches (id,rfq_id,supplier_id,status,created_at,updated_at) VALUES (?1,?2,?3,'matched',?4,?4) ON CONFLICT(rfq_id,supplier_id) DO UPDATE SET status='matched',updated_at=excluded.updated_at").bind(matchId,id(b.rfq_id),id(b.supplier_id),stamp).run();
      return json({ok:true,match_id:matchId},201);
    }

    if (request.method === "GET" && pathname === "/api/store-admin/quotes") {
      const rows=await env.STORE_DB.prepare(`SELECT id,quote_number,rfq_id,supplier_id,product_id,product_name,quantity,unit_price_minor,currency,packaging_cost_minor,shipping_cost_minor,insurance_cost_minor,other_fees_minor,total_amount_minor,lead_time,validity_until,status,created_at,updated_at FROM commerce_quotes ORDER BY created_at DESC LIMIT 200`).all(); return json({ok:true,quotes:rows.results||[]});
    }
    if (request.method === "POST" && pathname === "/api/store-admin/quotes") {
      const b=await body(request); const rfqId=id(b?.rfq_id),supplierId=id(b?.supplier_id),productId=b?.product_id?id(b.product_id):null,productName=String(b?.product_name??"").trim(),quantity=String(b?.quantity??"").trim(),currency=String(b?.currency??"").trim().toUpperCase();
      const unit=Number(b?.unit_price_minor),pack=Number(b?.packaging_cost_minor??0),ship=Number(b?.shipping_cost_minor??0),ins=Number(b?.insurance_cost_minor??0),other=Number(b?.other_fees_minor??0);
      if(!rfqId||!supplierId||!productName||!quantity||!currency||![unit,pack,ship,ins,other].every(Number.isInteger)||[unit,pack,ship,ins,other].some(v=>v<0)) return json({ok:false,error:"invalid_quote"},400);
      const total=unit+pack+ship+ins+other, quoteId=crypto.randomUUID(),stamp=now(),quoteNumber=`AGZ-Q-${stamp.replace(/[-:TZ.]/g,"").slice(0,14)}-${quoteId.slice(0,8).toUpperCase()}`;
      await env.STORE_DB.prepare(`INSERT INTO commerce_quotes (id,quote_number,rfq_id,supplier_id,product_id,product_name,quantity,unit_price_minor,currency,packaging_cost_minor,shipping_cost_minor,insurance_cost_minor,other_fees_minor,total_amount_minor,lead_time,validity_until,payment_terms,incoterm,destination,notes,status,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,'draft',?21,?21)`).bind(quoteId,quoteNumber,rfqId,supplierId,productId,productName,quantity,unit,currency,pack,ship,ins,other,total,b.lead_time??null,b.validity_until??null,b.payment_terms??null,b.incoterm??null,b.destination??null,b.notes??null,stamp).run();
      return json({ok:true,quote_id:quoteId,quote_number:quoteNumber,total_amount_minor:total},201);
    }
    if (request.method === "POST" && pathname.startsWith("/api/store-admin/quotes/") && pathname.endsWith("/status")) {
      const quoteId=id(pathname.slice("/api/store-admin/quotes/".length,-"/status".length)); const b=await body(request); const status=String(b?.status??"");
      if(!quoteId||!["draft","sent","accepted","rejected","expired","converted","cancelled"].includes(status))return json({ok:false,error:"invalid_quote_status"},400);
      const r=await env.STORE_DB.prepare("UPDATE commerce_quotes SET status=?1,updated_at=?2 WHERE id=?3").bind(status,now(),quoteId).run(); if(!r.meta?.changes)return json({ok:false,error:"quote_not_found"},404); return json({ok:true});
    }

    if (request.method === "GET" && pathname === "/api/store-admin/b2b-orders") {
      const rows=await env.STORE_DB.prepare(`SELECT id,order_number,customer_id,rfq_id,quote_id,supplier_id,status,currency,subtotal_minor,total_minor,product_id,product_name,quantity,created_at,updated_at FROM commerce_b2b_orders ORDER BY created_at DESC LIMIT 200`).all(); return json({ok:true,orders:rows.results||[]});
    }
    if (request.method === "POST" && pathname.startsWith("/api/store-admin/b2b-orders/") && pathname.endsWith("/status")) {
      const orderId=id(pathname.slice("/api/store-admin/b2b-orders/".length,-"/status".length)); const b=await body(request); const status=String(b?.status??"");
      if(!orderId||!["pending_confirmation","confirmed","proforma_pending","payment_pending","sourcing","shipping","delivered","completed","cancelled","rejected"].includes(status))return json({ok:false,error:"invalid_order_status"},400);
      const r=await env.STORE_DB.prepare("UPDATE commerce_b2b_orders SET status=?1,updated_at=?2 WHERE id=?3").bind(status,now(),orderId).run(); if(!r.meta?.changes)return json({ok:false,error:"order_not_found"},404); return json({ok:true});
    }

    if (request.method === "GET" && pathname === "/api/store-admin/customers") {
      const rows=await env.STORE_DB.prepare("SELECT id,email,name,phone,company,country,status,email_verified_at,created_at,updated_at FROM customers ORDER BY created_at DESC LIMIT 200").all(); return json({ok:true,customers:rows.results||[]});
    }
    return json({ok:false,error:"not_found"},404);
  } catch (error) {
    return json({ok:false,error:"store_admin_service_unavailable"},503);
  }
}
