import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance = null;

export const getEcho = () => {
  if (typeof window === 'undefined') return null;

  const key = import.meta.env.VITE_PUSHER_APP_KEY || 'c7c2a8df51e9766c5a88';
  const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1';

  if (!key) return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: key,
      cluster: cluster,
      forceTLS: true,
    });
  }

  return echoInstance;
};
