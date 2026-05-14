import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { AppIconPluginKey, AppIconUiChoice } from '@/src/features/app-icon/types';

type ExpoDynamicAppIconNative = {
  getAppIcon: () => Promise<string>;
  setAppIcon: (name: string | null, isInBackground?: boolean) => Promise<string | false>;
};

let nativeModule: ExpoDynamicAppIconNative | null | undefined;

function getExpoDynamicAppIconModule(): ExpoDynamicAppIconNative | null {
  if (nativeModule !== undefined) return nativeModule;

  if (
    Platform.OS === 'web' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    nativeModule = null;
    return null;
  }

  try {
    nativeModule = require('@howincodes/expo-dynamic-app-icon') as ExpoDynamicAppIconNative;
  } catch {
    nativeModule = null;
  }

  return nativeModule;
}



export function areAlternateAppIconsSupported(): boolean {
  return getExpoDynamicAppIconModule() !== null;
}

export async function readCurrentAppIconName(): Promise<string> {
  const mod = getExpoDynamicAppIconModule();

  if (!mod) {
    return 'DEFAULT';
  }

  try {
    return await mod.getAppIcon();
  } catch {
    return 'DEFAULT';
  }
}

export async function applyAppIcon(choice: AppIconUiChoice): Promise<boolean> {
  const mod = getExpoDynamicAppIconModule();

  if (!mod) {
    return false;
  }

  const deferToBackground = Platform.OS === 'android';

  if (choice === 'default') {
    const result = await mod.setAppIcon(null, deferToBackground);
    return result !== false;
  }

  const result = await mod.setAppIcon(
    choice as AppIconPluginKey,
    deferToBackground
  );

  return result !== false;
}