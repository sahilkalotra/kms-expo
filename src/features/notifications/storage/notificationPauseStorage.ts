import { storageDelete, storageGet, storageSet } from '@/src/core/storage/appStorage';

export const NOTIFICATION_PAUSE_STORAGE_KEY = 'notifications.pauseState.v1';

export type NotificationPauseStateV1 =
  | { v: 1; kind: 'timed'; untilMs: number }
  | { v: 1; kind: 'manual' };

/**
 * Loads persisted pause state. Invalid or legacy shapes return null.
 */
export async function loadPauseState(): Promise<NotificationPauseStateV1 | null> {
  const raw = await storageGet<unknown>(NOTIFICATION_PAUSE_STORAGE_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return null;
  if (o.kind === 'manual') return { v: 1, kind: 'manual' };
  if (o.kind === 'timed' && typeof o.untilMs === 'number' && Number.isFinite(o.untilMs)) {
    return { v: 1, kind: 'timed', untilMs: o.untilMs };
  }
  return null;
}

export async function savePauseState(state: NotificationPauseStateV1): Promise<void> {
  await storageSet(NOTIFICATION_PAUSE_STORAGE_KEY, state);
}

export async function clearPauseState(): Promise<void> {
  await storageDelete(NOTIFICATION_PAUSE_STORAGE_KEY);
}
