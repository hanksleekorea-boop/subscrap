const C="subscrap-0.23.0";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./index.html"]).catch(()=>{})))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
 e.respondWith(fetch(e.request,{cache:"no-store"}).then(res=>{
  if(res&&res.ok){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl).catch(()=>{}))}return res;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});