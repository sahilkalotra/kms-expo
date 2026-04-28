import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { getLocalCourseContentHtml } from '@/src/features/courses/services/courseContent';
import { fetchCourseById } from '@/src/features/courses/services/courseService';
import type { Course } from '@/src/features/courses/types';
import { Button } from '@/src/ui/Button';
import { useNetworkStatus } from '@/src/core/hooks/useNetworkStatus';

function safeJsonForInjection(obj: unknown) {
  const json = JSON.stringify(obj ?? {});
  // escape for embedding into JS string literal
  return json.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

export default function CourseContentScreen() {
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
  const webRef = useRef<WebView>(null);
  const { isOffline } = useNetworkStatus();
  const [html, setHtml] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webReady, setWebReady] = useState(false);

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
      setError(null);
      const [contentRes, cRes] = await Promise.all([getLocalCourseContentHtml(), fetchCourseById(String(courseId))]);
      if (!mounted) return;
      setHtml(contentRes.html);
      if (!cRes.ok) {
        // Keep showing seeded (or cached) course data if we have it.
        setError(cRes.error);
      } else {
        const merged: Course = {
          ...cRes.data,
          instructor: {
            ...cRes.data.instructor,
            id: instructorId?.length ? String(instructorId) : cRes.data.instructor?.id ?? '0',
            name: instructorName?.length ? String(instructorName) : cRes.data.instructor?.name ?? 'Unknown instructor',
            avatarUrl: instructorAvatarUrl?.length ? String(instructorAvatarUrl) : cRes.data.instructor?.avatarUrl,
          },
        };
        setCourse(merged);
      }
    })().catch(() => {
      if (!mounted) return;
      setError('Failed to load content');
    });
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!webReady) return;
    if (!course) return;
    const payload = safeJsonForInjection(course);
    webRef.current?.injectJavaScript(`window.renderCourse(\`${payload}\`); true;`);
  }, [course, webReady]);

  const injectedJavaScript = useMemo(() => {
    if (!course) return 'true;';
    const payload = safeJsonForInjection(course);
    return `window.renderCourse(\`${payload}\`); true;`;
  }, [course]);

  if (!html) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
        {error ? <Text className="text-sm text-red-600 mt-2">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950  ">
      {error && !isOffline ? (
        <View className="px-4 pt-3">
          <View className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/40">
            <Text className="text-xs text-amber-900 dark:text-amber-200">{error}</Text>
          </View>
        </View>
      ) : null}
      <WebView
        ref={webRef}
        source={{
          html,
          headers: {
            'x-course-id': String(courseId),
            'x-native-bridge': '1',
          },
        }}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={() => setWebReady(true)}
        onError={() => setError('WebView failed to load')}
        renderError={() => (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base text-zinc-900 dark:text-zinc-100 text-center">Could not load course content.</Text>
            <View className="mt-4">
              <Button title="Retry"
                onPress={() => {
                  setHtml(null);
                  setError(null);
                  setWebReady(false);
                  // trigger effect by tweaking params via state reset
                  setTimeout(() => {
                    getLocalCourseContentHtml()
                      .then((r) => {
                        setHtml(r.html);
                      })
                      .catch(() => setError('Failed to load content'));
                  }, 50);
                }}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

