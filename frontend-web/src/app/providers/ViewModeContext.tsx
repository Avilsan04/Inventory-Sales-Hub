import * as React from 'react';
import { APP_ENV } from '@core/config/env';

export type ViewRole = 'admin' | 'customer' | 'company';

const STORAGE_KEY = `ish.${APP_ENV}.viewMode`;

function readPersistedRole(): ViewRole {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'admin' || stored === 'customer' || stored === 'company') {
      return stored;
    }
  } catch {
    // sessionStorage unavailable (e.g. private mode restrictions)
  }
  return 'admin';
}

interface ViewModeContextValue {
  viewAs: ViewRole;
  setViewAs: (role: ViewRole) => void;
}

const ViewModeContext = React.createContext<ViewModeContextValue>({
  viewAs: 'admin',
  setViewAs: () => undefined,
});

export function ViewModeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [viewAs, setViewAsState] = React.useState<ViewRole>(readPersistedRole);

  const setViewAs = React.useCallback((role: ViewRole): void => {
    try {
      sessionStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Storage write failure is non-fatal
    }
    setViewAsState(role);
  }, []);

  const value = React.useMemo(() => ({ viewAs, setViewAs }), [viewAs, setViewAs]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeContextValue {
  return React.useContext(ViewModeContext);
}
