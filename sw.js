const CACHE_NAME = "corregodopinhal-v1.0.3";

const URLS = [
  "/corregodopinhal/",
  "/corregodopinhal/login/login.html",
  "/corregodopinhal/manifest.json",

  "/corregodopinhal/icon/icon-72.png",
  "/corregodopinhal/icon/icon-192.png",
  "/corregodopinhal/icon/icon-256.png",
  "/corregodopinhal/icon/icon-512.png"
];

/* INSTALA */
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS))
  );
});

/* ATIVA */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* FETCH */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );

});

/* VERSÃO */
self.addEventListener("message", event => {

  if (event.data === "GET_VERSION") {

    event.source.postMessage({
      version: CACHE_NAME
    });

  }

});
