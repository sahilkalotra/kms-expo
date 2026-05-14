import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';

import {
  applyAppIcon,
  areAlternateAppIconsSupported,
  readCurrentAppIconName,
} from '@/src/features/app-icon/appIconService';
import {
  APP_ICON_OPTIONS,
  nativeAppIconNameToUiId,
  type AppIconUiChoice,
} from '@/src/features/app-icon/types';

type Props = {
  onIconChanged?: (choice: AppIconUiChoice) => void;
};

export function AppIconSelector({ onIconChanged }: Props) {
  const supported = areAlternateAppIconsSupported();
  const [nativeName, setNativeName] = useState<string>('DEFAULT');
  const [busyId, setBusyId] = useState<AppIconUiChoice | null>(null);
  const [loading, setLoading] = useState(supported);

  const refresh = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const name = await readCurrentAppIconName();
      setNativeName(name);
    } finally {
      setLoading(false);
    }
  }, [supported]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const selectedId = nativeAppIconNameToUiId(nativeName);

  async function onPick(choice: AppIconUiChoice) {
    if (!supported || busyId) return;
    setBusyId(choice);
    try {
      const ok = await applyAppIcon(choice);
      if (!ok) {
        Alert.alert(
          'Could not change icon',
          'Rebuild the development client after native config changes, or try again from the home screen on Android.',
        );
        return;
      }
      const name = await readCurrentAppIconName();
      setNativeName(name);
      onIconChanged?.(choice);
    } finally {
      setBusyId(null);
    }
  }

  if (!supported) {
    return <Text className="text-sm text-zinc-500 dark:text-zinc-400">Not available in this build.</Text>;
  }

  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row flex-wrap gap-3">
        {APP_ICON_OPTIONS.map((opt) => {
          const active = selectedId === opt.id;
          const busy = busyId === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPick(opt.id)}
              disabled={Boolean(busyId)}
              className={`w-[47%] rounded-2xl border p-3 items-center ${
                active ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Image source={opt.preview} className="w-14 h-14 rounded-xl" resizeMode="contain" />
              <Text className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">{opt.label}</Text>
              {busy ? <ActivityIndicator className="mt-2" /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
