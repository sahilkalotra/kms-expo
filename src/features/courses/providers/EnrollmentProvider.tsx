import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { storageDelete, storageGet, storageSet } from '@/src/core/storage/appStorage';
import { COURSE_KEYS } from '@/src/features/courses/storageKeys';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

type EnrollmentState = {
  enrolledIds: Record<string, true>;
};

type EnrollmentContextValue = {
  enrolledCount: number;
  isEnrolled: (courseId: string) => boolean;
  enroll: (courseId: string) => Promise<void>;
};

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

export function EnrollmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EnrollmentState>({ enrolledIds: {} });
  const { user, status } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (status !== 'authenticated' || !userId) {
        if (!mounted) return;
        setState({ enrolledIds: {} });
        return;
      }

      const userKey = `${COURSE_KEYS.enrolled}.${userId}`;
      const saved = await storageGet<Record<string, true>>(userKey);

      // Migrate from old global key once.
      if (!saved) {
        const legacy = await storageGet<Record<string, true>>(COURSE_KEYS.enrolled);
        if (legacy && Object.keys(legacy).length > 0) {
          await storageSet(userKey, legacy);
          await storageDelete(COURSE_KEYS.enrolled);
          if (!mounted) return;
          setState({ enrolledIds: legacy });
          return;
        }
      }
      if (!mounted) return;
      setState({ enrolledIds: saved ?? {} });
    })().catch(() => {
      // ignore
    });
    return () => {
      mounted = false;
    };
  }, [status, userId]);

  const persist = useCallback(async (next: Record<string, true>) => {
    if (!userId) return;
    await storageSet(`${COURSE_KEYS.enrolled}.${userId}`, next);
  }, [userId]);

  const isEnrolled = useCallback((courseId: string) => Boolean(state.enrolledIds[courseId]), [state.enrolledIds]);

  const enroll = useCallback(
    async (courseId: string) => {
      const next = { ...state.enrolledIds, [courseId]: true as const };
      setState({ enrolledIds: next });
      await persist(next);
    },
    [state.enrolledIds, persist],
  );

  const value: EnrollmentContextValue = useMemo(
    () => ({
      enrolledCount: Object.keys(state.enrolledIds).length,
      isEnrolled,
      enroll,
    }),
    [state.enrolledIds, isEnrolled, enroll],
  );

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
}

export function useEnrollment(): EnrollmentContextValue {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) throw new Error('useEnrollment must be used inside EnrollmentProvider');
  return ctx;
}

