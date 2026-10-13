import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './themeContextInstance';
import { applyTheme, getSystemTheme, readThemePreference, THEME_STORAGE_KEY } from '../lib/theme';
import type { ThemePreference } from '../lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState(readThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const theme = preference === 'system' ? systemTheme : preference;

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreferenceState(readThemePreference());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // O tema continua funcionando quando o navegador bloqueia o armazenamento.
    }
  }, []);

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
