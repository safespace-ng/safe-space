const V="ss-v1";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const HOSTS=["www.gstatic.com","fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url),same=u.origin===location.origin;
 if(!same&&!HOSTS.includes(u.hostname))return;
 e.respondWith((async()=>{
  const c=await caches.open(V);
  try{
   const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),6000);
   const res=await fetch(same?u.href:r,{cache:same?"no-cache":"default",signal:ctl.signal});
   clearTimeout(t);
   if(res&&(res.ok||res.type==="opaque"))c.put(same?u.href:r,res.clone());
   return res;
  }catch(err){
   const hit=(await c.match(same?u.href:r,{ignoreSearch:true}))||(r.mode==="navigate"&&(await c.match(self.registration.scope,{ignoreSearch:true})));
   if(hit)return hit;
   throw err;
  }
 })());
});
