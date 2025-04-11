// sw.js (service worker)
const cacheName = 'test-1';
const swfiles = [
  './',
  './index.html',
  './app.js',
  './jszip.min.js',
  './loading.gif',  
  './style.css',
  './favicon.ico',
  './icons/icon512.png',
];

const contentToCache = [];
contentToCache.concat(swfiles);

// pwa has non-DOM workspace
self.addEventListener('install', (evt) => {
  console.log('[sw.js] installing ... ');
  evt.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[sw.js] caching all: app shell and content');
      await cache.addAll(contentToCache);
    })(),
  );

// oninstall
});


// pwa works offline
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    (async () => {
      const r = await caches.match(evt.request);
      console.log(`[sw.js] Fetching resource: ${evt.request.url}`);
      console.log(evt);
      if (r) {
        return r;
      }
      const response = await fetch(evt.request);
      const cache = await caches.open(cacheName);
      console.log(`[sw.js] Caching new resource: ${evt.request.url}`);
      cache.put(evt.request, response.clone());
      return response;
    })(),
  );

// onfetch
});
