import { useCallback, useEffect, useRef, useState } from 'react';

import type { Course } from '@/src/features/courses/types';
import { fetchCourses } from '@/src/features/courses/services/courseService';
import { useNetworkStatus } from '@/src/core/hooks/useNetworkStatus';

export function useCourses() {
  const limit = 10;
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { isOffline } = useNetworkStatus();
  const prevOfflineRef = useRef<boolean>(isOffline);

  const loadPage = useCallback(
    async (nextPage: number, opts?: { append?: boolean; isRefresh?: boolean }) => {
      const append = Boolean(opts?.append);
      const isRefresh = Boolean(opts?.isRefresh);

      if (isRefresh) setRefreshing(true);
      else if (append) setLoadingMore(true);
      else setLoading(true);

      setError(null);

      const res = await fetchCourses({ page: nextPage, limit });
      if (!res.ok) {
        setError(res.error);
        // Keep previously loaded items visible (don't "blank" the screen).
      } else {
        setItems((prev) => (append ? [...prev, ...res.data.items] : res.data.items));
        setPage(res.data.page);
        setHasNextPage(res.data.hasNextPage);
      }

      if (isRefresh) setRefreshing(false);
      else if (append) setLoadingMore(false);
      else setLoading(false);
    },
    [limit]
  );

  useEffect(() => {
    loadPage(1, { append: false }).catch(() => {
      setError('Failed to load courses');
      setLoading(false);
    });
  }, [loadPage]);

  useEffect(() => {
    const wasOffline = prevOfflineRef.current;
    prevOfflineRef.current = isOffline;
    // When coming back online, retry automatically if we were showing an error.
    if (wasOffline && !isOffline && error) {
      loadPage(1, { append: false }).catch(() => {});
    }
  }, [error, isOffline, loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(1, { append: false, isRefresh: true });
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loading || refreshing || loadingMore || !hasNextPage) return;
    await loadPage(page + 1, { append: true });
  }, [hasNextPage, loadPage, loading, loadingMore, page, refreshing]);

  return { items, loading, refreshing, refresh, error, loadMore, loadingMore, hasNextPage };
}

