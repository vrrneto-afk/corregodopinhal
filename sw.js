const CACHE_NAME = "sitio-corrego-v8";

const URLS = [
  "/sitio-corrego-do-pinhal/",
  "/sitio-corrego-do-pinhal/index.html",
  "/sitio-corrego-do-pinhal/manifest.json",
  "/sitio-corrego-do-pinhal/logo-v2.png"
];

/* 🔧 INSTALA */
self.addEventListener("install", event => {
  self.skipWaiting(); // força instalação imediata

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS);
    })
  );
});

/* 🚀 ATIVA */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim()) // assume controle imediato
  );
});

/* 🌐 FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
