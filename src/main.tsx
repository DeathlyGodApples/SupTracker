import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator && !window.location.hostname.includes('stackblitz')) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });

      // Request notification permission on service worker activation
      registration.addEventListener('activate', () => {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      });

      // Check for periodic sync support
      if ('periodicSync' in registration) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });
        
        if (status.state === 'granted') {
          console.log('Periodic sync available');
        }
      }

      console.log('ServiceWorker registration successful');
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);