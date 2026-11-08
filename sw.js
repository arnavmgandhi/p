/**
 * SERVICE WORKER (PWA)
 * Versioned cache management, network-first for HTML, cache-first for static assets,
 * and offline fallback.
 */

const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE_NAME = `arnav-portfolio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `arnav-portfolio-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = './offline.html';

// Core static assets required for offline rendering
const CORE_PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './404.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/sections.css',
  './js/projects-data.js',
  './js/animations.js',
  './js/main.js',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

/**
 * Installation Event: Pre-cache core static shell assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activation Event: Clean up outdated caches
 */
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch Event Handler
 * Strategies:
 *   - Navigation requests (HTML documents): Network-first with offline.html fallback
 *   - Static assets (CSS, JS, images, fonts): Cache-first with dynamic cache update
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extension schemas
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation / Document Requests (HTML): Network-First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache, or offline fallback screen
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Images, Icons, Fonts): Cache-First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Cache hit: return response immediately and fetch in background if stale
          fetchAndCache(request, DYNAMIC_CACHE_NAME);
          return cachedResponse;
        }

        // Cache miss: fetch from network and store in dynamic cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // For image failures when offline, return placeholder if available
            if (request.destination === 'image') {
              return caches.match('./assets/icons/favicon.svg');
            }
          });
      })
  );
});

/**
 * Background update helper for cache-first strategy
 */
function fetchAndCache(request, cacheName) {
  fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    })
    .catch(() => {
      // Quietly ignore background network errors when offline
    });
}
