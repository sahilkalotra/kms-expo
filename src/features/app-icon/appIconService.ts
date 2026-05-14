import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { AppIconPluginKey, AppIconUiChoice } from '@/src/features/app-icon/types';

/** Narrow surface we use from `@howincodes/expo-dynamic-app-icon` (avoid top-level import — see below). */
type ExpoDynamicAppIconNative = {
  getAppIcon: () => Promise<string>;
  setAppIcon: (name: string | null, isInBackground?: boolean) => Promise<string | false>;
};

let nativeModule: ExpoDynamicAppIconNative | null | undefined;

/**
 * Loads the native module only when it can exist. Never statically `import` the package:
 * that runs at bundle load and crashes in Expo Go with "Cannot find native module 'ExpoDynamicAppIcon'".
 */
function getExpoDynamicAppIconModule(): ExpoDynamicAppIconNative | null {
  if (nativeModule !== undefined) return nativeModule;
  if (Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    nativeModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeModule = require('@howincodes/expo-dynamic-app-icon') as ExpoDynamicAppIconNative;
  } catch {
    nativeModule = null;
  }
  return nativeModule;
}

/**
 * Alternate icons require native code from prebuild / EAS dev client.
 * Expo Go (`StoreClient`) does not ship this module. Rebuild the dev client after changing `app.json` plugins.
 *
 * iOS: alternate icons are baked in at prebuild. Android: adaptive icon may refresh after leaving the app.
 */
export function areAlternateAppIconsSupported(): boolean {
  return getExpoDynamicAppIconModule() !== null;
}

export async function readCurrentAppIconName(): Promise<string> {
  const mod = getExpoDynamicAppIconModule();
  if (!mod) return 'DEFAULT';
  try {
    return await mod.getAppIcon();
  } catch {
    return 'DEFAULT';
  }
}

/**
 * @returns false when native change failed (rebuild dev client if plugin config changed).
 */
export async function applyAppIcon(choice: AppIconUiChoice): Promise<boolean> {
  const mod = getExpoDynamicAppIconModule();
  if (!mod) return false;
  // iOS: `isInBackground: true` uses a private API path; Springboard often keeps showing the old
  // icon until `false` uses `UIApplication.setAlternateIconName` (public, reliable in Simulator/device).
  // Android: keep `true` so the package applies the alias when the activity pauses (see module source).
  const deferToBackground = Platform.OS === 'android';
  if (choice === 'default') {
    const result = await mod.setAppIcon(null, deferToBackground);
    return result !== false;
  }
  const result = await mod.setAppIcon(choice as AppIconPluginKey, deferToBackground);
  return result !== false;
}
