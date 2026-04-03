// public/sw.js

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'TrustHire', body: event.data.text() };
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const isFocused = clientList.some(
          client => client.focused &&
          client.url.includes(self.location.origin)
        );

        if (isFocused) {
          // Tab is focused — send message to page
          clientList.forEach(client => {
            client.postMessage({
              type: 'NEW_NOTIFICATION',
              data: data
            });
          });
        } else {
          // Tab not focused — show browser notification
          return self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: data.data,
            tag: 'trusthire-' + Date.now(),
            requireInteraction: false
          });
        }
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) &&
            'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
