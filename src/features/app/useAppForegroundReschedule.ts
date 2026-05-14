import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { trackAppOpened } from '@/src/features/notifications/services/reengagement';

/**
 * When the app becomes active again, re-run re-engagement scheduling so the 24h reminder
 * stays aligned with recent opens (`trackAppOpened` no-ops while notifications are paused).
 */
export function useAppForegroundReschedule(): void {
  const statusRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = statusRef.current;
      statusRef.current = next;
      if ((prev === 'inactive' || prev === 'background') && next === 'active') {
        void trackAppOpened().catch(() => {
          // best effort
        });
      }
    });
    return () => sub.remove();
  }, []);
}
