import { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LegendList } from '@legendapp/list';
import { useRouter } from 'expo-router';

import { TextField } from '@/src/ui/TextField';
import { CourseRow } from '@/src/features/courses/components/CourseRow';
import { useCourses } from '@/src/features/courses/hooks/useCourses';
import type { Course } from '@/src/features/courses/types';

export default function CoursesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { items, refreshing, refresh, error, loading, loadMore, loadingMore, hasNextPage } = useCourses();

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((c: Course) => {
      const hay = `${c.title ?? ''} ${c.description ?? ''} ${c.instructor?.name ?? ''}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);

  useEffect(() => {
    // Progressive search: while a query is active, keep fetching more pages
    // until we have a reasonable number of matches or we run out of pages.
    if (!normalizedQuery) return;
    if (loading || refreshing || loadingMore || !hasNextPage) return;
    if (filtered.length >= 10) return;

    const id = setTimeout(() => {
      loadMore().catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [filtered.length, hasNextPage, loadMore, loading, loadingMore, normalizedQuery, refreshing]);

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <View className="px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Courses</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Find something worth learning today.</Text>
        <View className="mt-3">
          <TextField value={query} onChangeText={setQuery} placeholder="Search courses..." />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error && items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-zinc-900 dark:text-zinc-100 text-center">{error}</Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-2">Pull to refresh to retry.</Text>
        </View>
      ) : (
        <LegendList<Course>
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseRow
              course={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/courses/[courseId]',
                  params: {
                    courseId: item.id,
                    title: item.title ?? '',
                    description: item.description ?? '',
                    thumbnailUrl: item.thumbnailUrl ?? '',
                    price: typeof item.price === 'number' ? String(item.price) : '',
                    instructorName: item.instructor?.name ?? '',
                    instructorAvatarUrl: item.instructor?.avatarUrl ?? '',
                    instructorId: item.instructor?.id ?? '',
                  },
                })
              }
            />
          )}
          onRefresh={refresh}
          refreshing={refreshing}
          ListHeaderComponent={
            error ? (
              <View className="px-3 pb-2">
                <Text className="text-xs text-amber-700 dark:text-amber-300">{error}</Text>
              </View>
            ) : null
          }
          onEndReached={() => {
            loadMore().catch(() => {});
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator />
              </View>
            ) : hasNextPage ? null : (
              <View className="py-4 items-center">
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">You&apos;re all caught up.</Text>
              </View>
            )
          }
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          estimatedItemSize={108}
        />
      )}
    </View>
  );
}

