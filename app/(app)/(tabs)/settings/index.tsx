import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AppIconSelector } from '@/src/features/app-icon/components/AppIconSelector';
import { REENGAGEMENT_REMINDER_ID } from '@/src/features/notifications/notificationIds';
import {
  getNotificationPauseStatus,
  pauseNotifications,
  pauseNotificationsUntilManual,
  resumeNotifications,
} from '@/src/features/notifications/notificationPause';
import { cancelScheduledNotification, scheduleExampleReminderInSeconds } from '@/src/features/notifications/services/notificationService';
import { trackAppOpened } from '@/src/features/notifications/services/reengagement';
import { Button } from '@/src/ui/Button';

const MS_5M = 5 * 60 * 1000;
const MS_1H = 60 * 60 * 1000;
const MS_1D = 24 * 60 * 60 * 1000;

function pauseSummary(s: Awaited<ReturnType<typeof getNotificationPauseStatus>>): string | null {
  if (!s.active) return null;
  if (s.mode === 'manual') return 'Paused (manual)';
  return `Paused until ${new Date(s.untilMs).toLocaleString()}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pauseBusy, setPauseBusy] = useState(false);
  const [pauseLine, setPauseLine] = useState<string | null>(null);
  const [exampleBusy, setExampleBusy] = useState(false);

  const refreshPause = useCallback(async () => {
    const s = await getNotificationPauseStatus();
    setPauseLine(pauseSummary(s));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshPause();
    }, [refreshPause]),
  );

  async function onPause(ms: number) {
    try {
      setPauseBusy(true);
      await pauseNotifications(ms);
      await cancelScheduledNotification(REENGAGEMENT_REMINDER_ID);
      await refreshPause();
    } finally {
      setPauseBusy(false);
    }
  }

  async function onPauseManual() {
    try {
      setPauseBusy(true);
      await pauseNotificationsUntilManual();
      await cancelScheduledNotification(REENGAGEMENT_REMINDER_ID);
      await refreshPause();
    } finally {
      setPauseBusy(false);
    }
  }

  async function onResume() {
    try {
      setPauseBusy(true);
      await resumeNotifications();
      await trackAppOpened();
      await refreshPause();
    } finally {
      setPauseBusy(false);
    }
  }

  async function onScheduleExample() {
    try {
      setExampleBusy(true);
      await scheduleExampleReminderInSeconds(8);
      Alert.alert('Scheduled', '~8 seconds.');
    } finally {
      setExampleBusy(false);
    }
  }

  const versionLabel = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '—';

  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Notifications</Text>
        {pauseLine ? (
          <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{pauseLine}</Text>
        ) : null}
        <View className="mt-3 flex-row flex-wrap gap-2">
          <Button title="5 min" size="sm" variant="secondary" disabled={pauseBusy} onPress={() => onPause(MS_5M)} />
          <Button title="1 hour" size="sm" variant="secondary" disabled={pauseBusy} onPress={() => onPause(MS_1H)} />
          <Button title="1 day" size="sm" variant="secondary" disabled={pauseBusy} onPress={() => onPause(MS_1D)} />
          <Button title="Manual" size="sm" variant="secondary" disabled={pauseBusy} onPress={onPauseManual} />
        </View>
        <View className="mt-2">
          <Button title="Resume" variant="primary" disabled={pauseBusy} onPress={onResume} />
        </View>
        {__DEV__ ? (
          <View className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              title="Test notification (8s)"
              size="sm"
              variant="secondary"
              disabled={exampleBusy}
              onPress={onScheduleExample}
            />
          </View>
        ) : null}
      </View>

      <View className="mt-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">App icon</Text>
        <View className="mt-3">
          <AppIconSelector />
        </View>
      </View>

      <Pressable
        accessibilityLabel="App version"
        onLongPress={() => {
          if (!__DEV__) return;
          router.push('../../debug/crash-tests');
        }}
        delayLongPress={500}
        className="mt-8 items-center py-2"
      >
        <Text className="text-xs text-zinc-400 dark:text-zinc-500">Version {versionLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}
