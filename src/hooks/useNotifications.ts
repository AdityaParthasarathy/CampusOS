"use client";

import { useState, useEffect, useCallback } from 'react';

const PREF_KEY = 'campus-notifications-enabled';

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotifications() {
  const [permission, setPermission] = useState<NotifPermission>('default');
  const [enabled, setEnabled]       = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    const perm = Notification.permission as NotifPermission;
    setPermission(perm);
    const stored = localStorage.getItem(PREF_KEY);
    setEnabled(perm === 'granted' && stored !== 'false');
  }, []);

  /** Ask for permission, returns whether it was granted */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      localStorage.setItem(PREF_KEY, 'true');
      setEnabled(true);
      setPermission('granted');
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);

    if (result === 'granted') {
      localStorage.setItem(PREF_KEY, 'true');
      setEnabled(true);
      return true;
    }
    return false;
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.setItem(PREF_KEY, 'false');
    setEnabled(false);
  }, []);

  return { permission, enabled, requestPermission, disableNotifications };
}

/** Fire a single browser notification — safe to call anywhere */
export function showBrowserNotification(title: string, body: string, tag?: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (localStorage.getItem(PREF_KEY) === 'false') return;

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: tag || `campusos-${Date.now()}`,
      requireInteraction: false,
    });
  } catch {
    // Some browsers block Notification constructor outside service worker — silently ignore
  }
}
