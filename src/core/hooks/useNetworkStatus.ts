import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  async function check() {
    try {
      const state = await Network.getNetworkStateAsync();
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(Boolean(offline));
    } catch {
      // if we can't check, assume online
      setIsOffline(false);
    }
  }

  useEffect(() => {
    check().catch(() => {});
    const netSub = Network.addNetworkStateListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(Boolean(offline));
    });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check().catch(() => {});
    });
    return () => {
      sub.remove();
      netSub.remove();
    };
  }, []);

  return { isOffline, refreshNetworkStatus: check };
}

