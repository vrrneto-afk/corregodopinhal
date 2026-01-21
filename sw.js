const CACHE_NAME = "corregodopinhal-v1.0.1";

const URLS = [
  "/corregodopinhal/",
  "/corregodopinhal/login/login.html",
  "/corregodopinhal/manifest.json",

  // Ícones
  "/corregodopinhal/icon/icon-72.png",
  "/corregodopinhal/icon/icon-192.png",
  "/corregodopinhal/icon/icon-256.png",
  "/corregodopinhal/icon/icon-512.png"
];

/* 🔧 INSTALA */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS))
  );
});

/* 🚀 ATIVA */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* 🌐 FETCH — NETWORK FIRST (SEGURO PARA LOGIN) */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
