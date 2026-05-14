import {
  clearPauseState,
  loadPauseState,
  savePauseState,
  type NotificationPauseStateV1,
} from '@/src/features/notifications/storage/notificationPauseStorage';

/**
 * Returns true when local notifications may be scheduled or presented.
 * Timed pauses that have expired clear storage automatically (resume).
 */
export async function canShowNotification(): Promise<boolean> {
  return !(await isNotificationPauseActive());
}

/**
 * True when the user has paused notifications (timed and not expired, or manual).
 */
export async function isNotificationPauseActive(): Promise<boolean> {
  const state = await loadPauseState();
  if (!state) return false;
  if (state.kind === 'manual') return true;
  if (state.kind === 'timed') {
    if (Date.now() >= state.untilMs) {
      await clearPauseState();
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Pauses local notifications for a duration from now. Overwrites any existing pause.
 */
export async function pauseNotifications(durationMs: number): Promise<void> {
  const untilMs = Date.now() + Math.max(0, Math.floor(durationMs));
  const next: NotificationPauseStateV1 = { v: 1, kind: 'timed', untilMs };
  await savePauseState(next);
}

/** Pauses local notifications until `resumeNotifications()` is called. */
export async function pauseNotificationsUntilManual(): Promise<void> {
  await savePauseState({ v: 1, kind: 'manual' });
}

/** Clears pause state so notifications can show again. */
export async function resumeNotifications(): Promise<void> {
  await clearPauseState();
}

export type NotificationPauseStatus =
  | { active: false }
  | { active: true; mode: 'timed'; untilMs: number }
  | { active: true; mode: 'manual' };

/**
 * Resolved pause status for UI (expires timed pauses and clears storage when due).
 */
export async function getNotificationPauseStatus(): Promise<NotificationPauseStatus> {
  const state = await loadPauseState();
  if (!state) return { active: false };
  if (state.kind === 'manual') return { active: true, mode: 'manual' };
  if (Date.now() >= state.untilMs) {
    await clearPauseState();
    return { active: false };
  }
  return { active: true, mode: 'timed', untilMs: state.untilMs };
}

/** @returns End timestamp for timed pause, or null if not active or manual pause. */
export async function getNotificationPauseUntilMs(): Promise<number | null> {
  const s = await getNotificationPauseStatus();
  if (!s.active || s.mode === 'manual') return null;
  return s.untilMs;
}
