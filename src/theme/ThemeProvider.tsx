import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { storageGet, storageSet } from '@/src/core/storage/appStorage';
import { THEME_KEYS } from '@/src/theme/themeKeys';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await storageGet<ThemeMode>(THEME_KEYS.mode);
      if (!mounted) return;
      if (saved) setModeState(saved);
    })().catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  function setMode(next: ThemeMode) {
    setModeState(next);
    storageSet(THEME_KEYS.mode, next).catch(() => {});
  }

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

