const C="subscrap-0.19.0";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html"]).catch(()=>{})))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
  const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl).catch(()=>{}));return res;
 }).catch(()=>caches.match("./index.html"))));});