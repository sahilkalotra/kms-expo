import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/src/features/auth/hooks/useAuth';

export default function Index() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)/courses" />;
  }

  return <Redirect href="/(auth)/login" />;
}

