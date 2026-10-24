// Kill switch for the old service worker.
//
// An earlier build registered a cache-first worker at this URL that never
// revalidated, so returning visitors could be pinned to a stale copy of the
// site. Browsers re-fetch this file when checking for worker updates; this
// version installs immediately, deletes the old caches, unregisters itself and
// reloads any open tabs onto the live site. Nothing registers it any more.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
