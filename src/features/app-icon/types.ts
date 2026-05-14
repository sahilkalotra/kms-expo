import type { ImageSourcePropType } from 'react-native';

/**
 * Alternate app icons are configured in `app.json` via `@howincodes/expo-dynamic-app-icon`.
 * Labels: Default (system), Classic / Dark / Minimal map to plugin keys `classic`, `charcoal`, `cobalt`.
 *
 * For `react-native-change-icon` instead, you would remove this plugin and wire native
 * `CFBundleAlternateIcons` / Android activity-aliases manually — not used in this project.
 */
export type AppIconPluginKey = 'classic' | 'cobalt' | 'charcoal';

export type AppIconUiChoice = 'default' | AppIconPluginKey;

export type AppIconOption = {
  id: AppIconUiChoice;
  /** User-facing label */
  label: string;
  /** Native plugin key; null resets to default launcher icon */
  pluginKey: AppIconPluginKey | null;
  preview: ImageSourcePropType;
};

/** Order: Default + at least three alternates (Classic, Dark, Minimal). */
export const APP_ICON_OPTIONS: AppIconOption[] = [
  {
    id: 'default',
    label: 'Default',
    pluginKey: null,
    preview: require('../../../assets/images/icon.png'),
  },
  // {
  //   id: 'classic',
  //   label: 'Classic',
  //   pluginKey: 'classic',
  //   preview: require('../../../assets/app-icons/variant_classic.png'),
  // },
  {
    id: 'charcoal',
    label: 'IRL',
    pluginKey: 'charcoal',
    preview: require('../../../assets/app-icons/variant_charcoal.png'),
  },
  {
    id: 'cobalt',
    label: 'livesphere',
    pluginKey: 'cobalt',
    preview: require('../../../assets/app-icons/variant_cobalt.png'),
  },
];

/** Maps `getAppIcon()` string to UI `id` for selection highlighting. */
export function nativeAppIconNameToUiId(native: string | undefined | null): AppIconUiChoice {
  if (native == null || native === '' || native === 'DEFAULT') return 'default';
  if (native === 'classic' || native === 'cobalt' || native === 'charcoal') return native;
  return 'default';
}
