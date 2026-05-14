import * as Sentry from '@sentry/react-native';

/**
 * Reports an error to Sentry with optional structured context (no-op when Sentry is disabled).
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

/**
 * Sends a message to Sentry (breadcrumbs / issues) with optional context.
 */
export function logMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  Sentry.captureMessage(message, {
    level,
    ...(context ? { extra: context } : {}),
  });
}
