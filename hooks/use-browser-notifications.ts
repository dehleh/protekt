'use client';

import { useCallback, useEffect, useState } from 'react';

export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<BrowserNotificationPermission>('unsupported');
  const supported = permission !== 'unsupported';

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const timer = window.setTimeout(() => setPermission(window.Notification.permission), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const enable = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    const next = await window.Notification.requestPermission();
    setPermission(next);
    return next === 'granted';
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || window.Notification.permission !== 'granted') return;
    new window.Notification(title, { body, icon: '/favicon.svg', tag: 'shomar-warning' });
  }, []);

  return { supported, permission, enable, notify };
}
