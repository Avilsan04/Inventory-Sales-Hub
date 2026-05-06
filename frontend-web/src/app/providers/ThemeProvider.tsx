import * as React from 'react';
import {
  ThemeContext,
  type Theme,
  type ResolvedTheme,
  type ThemeContextType,
} from '@shared/hooks/useTheme';

const STORAGE_KEY = 'app_theme';
const isBrowser = typeof window !== 'undefined';

function getSystemTheme(): ResolvedTheme {
  if (!isBrowser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (!isBrowser) return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* */
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [theme, setThemeState] = React.useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(getSystemTheme);

  React.useEffect(() => {
    if (!isBrowser) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent): void => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return (): void => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  React.useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* */
    }
  }, [theme, resolvedTheme]);

  const setTheme = React.useCallback((t: Theme): void => {
    setThemeState(t);
  }, []);

  // Toggle cycles only between light/dark — system is set via settings page
  const toggleTheme = React.useCallback((): void => {
    setThemeState(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme]);

  const value = React.useMemo<ThemeContextType>(
    () => ({ theme, resolvedTheme, toggleTheme, setTheme }),
    [theme, resolvedTheme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
