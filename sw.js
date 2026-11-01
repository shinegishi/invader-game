const CACHE='invader-pwa-v2';const FILES=['./','./index.html','./game.html','./style.css','./app.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data==='CHECK_READY')e.waitUntil(caches.open(CACHE).then(async c=>{if((await Promise.all(FILES.map(f=>c.match(f)))).every(Boolean))e.source?.postMessage('OFFLINE_READY');}));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request))||fetch(e.request)));});
