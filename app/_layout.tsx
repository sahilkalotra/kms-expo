import '@/global.css';

import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';

import { AppErrorBoundary } from '@/src/ui/AppErrorBoundary';
import { OfflineBanner } from '@/src/ui/OfflineBanner';
import { AuthProvider } from '@/src/features/auth/providers/AuthProvider';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { trackAppOpened } from '@/src/features/notifications/services/reengagement';
import { BookmarksProvider } from '@/src/features/courses/providers/BookmarksProvider';
import { EnrollmentProvider } from '@/src/features/courses/providers/EnrollmentProvider';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    trackAppOpened().catch(() => {
      // best effort
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

