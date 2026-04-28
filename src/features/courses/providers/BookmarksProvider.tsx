import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Course } from '@/src/features/courses/types';
import { storageDelete, storageGet, storageSet } from '@/src/core/storage/appStorage';
import { COURSE_KEYS } from '@/src/features/courses/storageKeys';
import { notifyBookmarkMilestoneIfNeeded } from '@/src/features/notifications/services/bookmarkMilestone';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

type BookmarksState = {
  byId: Record<string, Course>;
};

type BookmarksContextValue = {
  bookmarkedCount: number;
  isBookmarked: (courseId: string) => boolean;
  toggleBookmark: (course: Course) => Promise<void>;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookmarksState>({ byId: {} });
  const { user, status } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (status !== 'authenticated' || !userId) {
        if (!mounted) return;
        setState({ byId: {} });
        return;
      }

      const userKey = `${COURSE_KEYS.bookmarks}.${userId}`;
      const saved = await storageGet<Record<string, Course>>(userKey);

      // Migrate from the old global key once.
      if (!saved) {
        const legacy = await storageGet<Record<string, Course>>(COURSE_KEYS.bookmarks);
        if (legacy && Object.keys(legacy).length > 0) {
          await storageSet(userKey, legacy);
          await storageDelete(COURSE_KEYS.bookmarks);
          if (!mounted) return;
          setState({ byId: legacy });
          return;
        }
      }
      if (!mounted) return;
      setState({ byId: saved ?? {} });
    })().catch(() => {
      // ignore
    });
    return () => {
      mounted = false;
    };
  }, [status, userId]);

  const persist = useCallback(async (next: Record<string, Course>) => {
    if (!userId) return;
    await storageSet(`${COURSE_KEYS.bookmarks}.${userId}`, next);
    await notifyBookmarkMilestoneIfNeeded(userId, Object.keys(next).length);
  }, [userId]);

  const isBookmarked = useCallback((courseId: string) => Boolean(state.byId[courseId]), [state.byId]);

  const toggleBookmark = useCallback(
    async (course: Course) => {
      const next = { ...state.byId };
      if (next[course.id]) delete next[course.id];
      else next[course.id] = course;
      setState({ byId: next });
      await persist(next);
    },
    [state.byId, persist],
  );

  const value: BookmarksContextValue = useMemo(
    () => ({
      bookmarkedCount: Object.keys(state.byId).length,
      isBookmarked,
      toggleBookmark,
    }),
    [state.byId, isBookmarked, toggleBookmark],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside BookmarksProvider');
  return ctx;
}

