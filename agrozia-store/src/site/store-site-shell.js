import { getStoreDirection, resolveStoreLanguage } from "./store-i18n.js";
import { getCommerceContent } from "./store-commerce-content.js";

const esc = (v="") => String(v).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

const categoryData = [
  ["cat-fertilizers-crop-nutrition","fertilizers"],
  ["cat-crop-protection","inputs"],
  ["cat-seeds-planting-material","planting"],
  ["cat-agricultural-equipment","equipment"],
  ["cat-agricultural-products","produce"],
  ["cat-technical-sourcing-services","services"]
];

function languageOptions(language) {
  const options = [
    ["en","English"],["fa","فارسی"],["ar","العربية"],["tr","Türkçe"],
    ["ru","Русский"],["uz","O‘zbek"],["ckb","کوردی سۆرانی"]
  ];
  return options.map(([code,label]) => `<option value="${code}"${code===language?" selected":""}>${esc(label)}</option>`).join("");
}

function header(language, c) {
  const links = [
    ["/",c.navHome],[ "/products",c.navProducts ],["/suppliers",c.navSuppliers],
    ["/rfq",c.navRfq],["/orders",c.navOrders],["/account",c.navAccount]
  ];
  return `<header class="store-header"><div class="topbar"><a class="brand" href="/"><strong>${esc(c.brand)}</strong><small>${esc(c.sub)}</small></a><nav>${links.map(([href,label])=>`<a href="${href}">${esc(label)}</a>`).join("")}</nav><div class="actions"><a href="/cart">${esc(c.navCart)}</a><a class="account" href="/account">${esc(c.navAccount)}</a><label><span class="sr-only">${esc(c.language)}</span><select id="store-language" aria-label="${esc(c.language)}">${languageOptions(language)}</select></label></div><button class="menu" aria-label="Menu" aria-expanded="false">☰</button></div></header>`;
}

function categorySection(language,c) {
  return `<section class="section"><div class="section-head"><div><span class="kicker">${esc(c.categoriesTitle)}</span><h2>${esc(c.categoriesTitle)}</h2></div><p>${esc(c.categoriesLead)}</p></div><div class="category-grid">${categoryData.map(([id,key],i)=>`<a class="category" href="/products?category=${encodeURIComponent(id)}"><span>0${i+1}</span><h3>${esc(c[key])}</h3><b>→</b></a>`).join("")}</div></section>`;
}

function howSection(c) {
  const steps=[[c.step1,c.step1b],[c.step2,c.step2b],[c.step3,c.step3b]];
  return `<section class="section process"><div class="section-head"><div><span class="kicker">${esc(c.howTitle)}</span><h2>${esc(c.howTitle)}</h2></div></div><div class="process-grid">${steps.map(([a,b],i)=>`<article><span>0${i+1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></article>`).join("")}</div></section>`;
}

function home(language,c) {
  return `<main>
    <section class="hero"><div><span class="kicker">${esc(c.heroKicker)}</span><h1>${esc(c.heroTitle)}</h1><p>${esc(c.heroLead)}</p><div class="hero-actions"><a class="btn primary" href="/products">${esc(c.browse)}</a><a class="btn secondary" href="/rfq">${esc(c.rfq)}</a></div></div><div class="hero-card"><span>AGZ STORE</span><strong>01</strong><p>${esc(c.sub)}</p><div class="hero-lines"><i></i><i></i><i></i></div></div></section>
    ${categorySection(language,c)}
    <section class="split"><div><span class="kicker">${esc(c.suppliersTitle)}</span><h2>${esc(c.suppliersTitle)}</h2><p>${esc(c.suppliersLead)}</p><a class="btn secondary" href="/suppliers">${esc(c.suppliers)}</a></div><div class="feature-panel"><span>SUPPLIER NETWORK</span><strong>RFQ → MATCH → QUOTE</strong><p>${esc(c.rfqLead)}</p></div></section>
    ${howSection(c)}
    <section class="rfq-banner"><div><span class="kicker">${esc(c.rfqTitle)}</span><h2>${esc(c.rfqTitle)}</h2><p>${esc(c.rfqLead)}</p></div><a class="btn light" href="/rfq">${esc(c.startRfq)}</a></section>
    <section class="account-banner"><div><span class="kicker">${esc(c.accountTitle)}</span><h2>${esc(c.accountTitle)}</h2><p>${esc(c.accountLead)}</p></div><div class="hero-actions"><a class="btn primary" href="/account/login">${esc(c.signIn)}</a><a class="btn secondary" href="/account/register">${esc(c.register)}</a></div></section>
  </main>`;
}

function fallbackPage(pathname,c) {
  return `<main><section class="simple"><span class="kicker">${esc(c.navProducts)}</span><h1>${esc(c.brand)}</h1><p>${esc(c.footer)}</p><a class="btn primary" href="/products">${esc(c.browse)}</a></section></main>`;
}

export function storeSiteShell(pathname="/", language="en") {
  const lang = resolveStoreLanguage(language);
  const c = getCommerceContent(lang);
  const content = pathname === "/" ? home(lang,c) : fallbackPage(pathname,c);
  const dir = getStoreDirection(lang);
  return `<!doctype html><html lang="${esc(lang)}" dir="${dir}" data-store-language="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(c.heroLead)}"><title>${esc(c.brand)}</title><style>${css}</style></head><body>${header(lang,c)}${content}<footer><strong>${esc(c.brand)}</strong><span>${esc(c.footer)}</span></footer><script>${js}</script></body></html>`;
}

export function siteResponse(pathname, language="en") {
  return new Response(storeSiteShell(pathname,language),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
}

const css=`*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#17251f;background:#f8faf8;line-height:1.6}a{text-decoration:none;color:inherit}.store-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.97);border-bottom:1px solid #dfe7e1}.topbar{min-height:74px;max-width:1280px;margin:auto;padding:0 24px;display:flex;align-items:center;gap:28px}.brand{display:flex;flex-direction:column;min-width:205px}.brand strong{font-size:20px;letter-spacing:.08em}.brand small{font-size:9px;letter-spacing:.14em;color:#718078}nav{display:flex;gap:18px;flex:1}nav a{font-size:13px;color:#4b5c53;padding:27px 0;border-bottom:2px solid transparent}nav a:hover{color:#174d37;border-bottom-color:#9abf4c}.actions{display:flex;align-items:center;gap:12px;font-size:13px}.actions>a:first-child{color:#174d37}.account{border:1px solid #cfdad3;border-radius:8px;padding:8px 11px}.actions select{border:0;background:#fff;font-weight:700}.menu{display:none;border:0;background:none;font-size:23px}.hero{max-width:1280px;margin:auto;padding:88px 24px 78px;display:grid;grid-template-columns:1.2fr .8fr;gap:60px;align-items:center}.kicker{display:inline-block;text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:800;color:#337051;margin-bottom:12px}.hero h1,.simple h1{font-size:clamp(44px,6vw,76px);line-height:1.02;letter-spacing:-.045em;margin:0 0 22px;max-width:800px}.hero p{font-size:18px;color:#63736a;max-width:720px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.btn{display:inline-block;padding:12px 18px;border-radius:8px;font-weight:800}.primary{background:#174d37;color:#fff}.secondary{border:1px solid #174d37;color:#174d37;background:#fff}.light{background:#fff;color:#174d37}.hero-card{min-height:360px;border-radius:20px;background:#173a2c;color:#fff;padding:30px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 20px 55px rgba(23,58,44,.15)}.hero-card span{font-size:11px;letter-spacing:.18em;color:#c6db9f}.hero-card strong{font-size:110px;line-height:1;color:#a9c75b}.hero-card p{color:#d7e4dc}.hero-lines{display:flex;align-items:end;gap:8px;height:90px}.hero-lines i{display:block;flex:1;background:#a9c75b;border-radius:12px 12px 2px 2px}.hero-lines i:nth-child(1){height:35%}.hero-lines i:nth-child(2){height:62%}.hero-lines i:nth-child(3){height:90%}.section{max-width:1280px;margin:auto;padding:78px 24px}.section-head{display:flex;justify-content:space-between;gap:40px;align-items:end;margin-bottom:30px}.section-head h2,.split h2,.rfq-banner h2,.account-banner h2{font-size:clamp(30px,4vw,48px);line-height:1.1;margin:0}.section-head p{max-width:430px;color:#63736a}.category-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.category{min-height:180px;padding:25px;border:1px solid #dce6df;border-radius:14px;background:#fff;display:flex;flex-direction:column;justify-content:space-between;transition:.18s}.category:hover{transform:translateY(-3px);border-color:#a9c75b}.category span{font-size:11px;color:#72923d;font-weight:800}.category h3{font-size:21px;max-width:260px}.category b{color:#174d37;font-size:22px}.split{max-width:1280px;margin:30px auto;padding:78px 24px;display:grid;grid-template-columns:1fr 1fr;gap:35px;align-items:stretch;background:#eef4ee}.split>div:first-child{padding:25px}.split p{color:#63736a;max-width:550px}.feature-panel{border-radius:18px;background:#173a2c;color:#fff;padding:35px;display:flex;flex-direction:column;justify-content:center}.feature-panel span{font-size:11px;letter-spacing:.15em;color:#c6db9f}.feature-panel strong{font-size:34px;margin:15px 0}.feature-panel p{color:#d7e4dc}.process-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.process-grid article{background:#fff;border:1px solid #dce6df;border-radius:14px;padding:25px}.process-grid article>span{font-size:12px;font-weight:800;color:#72923d}.process-grid h3{font-size:23px;margin:18px 0 8px}.process-grid p{color:#63736a}.rfq-banner,.account-banner{max-width:1232px;margin:0 auto 30px;border-radius:18px;padding:42px 48px;display:flex;justify-content:space-between;align-items:center;gap:25px}.rfq-banner{background:#174d37;color:#fff}.rfq-banner .kicker{color:#c6db9f}.rfq-banner p{color:#d7e4dc;max-width:650px}.account-banner{background:#fff;border:1px solid #dce6df}.simple{max-width:900px;margin:auto;padding:100px 24px}.simple p{color:#63736a;margin-bottom:30px}footer{margin-top:70px;background:#10291f;color:#d9e5de;padding:35px 24px;display:flex;justify-content:space-between;gap:20px;max-width:none}footer strong{letter-spacing:.1em}footer span{color:#9fb2a8;font-size:13px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:1050px){nav{gap:10px}.actions .account{display:none}.hero{grid-template-columns:1fr}.hero-card{max-width:650px}.category-grid{grid-template-columns:1fr 1fr}}@media(max-width:760px){.topbar{min-height:68px}.menu{display:block;margin-left:auto}nav{display:none;position:absolute;top:68px;left:0;right:0;background:#fff;border-bottom:1px solid #dfe7e1;padding:10px 20px;flex-direction:column;gap:0}.store-header.open nav{display:flex}nav a{padding:10px 0;border:0}.actions{display:none}.brand{min-width:0}.brand small{font-size:7px}.hero{padding-top:55px}.hero h1,.simple h1{font-size:46px}.section-head{display:block}.category-grid,.process-grid,.split{grid-template-columns:1fr}.split{padding:35px 24px}.rfq-banner,.account-banner{margin-left:24px;margin-right:24px;padding:30px;display:block}.rfq-banner .btn,.account-banner .hero-actions{margin-top:20px}footer{display:block}footer span{display:block;margin-top:10px}}`;

const js=`const m=document.querySelector(".menu");m?.addEventListener("click",()=>{const h=document.querySelector(".store-header");const open=h.classList.toggle("open");m.setAttribute("aria-expanded",String(open));});document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".store-header")?.classList.remove("open")));const s=document.querySelector("#store-language");s?.addEventListener("change",()=>{const u=new URL(location.href);u.searchParams.set("lang",s.value);location.href=u.toString()});`;
