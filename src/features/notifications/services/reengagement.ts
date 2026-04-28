import { AppState } from 'react-native';

import { storageGet, storageSet } from '@/src/core/storage/appStorage';
import { scheduleNotification } from '@/src/features/notifications/services/notificationService';

const LAST_OPEN_KEY = 'app.lastOpenedAt';
const REMINDER_ID = 'reengagement_24h';

async function schedule24hReminder(fromNowSeconds: number) {
  await scheduleNotification({
    identifier: REMINDER_ID,
    title: 'Continue learning',
    body: 'Open the app to pick up where you left off.',
    secondsFromNow: fromNowSeconds,
    data: { type: 'reengagement_24h' },
  });
}

export async function trackAppOpened() {
  const now = Date.now();
  await storageSet(LAST_OPEN_KEY, now);

  // schedule a reminder 24 hours from now
  await schedule24hReminder(24 * 60 * 60);

  // also listen for foregrounding to reschedule (event-driven, no polling)
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      trackAppOpened().catch(() => {
        // ignore
      });
    }
  });

  // detach after a bit to avoid stacking listeners if something goes wrong
  setTimeout(() => sub.remove(), 4000);
}

export async function getLastOpenedAt(): Promise<number | null> {
  return await storageGet<number>(LAST_OPEN_KEY);
}

