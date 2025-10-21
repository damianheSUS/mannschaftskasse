const CACHE='mkasse-v2-cache1';
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=> c.addAll(['./','index.html','styles.css','app.js','manifest.json','assets/logo_iceblue.png']))) });
self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))) });