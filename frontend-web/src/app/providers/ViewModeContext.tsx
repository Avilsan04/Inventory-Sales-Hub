import * as React from 'react';
import { APP_ENV } from '@core/config/env';

export type ViewRole = 'company' | 'admin' | 'manager' | 'staff' | 'customer';

const STORAGE_KEY = `ish.${APP_ENV}.viewMode`;
const IS_MOCK =
  import.meta.env.DEV ||
  import.meta.env.VITE_MOCK_ENABLED === 'true' ||
  sessionStorage.getItem('ish.demo') === 'true';
const VALID_VIEW_ROLES: ReadonlyArray<string> = [
  'company',
  'admin',
  'manager',
  'staff',
  'customer',
];

function readPersistedRole(): ViewRole {
  if (IS_MOCK) return 'admin';
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && VALID_VIEW_ROLES.includes(stored)) return stored as ViewRole;
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
    if (!IS_MOCK) {
      try {
        sessionStorage.setItem(STORAGE_KEY, role);
      } catch {
        // Storage write failure is non-fatal
      }
    }
    setViewAsState(role);
  }, []);

  const value = React.useMemo(() => ({ viewAs, setViewAs }), [viewAs, setViewAs]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeContextValue {
  return React.useContext(ViewModeContext);
}
