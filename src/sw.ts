import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Precache and route assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache audio files
registerRoute(
  ({ request }) => request.destination === 'audio',
  new CacheFirst({
    cacheName: 'audio-cache',
  })
);

// Handle periodic sync for medication reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag.startsWith('med-reminder-')) {
    const [_, medicationId, type] = event.tag.split('-');

    // Get medication details from IndexedDB or cache
    const getMedicationDetails = async () => {
      const db = await openDB('medtracker', 1, {
        upgrade(db) {
          db.createObjectStore('medications', { keyPath: 'id' });
        },
      });
      return db.get('medications', medicationId);
    };

    event.waitUntil(
      getMedicationDetails().then((medication) => {
        if (medication) {
          const title =
            type === 'main' ? 'Take Your Medication' : 'Medication Reminder';
          const body =
            type === 'main'
              ? `Time to take ${medication.name} (${medication.dosage.amount} ${medication.dosage.unit})`
              : `${medication.name} is due in ${
                  type === 'hour' ? '1 hour' : '10 minutes'
                }`;

          return self.registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `med-${medicationId}-${type}`,
            renotify: true,
            vibrate: [200, 100, 200],
            actions: [
              { action: 'take', title: 'Take Now' },
              { action: 'snooze', title: 'Snooze' },
            ],
          });
        }
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'take') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].postMessage({
            type: 'MEDICATION_TAKEN',
            id: event.notification.tag.split('-')[1],
          });
        } else {
          clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      self.registration.showNotification(event.notification.title, {
        ...event.notification.options,
        body: 'Reminder: ' + event.notification.body,
        tag: event.notification.tag + '-snoozed',
        timestamp: Date.now() + 10 * 60 * 1000,
      })
    );
  }
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => notification.close());
      })
    );
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Claim clients
      clients.claim(),
      // Clear old caches if needed
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== 'audio-cache') {
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});
