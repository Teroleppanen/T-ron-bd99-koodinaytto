/*
 * Offline-valimuisti BD99-demolle. Yksi tie, yksi JSON, ei ajonaikaisia hakuja.
 * Nosta CACHE_NAME jokaisella julkaisulla.
 *
 * v3: verkko ensin, valimuisti varalla. v1-v2 antoi valimuistin ensin, jolloin
 * Teron puhelin naytti vanhaa versiota kentalla vaikka uusi oli julkaistu.
 * Heikossa kentassa 4 s jalkeen annetaan valimuistin versio, jos sellainen on.
 */
var CACHE_NAME = "bd99demo-v8";
// teroleppanen.github.io on yhteinen origin kaikille Pages-projekteille:
// siivotaan vain omat valimuistit, ei 827:n eika BD392:n.
var CACHE_PREFIX = "bd99demo-";
var TIMEOUT_MS = 4000;
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "js/core.js",
  "js/codes.js",
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
  event.respondWith(new Promise(function (resolve) {
    var done = false;
    function finish(response) { if (!done && response) { done = true; resolve(response); } }
    var timer = setTimeout(function () {
      caches.match(event.request, { ignoreSearch: true }).then(finish);
    }, TIMEOUT_MS);
    fetch(event.request).then(function (response) {
      clearTimeout(timer);
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      }
      finish(response);
    }).catch(function () {
      clearTimeout(timer);
      caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
        finish(cached || Response.error());
      });
    });
  }));
});
