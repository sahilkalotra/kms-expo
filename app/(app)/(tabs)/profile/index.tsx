import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useBookmarks } from '@/src/features/courses/hooks/useBookmarks';
import { useEnrollment } from '@/src/features/courses/hooks/useEnrollment';
import { ThemeMode, useTheme } from '@/src/theme/useTheme';
import { Button } from '@/src/ui/Button';

function ThemePill({ mode, active, onPress }: { mode: ThemeMode; active: boolean; onPress: () => void }) {
  return (
    <Button
      variant={active ? 'primary' : 'secondary'}
      size="sm"
      title={mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}
      onPress={onPress}
    />
  );
}

function safeAvatarUri(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { mode, setMode } = useTheme();
  const { bookmarkedCount } = useBookmarks();
  const { enrolledCount } = useEnrollment();
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return `${a}${b}`.toUpperCase();
  }, [user?.name]);

  async function onChangePhoto() {
    try {
      setUpdatingPhoto(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow photo library access to update your profile photo.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (res.canceled || !res.assets?.[0]?.uri) return;
      await updateUser({ avatarUrl: res.assets[0].uri });
    } catch {
      Alert.alert('Could not update photo', 'Please try again.');
    } finally {
      setUpdatingPhoto(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950" contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onChangePhoto} disabled={updatingPhoto} className="relative">
            {safeAvatarUri(user?.avatarUrl) ? (
              <Image source={{ uri: safeAvatarUri(user?.avatarUrl)! }} className="w-16 h-16 rounded-full bg-zinc-200" />
            ) : (
              <View className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center">
                <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{initials}</Text>
              </View>
            )}
            {updatingPhoto ? <ActivityIndicator color="#0000ff" className="absolute top-0 left-0 right-0 bottom-0" /> : null}
            <View className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-blue-600 items-center justify-center border-2 border-white dark:border-zinc-950">
              <Ionicons name="camera-outline" size={15} color="white" />
            </View>
          </Pressable>

          <View className="flex-1">
            <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{user?.name ?? user?.username ?? 'User'}</Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email ?? ''}</Text>
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Stats</Text>
        <View className="mt-3 flex-row gap-10">
          <View className="flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-100 dark:border-zinc-800">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Enrolled</Text>
            <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{enrolledCount}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-100 dark:border-zinc-800">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Bookmarked</Text>
            <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{bookmarkedCount}</Text>
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Appearance</Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Choose how the app looks.</Text>
        <View className="mt-3 flex-row gap-2">
          <ThemePill mode="system" active={mode === 'system'} onPress={() => setMode('system')} />
          <ThemePill mode="light" active={mode === 'light'} onPress={() => setMode('light')} />
          <ThemePill mode="dark" active={mode === 'dark'} onPress={() => setMode('dark')} />
        </View>
      </View>

      <View className="mt-6">
        <Button title="Logout" variant="danger" onPress={logout} />
      </View>
    </ScrollView>
  );
}

