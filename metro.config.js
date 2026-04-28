// Metro config needed for NativeWind (CSS interop) to work reliably.
// This enables `global.css` and `className` styles in React Native.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });

