import { storeSiteShell } from "./store-site-shell.js";

function withLiveProductsScript(html, mode) {
  const bootstrap = mode === "detail" ? detailScript() : listingScript();
  return html.replace("</body></html>", `<script>${bootstrap}</script></body></html>`);
}

function listingScript() {
  return `(()=>{
    const section=document.querySelector('.page-hero + .section');
    if(!section)return;
    const grid=section.querySelector('.grid.three');
    if(!grid)return;
    grid.setAttribute('data-live-products','loading');
    grid.innerHTML='<div class="card" data-products-state="loading"><span class="status">LIVE CATALOG</span><h3>Loading products…</h3><p>Connecting to the Agro-Zia Store product catalog.</p></div>';
    const esc=(v)=>String(v??'').replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]));
    const card=(p)=>'<article class="product-card"><div class="product-media">AGZ / LIVE</div><div class="product-body"><span class="status">'+esc(p.availability_status||'AVAILABLE')+'</span><p class="product-category">'+esc(p.brand||p.category_id||'AGRICULTURAL PRODUCT')+'</p><h3>'+esc(p.name)+'</h3><p>'+esc(p.short_description||'Product details, specification, supplier availability and commercial conditions.')+'</p><a class="button secondary" href="/products/'+encodeURIComponent(p.slug)+'">View product →</a></div></article>';
    fetch('/api/products?limit=50',{headers:{'accept':'application/json'}}).then(r=>{if(!r.ok)throw new Error('catalog');return r.json()}).then(data=>{
      const items=Array.isArray(data.items)?data.items:[];
      grid.setAttribute('data-live-products','ready');
      grid.innerHTML=items.length?items.map(card).join(''):'<div class="card" data-products-state="empty"><span class="status">LIVE CATALOG</span><h3>No published products yet</h3><p>The Store API is connected, but no published products are currently available.</p><a class="button secondary" href="/rfq">Request a Product</a></div>';
      const toolbar=section.querySelector('.catalog-toolbar');
      if(toolbar)toolbar.innerHTML='<span>'+items.length+' published product'+(items.length===1?'':'s')+'</span><span>Source: Store Product API</span>';
    }).catch(()=>{
      grid.setAttribute('data-live-products','error');
      grid.innerHTML='<div class="card" data-products-state="error"><span class="status">CATALOG UNAVAILABLE</span><h3>Products could not be loaded</h3><p>The live Store Product API is temporarily unavailable. No sample catalog data is presented as live inventory.</p><a class="button secondary" href="/rfq">Submit an RFQ</a></div>';
    });
  })();`;
}

function detailScript() {
  return `(()=>{
    const root=document.querySelector('.product-detail');
    if(!root)return;
    root.setAttribute('data-live-product','loading');
    const raw=location.pathname.split('/').filter(Boolean).pop()||'';
    const slug=decodeURIComponent(raw);
    root.innerHTML='<div class="card"><span class="status">LIVE PRODUCT</span><h1>Loading product…</h1><p class="lead">Connecting to the Agro-Zia Store product catalog.</p></div>';
    const esc=(v)=>String(v??'').replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]));
    fetch('/api/products/'+encodeURIComponent(slug),{headers:{'accept':'application/json'}}).then(r=>{if(!r.ok)throw new Error('product');return r.json()}).then(data=>{
      const p=data.product;
      if(!p)throw new Error('missing');
      const specs=p.specifications&&typeof p.specifications==='object'?p.specifications:{};
      const specRows=Object.entries(specs).slice(0,12).map(([k,v])=>'<li><strong>'+esc(k)+'</strong><span>'+esc(v)+'</span></li>').join('');
      root.setAttribute('data-live-product','ready');
      root.innerHTML='<div class="detail-media">AGZ<br><strong>PRODUCT</strong><small>'+esc(p.slug)+'</small></div><div><p class="eyebrow">LIVE PRODUCT</p><h1>'+esc(p.name)+'</h1><p class="lead">'+esc(p.short_description||p.description||'Published agricultural product.')+'</p><div class="detail-grid"><div class="card"><span class="status">TECHNICAL</span><h3>Specification</h3><p>Origin: '+esc(p.origin_country||'—')+' · Unit: '+esc(p.unit||'—')+' · MOQ: '+esc(p.moq||'—')+'</p>'+(specRows?'<ul class="live-specs">'+specRows+'</ul>':'<p>Detailed specifications will be provided through the published product record.</p>')+'</div><div class="card"><span class="status">COMMERCIAL</span><h3>Commercial terms</h3><p>Availability: '+esc(p.availability_status||'—')+' · Lead time: '+esc(p.lead_time||'—')+'</p><p>Price visibility: '+esc(p.price_visibility||'—')+' · Currency: '+esc(p.currency||'—')+'</p><p>Incoterms: '+esc(p.incoterms||'—')+'</p></div></div><div class="actions"><a class="button primary" href="/cart">Add to Cart</a><a class="button secondary" href="/rfq">Request a Quote</a></div></div>';
    }).catch(()=>{
      root.setAttribute('data-live-product','error');
      root.innerHTML='<div class="card"><span class="status">PRODUCT UNAVAILABLE</span><h1>Product not found</h1><p class="lead">The requested product is not published or the live Store Product API is temporarily unavailable.</p><div class="actions"><a class="button primary" href="/products">Back to Products</a><a class="button secondary" href="/rfq">Request a Quote</a></div></div>';
    });
  })();`;
}

export function productsSiteResponse(pathname) {
  const detail = /^\/products\/[^/]+$/.test(pathname);
  const html = storeSiteShell(pathname);
  const headers = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };
  return new Response(withLiveProductsScript(html, detail ? "detail" : "listing"), { headers });
}
