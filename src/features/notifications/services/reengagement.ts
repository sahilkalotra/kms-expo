import { storageGet, storageSet } from '@/src/core/storage/appStorage';
import { canShowNotification } from '@/src/features/notifications/notificationGuard';
import { REENGAGEMENT_REMINDER_ID } from '@/src/features/notifications/notificationIds';
import { scheduleNotification } from '@/src/features/notifications/services/notificationService';

const LAST_OPEN_KEY = 'app.lastOpenedAt';

async function schedule24hReminder(fromNowSeconds: number) {
  await scheduleNotification({
    identifier: REENGAGEMENT_REMINDER_ID,
    title: 'Continue learning',
    body: 'Open the app to pick up where you left off.',
    secondsFromNow: fromNowSeconds,
    data: { type: 'reengagement_24h' },
  });
}

/** Records last open and schedules the 24h re-engagement local notification when not paused. */
export async function trackAppOpened() {
  if (!(await canShowNotification())) return;

  const now = Date.now();
  await storageSet(LAST_OPEN_KEY, now);
  await schedule24hReminder(24 * 60 * 60);
}

export async function getLastOpenedAt(): Promise<number | null> {
  return await storageGet<number>(LAST_OPEN_KEY);
}
