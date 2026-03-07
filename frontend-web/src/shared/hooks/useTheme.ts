import * as React from 'react';

// Centralized types for strictly defined UI states
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Internal context creation. The default value throws to enforce Provider usage.
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// The strictly typed hook to be consumed by generic shared UI or feature components
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};