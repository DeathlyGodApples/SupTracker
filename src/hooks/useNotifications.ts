import { useState, useEffect, useCallback, useRef } from 'react';
import useSound from 'use-sound';
import type { Medication } from '../types';
import { debug } from '../utils/debug';

const NOTIFICATION_SOUND = '/notification.mp3';

interface ScheduledNotification {
  id: string;
  medication_id: string; // Changed to match database schema
  type: 'hour' | 'tenMin' | 'main';
  scheduledTime: Date;
  timeoutId: number;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [play] = useSound(NOTIFICATION_SOUND);
  const scheduledNotifications = useRef<ScheduledNotification[]>([]);
  const permissionRef = useRef<NotificationPermission>('default');
  const intervals = useRef<number[]>([]);

  // Initialize permission state and preload sound
  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        // Check if we need to request permission
        if (Notification.permission === 'default') {
          debug.log('notification', 'info', 'Requesting initial notification permission');
          const result = await Notification.requestPermission();
          setPermission(result);
          permissionRef.current = result;
        } else {
          setPermission(Notification.permission);
          permissionRef.current = Notification.permission;
        }
        
        debug.log('notification', 'info', 'Permission status:', Notification.permission);
      } else {
        debug.log('notification', 'error', 'Notifications not supported in this browser');
      }
    };

    // Preload notification sound
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.load();
    
    // Check if sound can be played
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      debug.log('notification', 'info', 'Notification sound preloaded successfully');
    }).catch(error => {
      debug.log('notification', 'warn', 'Failed to preload notification sound', error);
    });

    checkPermission();
  }, []);

  const clearAllScheduled = useCallback(() => {
    debug.log('notification', 'info', 'Clearing all scheduled notifications', {
      count: scheduledNotifications.current.length
    });
    
    scheduledNotifications.current.forEach(notification => {
      clearTimeout(notification.timeoutId);
    });
    intervals.current.forEach(clearInterval);
    scheduledNotifications.current = [];
    intervals.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllScheduled();
    };
  }, [clearAllScheduled]);

  const requestPermission = async () => {
    debug.log('notification', 'info', 'Requesting notification permission');
    
    if (!('Notification' in window)) {
      const error = 'Notifications not supported';
      debug.log('notification', 'error', error);
      setNotificationError(error);
      return false;
    }

    try {
      // First check if permission is already granted
      if (Notification.permission === 'granted') {
        debug.log('notification', 'info', 'Permission already granted');
        setPermission('granted');
        permissionRef.current = 'granted';
        return true;
      }

      // Request permission if not already granted
      const result = await Notification.requestPermission();
      setPermission(result);
      permissionRef.current = result;
      
      debug.log('notification', 'info', 'Permission request result:', result);
      
      if (result === 'denied') {
        setNotificationError('Notification permission denied');
      } else {
        setNotificationError(null);
      }
      return result === 'granted';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug.log('notification', 'error', 'Permission request failed:', errorMessage);
      setNotificationError(errorMessage);
      return false;
    }
  };

  const createNotification = useCallback(async (title: string, body: string, tag: string) => {
    debug.log('notification', 'info', 'Creating notification', { title, body, tag });
    
    if (permissionRef.current !== 'granted') {
      debug.log('notification', 'warn', 'Notification permission not granted');
      return null;
    }

    try {
      try {
        await play();
        debug.log('notification', 'info', 'Notification sound played');
      } catch (soundError) {
        debug.log('notification', 'warn', 'Failed to play notification sound', soundError);
        // Continue with notification even if sound fails
      }

      const iconPath = new URL('/icon-192.png', window.location.origin).href;
      const badgePath = new URL('/icon-192.png', window.location.origin).href;
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        debug.log('notification', 'info', 'Using service worker for notification');
        
        await registration.showNotification(title, {
          body,
          icon: iconPath,
          badge: badgePath,
          tag,
          renotify: true,
          silent: false,
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'take', title: 'Take Now' },
            { action: 'snooze', title: 'Snooze' }
          ]
        });
      } else {
        debug.log('notification', 'info', 'Using fallback notification API');
        const notification = new Notification(title, {
          body,
          icon: iconPath,
          badge: badgePath,
          tag,
          renotify: true,
          silent: false,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      debug.log('notification', 'success', 'Notification created successfully');
      setNotificationError(null);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug.log('notification', 'error', 'Failed to create notification:', errorMessage);
      setNotificationError(errorMessage);
      return null;
    }
  }, [play]);

  const scheduleNotificationInternal = useCallback((medication: Medication) => {
    debug.log('notification', 'info', 'Scheduling notifications for medication', {
      medication_id: medication.id,
      name: medication.name
    });

    // Clear existing notifications for this medication
    scheduledNotifications.current = scheduledNotifications.current.filter(notification => {
      if (notification.medication_id === medication.id) {
        clearTimeout(notification.timeoutId);
        return false;
      }
      return true;
    });

    const scheduleReminders = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
      const tenMinutesBefore = new Date(scheduledTime.getTime() - 10 * 60 * 1000);

      debug.log('notification', 'info', 'Scheduling reminders for time', {
        medication_id: medication.id,
        time: timeStr,
        mainTime: scheduledTime.toISOString(),
        oneHourBefore: oneHourBefore.toISOString(),
        tenMinutesBefore: tenMinutesBefore.toISOString()
      });

      // Schedule notifications
      [
        { time: oneHourBefore, type: 'hour', message: '1 hour' },
        { time: tenMinutesBefore, type: 'tenMin', message: '10 minutes' },
        { time: scheduledTime, type: 'main', message: '' }
      ].forEach(({ time, type, message }) => {
        const delay = Math.max(0, time.getTime() - now.getTime());
        if (delay > 0) {
          const timeoutId = window.setTimeout(() => {
            createNotification(
              type === 'main' ? 'Take Your Medication' : 'Medication Reminder',
              type === 'main'
                ? `Time to take ${medication.name} (${medication.dosage.amount} ${medication.dosage.unit})`
                : `${medication.name} is due in ${message}`,
              `med-${medication.id}-${type}`
            );
          }, delay);

          scheduledNotifications.current.push({
            id: crypto.randomUUID(),
            medication_id: medication.id,
            type: type as 'hour' | 'tenMin' | 'main',
            scheduledTime: time,
            timeoutId
          });

          debug.log('notification', 'info', 'Scheduled notification', {
            medication_id: medication.id,
            type,
            scheduledTime: time.toISOString(),
            delay
          });
        }
      });
    };

    // Schedule initial reminders
    medication.schedule.times.forEach(scheduleReminders);

    // Reschedule reminders daily
    const interval = window.setInterval(() => {
      if (permissionRef.current === 'granted') {
        medication.schedule.times.forEach(scheduleReminders);
      }
    }, 24 * 60 * 60 * 1000);

    intervals.current.push(interval);
  }, [createNotification]);

  const scheduleNotification = useCallback((medication: Medication) => {
    debug.log('notification', 'info', 'Attempting to schedule notification', {
      medication_id: medication.id,
      permission: permissionRef.current
    });

    if (permissionRef.current !== 'granted') {
      debug.log('notification', 'warn', 'Cannot schedule notifications - permission not granted');
      requestPermission().then(granted => {
        if (granted) {
          debug.log('notification', 'info', 'Permission granted, scheduling notifications');
          scheduleNotificationInternal(medication);
        }
      });
      return;
    }

    scheduleNotificationInternal(medication);
  }, [requestPermission, scheduleNotificationInternal]);

  const testNotification = useCallback(async () => {
    debug.log('notification', 'info', 'Testing notification');
    return createNotification(
      'Test Notification',
      'This is a test notification to verify everything works.',
      'test-notification'
    );
  }, [createNotification]);

  const checkNotificationSupport = useCallback(() => {
    const issues: string[] = [];

    if (!('Notification' in window)) {
      issues.push('Browser does not support notifications');
    }

    if (!('serviceWorker' in navigator)) {
      issues.push('Service Workers are not supported');
    }

    if (permission === 'denied') {
      issues.push('Notification permission denied');
    }

    return issues;
  }, [permission]);

  return {
    permission,
    notificationError,
    requestPermission,
    scheduleNotification,
    scheduledNotifications: scheduledNotifications.current,
    testNotification,
    checkNotificationSupport
  };
}