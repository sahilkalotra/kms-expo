import '@/global.css';

import * as Sentry from '@sentry/react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { useAppForegroundReschedule } from '@/src/features/app/useAppForegroundReschedule';
import { AuthProvider } from '@/src/features/auth/providers/AuthProvider';
import { BookmarksProvider } from '@/src/features/courses/providers/BookmarksProvider';
import { EnrollmentProvider } from '@/src/features/courses/providers/EnrollmentProvider';
import { trackAppOpened } from '@/src/features/notifications/services/reengagement';
import { initSentry } from '@/src/telemetry/sentry';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { AppErrorBoundary } from '@/src/ui/AppErrorBoundary';
import { OfflineBanner } from '@/src/ui/OfflineBanner';

initSentry();

function RootLayout() {
  const { colorScheme } = useColorScheme();
  useAppForegroundReschedule();

  useEffect(() => {
    trackAppOpened().catch(() => {
    });
  }, []);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BookmarksProvider>
            <EnrollmentProvider>
              <OfflineBanner />
              <Slot />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </EnrollmentProvider>
          </BookmarksProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

