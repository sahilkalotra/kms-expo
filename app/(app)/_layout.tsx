import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/features/auth/hooks/useAuth';

export default function AppLayout() {
  const { status, user } = useAuth();

  if (status !== 'authenticated' || !user || user.id === '0') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="courses/[courseId]" />
      <Stack.Screen name="courses/[courseId]/content" />
    </Stack>
  );
}

