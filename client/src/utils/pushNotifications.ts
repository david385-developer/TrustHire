import api from '../services/api';

/**
 * Converts a VAPID public key string to a format required by the push manager
 */
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Registers the service worker
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
};

/**
 * Checks current notification permission status
 */
export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
};

/**
 * Subscribes the current user/device to push notifications
 */
export const subscribeToPush = async () => {
  try {
    // 1. Check browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    // 2. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was not granted:', permission);
      return false;
    }

    // 3. Register service worker (if not already)
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.error('No service worker registration ready');
      return false;
    }

    // 4. Get VAPID public key from backend
    const { data } = await api.get('/notifications/vapid-public-key');
    if (!data?.publicKey) {
      console.error('VAPID public key not found');
      return false;
    }

    // 5. Get current subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey)
      });
    }

    // 6. Send subscription object to backend to store
    await api.post('/notifications/subscribe', {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      },
      deviceInfo: {
        browser: navigator.userAgent.split(') ').pop()?.split(' ')[0] || 'Unknown',
        os: navigator.userAgent.split('(')[1].split(';')[0] || 'Unknown'
      }
    });

    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
};

/**
 * Unsubscribes the current user's device
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Notify backend to deactivate subscription
      await api.post('/notifications/unsubscribe', {
        endpoint: subscription.endpoint
      });

      // Unsubscribe from push manager
      await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
};
