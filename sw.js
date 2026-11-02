// 📴 離線版（家長：平板帶出門沒網路也要能用）
// 連網打開網頁時，把 index.html 和裡面列的 JS／CSS（含 ?v= 版本號）存在平板裡；沒網路時就用存好的。
// - 網頁本身（index.html）：先上網拿最新的（4 秒內），拿不到才用存好的 → 有網路時一樣會自動更新到最新版
// - JS／CSS：網址有版本號，存好的直接用；每次拿到新的 index.html 就把新版本的檔案存起來、舊版本刪掉
// 沒網路時：Google 的聲音改用平板內建的台灣聲音（speakZhDevice），手寫國字改成交卷時請大人對一對
const CACHE = "kids-english-offline";
const PAGE = new URL("./index.html", self.registration.scope).href;

async function refresh(html) {
  const cache = await caches.open(CACHE);
  if (!html) {
    const r = await fetch(PAGE, { cache: "no-store" });
    if (!r.ok) return;
    html = await r.clone().text();
    await cache.put(PAGE, r);
  }
  const urls = [...html.matchAll(/(?:src|href)="([^"#:]+?\.(?:js|css)\?v=[^"]+)"/g)].map(m => new URL(m[1], self.registration.scope).href);
  if (!urls.length) return;
  await Promise.all(urls.map(async u => {
    if (await cache.match(u)) return;
    const r = await fetch(u, { cache: "no-store" });
    if (r.ok) await cache.put(u, r);
  }));
  const keep = new Set([PAGE, ...urls]);
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
}

self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(refresh().catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Google 的聲音、手寫辨識不管
  const scope = new URL(self.registration.scope);
  const isPage = req.mode === "navigate" || url.pathname === scope.pathname || url.pathname.endsWith("/index.html");
  if (isPage) {
    e.respondWith((async () => {
      try {
        const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 4000);
        const r = await fetch(req.url, { cache: "no-store", signal: ctl.signal });
        clearTimeout(tm);
        if (r.ok) {
          const html = await r.clone().text();
          const cache = await caches.open(CACHE);
          await cache.put(PAGE, r.clone());
          e.waitUntil(refresh(html).catch(() => {}));
        }
        return r;
      } catch (err) {
        return (await caches.match(PAGE)) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    const r = await fetch(req);
    if (r.ok && url.search.includes("v=")) (await caches.open(CACHE)).put(req, r.clone());
    return r;
  })());
});
