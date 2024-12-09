self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("qr-scanner-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.js",
        "/manifest.json",
        "/images/ajce.png",
        "/images/sih.png",
        "/components/Demographics.js",
        "/components/QRCodeScanner.js",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
