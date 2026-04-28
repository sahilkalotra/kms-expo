import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationsPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function sendLocalNotification(params: { title: string; body: string; data?: Record<string, any> }) {
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

