import * as React from 'react';
// Align the import exactly with what the compiler found in useTheme.ts: ThemeContextType
import { ThemeContext, type Theme, type ThemeContextType } from '@shared/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'app_theme';
const isBrowser = typeof window !== 'undefined';

function getInitialTheme(): Theme {
  if (!isBrowser) return 'light';

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored as Theme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    if (!isBrowser) return;

    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Graceful degradation
    }
  }, [theme]);

  const setTheme = React.useCallback((t: Theme): void => {
    setThemeState(t);
  }, []);

  const toggleTheme = React.useCallback((): void => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Strict enforcement of the ThemeContextType contract
  const value = React.useMemo<ThemeContextType>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}