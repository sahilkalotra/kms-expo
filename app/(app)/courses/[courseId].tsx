import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import { useBookmarks } from '@/src/features/courses/hooks/useBookmarks';
import { useEnrollment } from '@/src/features/courses/hooks/useEnrollment';
import { fetchCourseById } from '@/src/features/courses/services/courseService';
import type { Course } from '@/src/features/courses/types';
import { Button } from '@/src/ui/Button';
import { useNetworkStatus } from '@/src/core/hooks/useNetworkStatus';

export default function CourseDetailScreen() {
  const { courseId, title, description, thumbnailUrl, price, instructorName, instructorAvatarUrl, instructorId } = useLocalSearchParams<{
    courseId: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    price?: string;
    instructorName?: string;
    instructorAvatarUrl?: string;
    instructorId?: string;
  }>();
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isEnrolled, enroll } = useEnrollment();
  const { isOffline } = useNetworkStatus();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = String(courseId);
    if (!id) return;
    const seeded: Course = {
      id,
      title: (title?.length ? String(title) : `Course ${id}`) as string,
      description: description?.length ? String(description) : undefined,
      thumbnailUrl: thumbnailUrl?.length ? String(thumbnailUrl) : undefined,
      price: price?.length && !Number.isNaN(Number(price)) ? Number(price) : undefined,
      instructor: {
        id: instructorId?.length ? String(instructorId) : '0',
        name: instructorName?.length ? String(instructorName) : 'Unknown instructor',
        avatarUrl: instructorAvatarUrl?.length ? String(instructorAvatarUrl) : undefined,
      },
    };
    setCourse((prev) => (prev?.id === seeded.id ? { ...seeded, ...prev } : seeded));
  }, [courseId, description, instructorAvatarUrl, instructorId, instructorName, price, thumbnailUrl, title]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchCourseById(String(courseId));
      if (!mounted) return;
      if (!res.ok) {
        // Keep showing seeded (or previously cached) course data if we have it.
        setError(res.error);
      } else {
        const merged: Course = {
          ...res.data,
          instructor: {
            ...res.data.instructor,
            id: instructorId?.length ? String(instructorId) : res.data.instructor?.id ?? '0',
            name: instructorName?.length ? String(instructorName) : res.data.instructor?.name ?? 'Unknown instructor',
            avatarUrl: instructorAvatarUrl?.length ? String(instructorAvatarUrl) : res.data.instructor?.avatarUrl,
          },
        };
        setCourse(merged);
      }
      setLoading(false);
    })().catch(() => {
      if (!mounted) return;
      setError('Failed to load course');
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [courseId]);

  if (loading && !course) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 px-6">
        <Text className="text-base text-zinc-900 dark:text-zinc-100 text-center">{error ?? 'Not found'}</Text>
        <View className="mt-4">
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const bookmarked = isBookmarked(course.id);
  const enrolled = isEnrolled(course.id);

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      {course.thumbnailUrl ? (
        <Image source={{ uri: course.thumbnailUrl }} className="w-full h-56 bg-zinc-200" />
      ) : (
        <View className="w-full h-56 bg-zinc-200 dark:bg-zinc-800" />
      )}

      <View className="px-4 pt-4">
        {error && !isOffline ? (
          <View className="mb-3 px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/40">
            <Text className="text-xs text-amber-900 dark:text-amber-200">{error}</Text>
          </View>
        ) : null}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{course.title}</Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{course.instructor?.name}</Text>
          </View>

          <Button
            title=""
            variant="secondary"
            size="sm"
            onPress={() => toggleBookmark(course)}
            icon={
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? '#2563eb' : '#0f172a'} />
            }
          />
        </View>

        {course.description ? (
          <Text className="text-sm text-zinc-700 dark:text-zinc-200 mt-3">{course.description}</Text>
        ) : null}

        <View className="mt-5 flex-row gap-2">
          <Button
            title={enrolled ? 'Enrolled' : 'Enroll'}
            onPress={() => enroll(course.id)}
            disabled={enrolled}
            variant={enrolled ? 'secondary' : 'primary'}
          />
          <Button
            title="Open content"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/courses/[courseId]/content',
                params: {
                  courseId: course.id,
                  title: course.title ?? '',
                  description: course.description ?? '',
                  thumbnailUrl: course.thumbnailUrl ?? '',
                  price: typeof course.price === 'number' ? String(course.price) : '',
                  instructorName: course.instructor?.name ?? '',
                  instructorAvatarUrl: course.instructor?.avatarUrl ?? '',
                  instructorId: course.instructor?.id ?? '',
                },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}
