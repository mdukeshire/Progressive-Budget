const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "manifest.json",
  "/index.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/index.js",
  "/styles.css",
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => { return cache.addAll(FILES_TO_CACHE); })
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(RUNTIME).then((cachedResponse) => {
        return fetch(event.request)
        .then(response => {
          if(response.status === 200){
            cachedResponse.put(event.request.url, response.clone())
            return response
          }
        })
        .catch(err=> {
          return cachedResponse.match(event.request)
         })
      }).catch(err=>console.log(err))
    )
  }
  event.respondWith
})
  ;