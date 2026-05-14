import * as Notifications from 'expo-notifications';

import { EXAMPLE_LOCAL_NOTIFICATION_ID } from '@/src/features/notifications/notificationIds';
import { canShowNotification } from '@/src/features/notifications/notificationPause';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const paused = !(await canShowNotification());
    if (paused) {
      return {
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    return {
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // ignore missing id / platform quirks
  }
}

export async function ensureNotificationsPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function sendLocalNotification(params: { title: string; body: string; data?: Record<string, any> }) {
  if (!(await canShowNotification())) return;
  const ok = await ensureNotificationsPermission();
  if (!ok) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data ?? {},
    },
    trigger: null,
  });
}

export async function scheduleNotification(params: {
  identifier: string;
  title: string;
  body: string;
  secondsFromNow: number;
  data?: Record<string, any>;
}) {
  if (!(await canShowNotification())) return;

  const ok = await ensureNotificationsPermission();
  if (!ok) return;

  // cancel existing with same identifier (simple idempotency)
  try {
    await Notifications.cancelScheduledNotificationAsync(params.identifier);
  } catch {
    // ignore
  }

  await Notifications.scheduleNotificationAsync({
    identifier: params.identifier,
    content: {
      title: params.title,
      body: params.body,
      data: params.data ?? {},
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor(params.secondsFromNow)),
      repeats: false,
    },
  });
}

/**
 * Example scheduled local notification. Uses `scheduleNotification`, so it respects
 * `canShowNotification()` / pause state the same as production reminders.
 */
export async function scheduleExampleReminderInSeconds(seconds: number): Promise<void> {
  await scheduleNotification({
    identifier: EXAMPLE_LOCAL_NOTIFICATION_ID,
    title: 'Example reminder',
    body: 'This sample notification respects your pause settings.',
    secondsFromNow: seconds,
    data: { type: 'example_local' },
  });
}
