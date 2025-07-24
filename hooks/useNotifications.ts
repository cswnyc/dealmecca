'use client';

import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'dealmecca-notification',
        ...options
      });
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window
  };
} 