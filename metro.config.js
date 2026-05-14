// Metro config needed for NativeWind (CSS interop) to work reliably.
// This enables `global.css` and `className` styles in React Native.
//
// Sentry: use `getSentryExpoConfig` so Debug IDs are applied via
// `unstable_beforeAssetSerializationPlugins` instead of `withSentryConfig`'s
// custom serializer wrapper. Wrapping NativeWind's serializer breaks the Debug
// ID flow ("Debug ID was not found…" / `sentryBundleCallback`), and wrapping
// Sentry with NativeWind can yield undefined bundle code on Hermes export.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname, {
  getDefaultConfig,
});

module.exports = withNativeWind(config, { input: './global.css' });
