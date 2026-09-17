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

    const params=new URLSearchParams(location.search);
    const search=params.get('search')||'';const category=params.get('category')||'';
    const limit=12;
    const offset=Math.max(0,Number.parseInt(params.get('offset')||'0',10)||0);

    grid.setAttribute('data-live-products','loading');

    grid.innerHTML='<div class="card" data-products-state="loading"><span class="status">LIVE CATALOG</span><h3>Loading products...</h3><p>Connecting to the Agro-Zia Store product catalog.</p></div>';

    const esc=(v)=>String(v??'').replace(/[&<>\\"']/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '\\"':'&quot;',
      "'":'&#39;'
    }[c]));

    const money=(value,currency)=>{
      if(value===null||value===undefined||value==='')return '';
      const number=Number(value);
      if(!Number.isFinite(number))return esc(value);
      try{
        return new Intl.NumberFormat(undefined,{
          maximumFractionDigits:2
        }).format(number)+' '+esc(currency||'');
      }catch{
        return number+' '+esc(currency||'');
      }
    };

    const price=(p)=>{
      const visibility=String(p.price_visibility||'').toLowerCase();
      const currency=p.currency||'';

      if(visibility==='hidden'){
        return 'Price on request';
      }

      if(visibility==='rfq'){
        return 'Request a quote';
      }

      if(visibility==='starting_from'){
        if(p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''){
          return 'From '+money(p.price_min,currency);
        }
        return 'Request a quote';
      }

      if(visibility==='fixed'){
        if(
          p.price_min!==null&&
          p.price_min!==undefined&&
          p.price_min!==''&&
          p.price_max!==null&&
          p.price_max!==undefined&&
          p.price_max!==''
        ){
          if(Number(p.price_min)===Number(p.price_max)){
            return money(p.price_min,currency);
          }
          return money(p.price_min,currency)+' - '+money(p.price_max,currency);
        }

        if(p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''){
          return money(p.price_min,currency);
        }

        return 'Request a quote';
      }

      if(p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''){
        return 'From '+money(p.price_min,currency);
      }

      return 'Request a quote';
    };

    const card=(p)=>{
      return '<article class="product-card">'+
        '<div class="product-media">AGZ / LIVE</div>'+
        '<div class="product-body">'+
        '<span class="status">'+esc(p.availability_status||'AVAILABLE')+'</span>'+
        '<p class="product-category">'+esc(p.brand||p.category_id||'AGRICULTURAL PRODUCT')+'</p>'+
        '<h3>'+esc(p.name)+'</h3>'+
        '<p>'+esc(p.short_description||'Product details, specification, supplier availability and commercial conditions.')+'</p>'+
        '<p><strong>'+price(p)+'</strong></p>'+
        '<p>'+esc(p.unit?'Unit: '+p.unit:'')+(p.moq?' · MOQ: '+p.moq:'')+'</p>'+
        '<a class="button secondary" href="/products/'+encodeURIComponent(p.slug)+'">View product →</a>'+
        '</div>'+
        '</article>';
    };

    const buildUrl=(newOffset)=>{
      const next=new URL(location.href);

      if(search){
        next.searchParams.set('search',search);
      }else{
        next.searchParams.delete('search');
      }

      if(category){
        next.searchParams.set('category',category);
      }
      if(newOffset>0){
        next.searchParams.set('offset',String(newOffset));
      }else{
        next.searchParams.delete('offset');
      }

      return next.pathname+next.search;
    };

    const renderToolbar=(pagination,total)=>{
      const toolbar=section.querySelector('.catalog-toolbar');

      if(!toolbar)return;

      const currentStart=total?pagination.offset+1:0;
      const currentEnd=Math.min(
        pagination.offset+pagination.limit,
        total
      );

      toolbar.innerHTML=
        '<div class="catalog-search">'+
          '<form method="get" action="/products">'+
            '<input type="search" name="search" value="'+esc(search)+'" placeholder="Search products..." aria-label="Search products">'+
            '<button class="button secondary" type="submit">Search</button>'+
          '</form>'+
        '</div>'+
        '<div class="catalog-meta">'+
          '<span>'+
            (total?
              'Showing '+currentStart+'-'+currentEnd+' of '+total+' published products':
              'No published products'
            )+
          '</span>'+
          '<span>Source: Store Product API</span>'+
        '</div>';
    };    const loadCategories=()=>{
      const toolbar=section.querySelector('.catalog-toolbar');

      if(!toolbar)return;

      fetch('/api/categories',{
        headers:{'accept':'application/json'}
      })
      .then(r=>{
        if(!r.ok)throw new Error('categories');
        return r.json();
      })
      .then(data=>{
        const categories=Array.isArray(data.items)?data.items:[];

        const currentCategory=category;

        const options=categories.map(c=>
          '<option value="'+esc(c.id)+'"'+
          (String(c.id)===String(currentCategory)?' selected':'')+
          '>'+esc(c.name)+'</option>'
        ).join('');

        const searchValue=esc(search);

        toolbar.innerHTML=
          '<form class="catalog-filters" method="get" action="/products">'+
            '<input type="search" name="search" value="'+searchValue+'" placeholder="Search products..." aria-label="Search products">'+
            '<select name="category" aria-label="Filter by category">'+
              '<option value="">All categories</option>'+
              options+
            '</select>'+
            '<button class="button secondary" type="submit">Apply</button>'+
            '<a class="button secondary" href="/products">Clear</a>'+
          '</form>'+
          '<div class="catalog-meta">'+
            '<span>Source: Store Product API</span>'+
          '</div>';
      })
      .catch(()=>{
        const existingSearch=toolbar.querySelector('form');

        if(!existingSearch){
          toolbar.innerHTML=
            '<form method="get" action="/products">'+
              '<input type="search" name="search" value="'+esc(search)+'" placeholder="Search products..." aria-label="Search products">'+
              '<button class="button secondary" type="submit">Search</button>'+
            '</form>'+
            '<div class="catalog-meta"><span>Source: Store Product API</span></div>';
        }
      });
    };

    const renderPagination=(pagination,total)=>{
      const old=section.querySelector('.catalog-pagination');
      if(old)old.remove();

      if(!total)return;

      const wrapper=document.createElement('div');
      wrapper.className='catalog-pagination';

      const previous=offset>0
        ? '<a class="button secondary" href="'+buildUrl(Math.max(0,offset-limit))+'">← Previous</a>'
        : '';

      const next=offset+pagination.limit<total
        ? '<a class="button secondary" href="'+buildUrl(offset+pagination.limit)+'">Next →</a>'
        : '';

      wrapper.innerHTML=
        '<div class="actions">'+
          previous+
          '<span class="status">Page '+(Math.floor(offset/limit)+1)+' of '+Math.max(1,Math.ceil(total/limit))+'</span>'+
          next+
        '</div>';

      section.appendChild(wrapper);
    };

    const endpoint='/api/products?limit='+limit+
      '&offset='+offset+
      (search?'&search='+encodeURIComponent(search):'')+
      (category?'&category='+encodeURIComponent(category):'');

    fetch(endpoint,{
      headers:{'accept':'application/json'}
    })
    .then(r=>{
      if(!r.ok)throw new Error('catalog');
      return r.json();
    })
    .then(data=>{
      const items=Array.isArray(data.items)?data.items:[];
      const pagination=data.pagination||{
        limit,
        offset,
        total:items.length
      };

      const total=Number(pagination.total||0);

      grid.setAttribute('data-live-products','ready');

      grid.innerHTML=items.length
        ? items.map(card).join('')
        : '<div class="card" data-products-state="empty"><span class="status">LIVE CATALOG</span><h3>No products found</h3><p>No published products match the current search.</p><a class="button secondary" href="/products">Clear search</a></div>';

      renderToolbar(pagination,total);
      renderPagination(pagination,total);loadCategories();
    })
    .catch(()=>{
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

    root.innerHTML='<div class="card"><span class="status">LIVE PRODUCT</span><h1>Loading product...</h1><p class="lead">Connecting to the Agro-Zia Store product catalog.</p></div>';

    const esc=(v)=>String(v??'').replace(/[&<>\\"']/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '\\"':'&quot;',
      "'":'&#39;'
    }[c]));

    const money=(value,currency)=>{
      if(value===null||value===undefined||value==='')return '';

      const number=Number(value);

      if(!Number.isFinite(number))return esc(value);

      try{
        return new Intl.NumberFormat(undefined,{
          maximumFractionDigits:2
        }).format(number)+' '+esc(currency||'');
      }catch{
        return number+' '+esc(currency||'');
      }
    };

    const price=(p)=>{
      const visibility=String(p.price_visibility||'').toLowerCase();
      const currency=p.currency||'';

      if(visibility==='hidden'){
        return 'Price on request';
      }

      if(visibility==='rfq'){
        return 'Request a quote';
      }

      if(visibility==='starting_from'){
        return p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''
          ? 'From '+money(p.price_min,currency)
          : 'Request a quote';
      }

      if(visibility==='fixed'){
        if(
          p.price_min!==null&&
          p.price_min!==undefined&&
          p.price_min!==''&&
          p.price_max!==null&&
          p.price_max!==undefined&&
          p.price_max!==''
        ){
          if(Number(p.price_min)===Number(p.price_max)){
            return money(p.price_min,currency);
          }

          return money(p.price_min,currency)+' - '+money(p.price_max,currency);
        }

        if(p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''){
          return money(p.price_min,currency);
        }

        return 'Request a quote';
      }

      return p.price_min!==null&&p.price_min!==undefined&&p.price_min!==''
        ? 'From '+money(p.price_min,currency)
        : 'Request a quote';
    };

    fetch('/api/products/'+encodeURIComponent(slug),{
      headers:{'accept':'application/json'}
    })
    .then(r=>{
      if(!r.ok)throw new Error('product');
      return r.json();
    })
    .then(data=>{
      const p=data.product;

      if(!p)throw new Error('missing');

      const specs=
        p.specifications&&typeof p.specifications==='object'
          ? p.specifications
          : {};

      const specRows=Object.entries(specs)
        .slice(0,12)
        .map(([k,v])=>
          '<li><strong>'+esc(k)+'</strong><span>'+esc(v)+'</span></li>'
        )
        .join('');

      root.setAttribute('data-live-product','ready');

      root.innerHTML=
        '<div class="detail-media">AGZ<br><strong>PRODUCT</strong><small>'+esc(p.slug)+'</small></div>'+
        '<div>'+
          '<p class="eyebrow">LIVE PRODUCT</p>'+
          '<h1>'+esc(p.name)+'</h1>'+
          '<p class="lead">'+esc(p.short_description||p.description||'Published agricultural product.')+'</p>'+
          '<div class="detail-grid">'+
            '<div class="card">'+
              '<span class="status">TECHNICAL</span>'+
              '<h3>Specification</h3>'+
              '<p>Origin: '+esc(p.origin_country||'—')+
              ' · Unit: '+esc(p.unit||'—')+
              ' · MOQ: '+esc(p.moq||'—')+'</p>'+
              (specRows
                ? '<ul class="live-specs">'+specRows+'</ul>'
                : '<p>Detailed specifications will be provided through the published product record.</p>')+
            '</div>'+
            '<div class="card">'+
              '<span class="status">COMMERCIAL</span>'+
              '<h3>Commercial terms</h3>'+
              '<p>Availability: '+esc(p.availability_status||'—')+
              ' · Lead time: '+esc(p.lead_time||'—')+'</p>'+
              '<p><strong>Price: '+price(p)+'</strong></p>'+
              '<p>Incoterms: '+esc(p.incoterms||'—')+'</p>'+
              (p.supply_capacity
                ? '<p>Supply capacity: '+esc(p.supply_capacity)+'</p>'
                : '')+
              (p.packaging
                ? '<p>Packaging: '+esc(p.packaging)+'</p>'
                : '')+
            '</div>'+
          '</div>'+
          '<div class="actions">'+
            '<a class="button primary" href="/cart">Add to Cart</a>'+
            '<a class="button secondary" href="/rfq">Request a Quote</a>'+
          '</div>'+
        '</div>';
    })
    .catch(()=>{
      root.setAttribute('data-live-product','error');

      root.innerHTML='<div class="card"><span class="status">PRODUCT UNAVAILABLE</span><h1>Product not found</h1><p class="lead">The requested product is not published or the live Store Product API is temporarily unavailable.</p><div class="actions"><a class="button primary" href="/products">Back to Products</a><a class="button secondary" href="/rfq">Request a Quote</a></div></div>';
    });
  })();`;
}

export function productsSiteResponse(pathname) {
  const detail=/^\/products\/[^/]+$/.test(pathname);
  const html=storeSiteShell(pathname);

  const headers={
    "content-type":"text/html; charset=utf-8",
    "cache-control":"no-store"
  };

  return new Response(
    withLiveProductsScript(
      html,
      detail ? "detail" : "listing"
    ),
    { headers }
  );
}
