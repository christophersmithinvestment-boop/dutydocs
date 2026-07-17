const CACHE_NAME = "dutydocs-v2";

// Dev-mode chunk URLs are stable but their content changes constantly,
// so caching on localhost serves stale code after every edit.
const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

// Core app shell to pre-cache
const APP_SHELL = [
    "/",
    "/risk-assessment",
    "/coshh",
    "/rams",
    "/incidents",
    "/inspections",
    "/toolbox-talks",
    "/permits",
    "/near-miss",
    "/dse",
    "/manual-handling",
    "/fire-drills",
    "/first-aid",
    "/ppe-register",
    "/training-records",
    "/emergency-contacts",
    "/settings",
    "/more",
];

// Install — pre-cache the app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL);
        })
    );
    self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network-first for navigation, cache-first for assets
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Never intercept in dev — always hit the dev server
    if (IS_DEV) return;

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith("http")) return;

    // Navigation requests (HTML pages) — network first, fall back to cache
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
        );
        return;
    }

    // Static assets (JS, CSS, images, fonts) — cache first, fall back to network
    if (
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "image" ||
        request.destination === "font" ||
        request.url.includes("/_next/")
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Everything else — network first
    event.respondWith(
        fetch(request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            })
            .catch(() => caches.match(request))
    );
});
