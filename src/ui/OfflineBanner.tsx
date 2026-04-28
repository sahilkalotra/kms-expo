import { Text, View } from 'react-native';

import { useNetworkStatus } from '@/src/core/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View className="px-4 py-2 bg-amber-100 border-b border-amber-200">
      <Text className="text-sm text-amber-900">You're offline. Some features may not work.</Text>
    </View>
  );
}

