/*
 * Offline-valimuisti BD99-demolle. Yksi tie, yksi JSON, ei ajonaikaisia hakuja.
 * Nosta CACHE_NAME jokaisella julkaisulla, muuten puhelin nayttaa vanhaa.
 */
var CACHE_NAME = "bd99demo-v1";
// teroleppanen.github.io on yhteinen origin kaikille Pages-projekteille:
// siivotaan vain omat valimuistit, ei 827:n eika BD392:n.
var CACHE_PREFIX = "bd99demo-";
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "js/core.js",
  "vendor/proj4.js",
  "data/road99.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (k) { return k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE_NAME; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return response;
      });
    })
  );
});
