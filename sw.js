const C="subscrap-0.31.0",P="subscrap-";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./index.html"]))) });
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith(P)&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
 if(e.request.mode!=="navigate")return;
 e.respondWith(fetch(e.request,{cache:"no-store"}).then(res=>{
  if(res&&res.ok){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl).catch(()=>{}))}return res;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});