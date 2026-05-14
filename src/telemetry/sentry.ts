import * as Sentry from '@sentry/react-native';

let initialized = false;

/**
 * Initializes Sentry for JS, native, and unhandled-rejection capture (SDK defaults).
 * Requires `EXPO_PUBLIC_SENTRY_DSN` for production telemetry; without a DSN, Sentry stays disabled.
 *
 * Native setup: `app.json` includes the `@sentry/react-native` config plugin; `metro.config.js`
 * uses `withSentryConfig`. Rebuild the dev client or production app after changing Sentry config.
 */
export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = "https://e5b9b4b613c824f58be85923463149ed@o4511389280436224.ingest.us.sentry.io/4511389286137856";

  Sentry.init({
    dsn: dsn || undefined,
    enabled: Boolean(dsn),
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.15,
  });
}
