/**
 * DEVELOPMENT ONLY — triggers process crashes and JS freezes.
 * This screen is reachable only via a hidden long-press entry in Settings while `__DEV__` is true.
 * Do not add production navigation here; crash buttons must never ship as casual UI.
 */
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/src/ui/Button';

/**
 * Intentionally incorrect `useEffect` dependency: each `n` update re-runs the effect and schedules
 * another state update → infinite render loop and frozen JS thread. Mount only via the button.
 */
function InfiniteRenderCrash() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN((x) => x + 1);
  }, [n]);
  return <Text className="text-red-600">Render count: {n}</Text>;
}

export default function CrashTestsScreen() {
  const [showInfiniteRender, setShowInfiniteRender] = useState(false);

  if (!__DEV__) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Crash tests' }} />
        <View className="flex-1 bg-white dark:bg-zinc-950 items-center justify-center px-6">
          <Text className="text-center text-zinc-600 dark:text-zinc-300">Crash tests are not available in this build.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Crash tests', presentation: 'modal' }} />
      <ScrollView className="flex-1 bg-white dark:bg-zinc-950" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Debug / crash tests</Text>
      <Text className="text-sm text-red-600 dark:text-red-400 mt-2">
        These actions can crash or freeze the app. Use only in development builds.
      </Text>

      <View className="mt-6 gap-3">
        <Button
          title="1. JavaScript throw"
          variant="danger"
          onPress={() => {
            throw new Error('Test JS Crash');
          }}
        />

        <Button
          title="2. Infinite recursion"
          variant="danger"
          onPress={() => {
            const crash: () => never = () => crash();
            crash();
          }}
        />

        <Button
          title="3. Mount infinite render loop"
          variant="danger"
          onPress={() => setShowInfiniteRender(true)}
        />
        {showInfiniteRender ? (
          <View className="rounded-xl border border-red-300 p-2">
            <InfiniteRenderCrash />
          </View>
        ) : null}

        <Button
          title="4. Native crash (Sentry)"
          variant="danger"
          onPress={() => {
            Alert.alert(
              'Native crash',
              'This will terminate the app process. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Crash',
                  style: 'destructive',
                  onPress: () => {
                    Sentry.nativeCrash();
                  },
                },
              ],
            );
          }}
        />
      </View>
    </ScrollView>
    </>
  );
}
