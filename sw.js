const V="ss-v2";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const HOSTS=["www.gstatic.com","fonts.googleapis.com","fonts.gstatic.com"];
const OFFLINE='<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui,sans-serif;text-align:center;padding:48px 24px;background:#f7faf8;color:#23353a"><h1 style="color:#1b6b6b">Safe Space</h1><p>We can\'t connect right now. Please check your connection and try again.</p><p><button onclick="location.reload()" style="font-size:1rem;padding:10px 20px;border:0;border-radius:12px;background:#1b6b6b;color:#fff">Try again</button></p></body>';
async function notify(){(await self.clients.matchAll()).forEach(x=>x.postMessage("updated"))}
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url),same=u.origin===location.origin;
 if(!same&&!HOSTS.includes(u.hostname))return;
 const key=same?u.origin+u.pathname:r.url;
 e.respondWith((async()=>{
  const c=await caches.open(V);
  const hit=await c.match(key);
  const net=fetch(same?u.href:r,{cache:same?"no-cache":"default"}).then(async res=>{
   if(res&&(res.ok||res.type==="opaque")){
    if(same&&hit){const a=hit.headers.get("etag")||hit.headers.get("last-modified"),b=res.headers.get("etag")||res.headers.get("last-modified");if(a&&b&&a!==b)notify()}
    try{await c.put(key,res.clone())}catch(x){}
   }
   return res;
  });
  if(hit){e.waitUntil(net.catch(()=>{}));return hit}
  try{return await net}catch(err){
   if(r.mode==="navigate")return new Response(OFFLINE,{status:503,headers:{"Content-Type":"text/html; charset=utf-8"}});
   throw err;
  }
 })());
});
