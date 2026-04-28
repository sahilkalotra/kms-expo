import { memo, useCallback } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Course } from '@/src/features/courses/types';
import { useBookmarks } from '@/src/features/courses/hooks/useBookmarks';

function safeImageUri(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  return undefined;
}

export const CourseRow = memo(function CourseRow({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(course.id);
  const thumb = safeImageUri(course.thumbnailUrl);

  const onToggle = useCallback(() => {
    toggleBookmark(course).catch(() => {
      // ignore
    });
  }, [toggleBookmark, course]);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-3 overflow-hidden"
    >
      <View className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 items-center justify-center">
        {thumb ? (
          <Image source={{ uri: thumb }} className="w-24 h-24" resizeMode="cover" />
        ) : (
          <Ionicons name="image-outline" size={22} color="#64748b" />
        )}
      </View>

      <View className="flex-1 px-3 py-3">
        <Text className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
          {course.title}
        </Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1" numberOfLines={1}>
          {course.instructor?.name ?? 'Unknown instructor'}
        </Text>
        {course.description ? (
          <Text className="text-xs text-zinc-600 dark:text-zinc-300 mt-1" numberOfLines={2}>
            {course.description}
          </Text>
        ) : null}

        {typeof course.price === 'number' ? (
          <View className="mt-2 self-start rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
            <Text className="text-[11px] text-zinc-700 dark:text-zinc-200">₹{course.price}</Text>
          </View>
        ) : null}
      </View>

      <Pressable onPress={onToggle} hitSlop={12} className="px-3 py-3">
        <Ionicons
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={bookmarked ? '#2563eb' : '#64748b'}
        />
      </Pressable>
    </Pressable>
  );
});

