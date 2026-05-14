/**
 * Local notification pause: public API + backward-compatible aliases.
 */

export {
  canShowNotification,
  getNotificationPauseStatus,
  getNotificationPauseUntilMs,
  isNotificationPauseActive,
  pauseNotifications,
  pauseNotificationsUntilManual,
  resumeNotifications,
} from '@/src/features/notifications/notificationGuard';

import {
  pauseNotifications,
  resumeNotifications,
} from '@/src/features/notifications/notificationGuard';

/** @deprecated Prefer `pauseNotifications`. */
export async function setNotificationPauseForDuration(ms: number): Promise<void> {
  await pauseNotifications(ms);
}

/** @deprecated Prefer `resumeNotifications`. */
export async function clearNotificationPause(): Promise<void> {
  await resumeNotifications();
}
