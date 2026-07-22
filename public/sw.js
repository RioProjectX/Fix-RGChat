// Service Worker for KopelChat PWA & Background Notifications
const CACHE_NAME = "kopelchat-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
];

// Install Event
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network First, then Cache fallback)
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    return; // Do not cache API endpoints
  }
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Listen for Push / System Notifications
self.addEventListener("push", (event) => {
  let data = { title: "Pesan Baru 💖", body: "Ada pesan baru dari pasanganmu!", url: "/" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Buka Obrolan 💬" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
