const SUPPORTED = new Set(["en", "fa", "ar", "tr", "ru", "uz", "ckb"]);
const RTL = new Set(["fa", "ar", "ckb"]);

export function withStoreLanguageRuntime(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) return response;

  const script = `<script>(function(){try{var p=new URLSearchParams(location.search),u=(p.get("lang")||"").toLowerCase().split("-")[0],s=(localStorage.getItem("agz-store-language")||"").toLowerCase().split("-")[0],L=${JSON.stringify([...SUPPORTED])},r=${JSON.stringify([...RTL])},l=L.indexOf(u)>=0?u:(L.indexOf(s)>=0?s:"en");if(L.indexOf(u)>=0)localStorage.setItem("agz-store-language",l);var e=document.documentElement;e.lang=l;e.dir=r.indexOf(l)>=0?"rtl":"ltr";}catch(_){}})();</script>`;

  return response.text().then((html) => {
    const marker = "<body";
    const index = html.indexOf(marker);
    const end = index >= 0 ? html.indexOf(">", index) + 1 : -1;
    const patched = end > 0 ? html.slice(0, end) + script + html.slice(end) : script + html;
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(patched, { status: response.status, statusText: response.statusText, headers });
  });
}
