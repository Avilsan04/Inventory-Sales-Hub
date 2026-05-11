import * as React from 'react';
import type { IAuthService } from '@features/auth';
import { AuthService } from '@features/auth';
import { authApi } from '@features/auth';
import { tokenStorage } from '@core/storage/tokenStorage';

export interface IDependencies {
  readonly authService: IAuthService;
}

export const DependencyContext = React.createContext<IDependencies | null>(null);

export function DependencyProvider({ children }: React.PropsWithChildren): React.ReactElement {
  // The Composition Root single-handedly constructs the application graph
  const dependencies = React.useMemo<IDependencies>(() => {
    return {
      authService: new AuthService(authApi, tokenStorage),
    };
  }, []);

  return <DependencyContext.Provider value={dependencies}>{children}</DependencyContext.Provider>;
}
