import * as React from 'react';
import type { IAuthService } from '@features/auth/services/IAuthService';
import { AuthService } from '@features/auth/services/authService';
import { authApi } from '@features/auth/api/authApi';
import { tokenStorage } from '@core/storage/tokenStorage';

export interface IDependencies {
    readonly authService: IAuthService;
    // Future services (e.g., inventoryService) will be strictly declared here
}

export const DependencyContext = React.createContext<IDependencies | null>(null);

export function DependencyProvider({ children }: React.PropsWithChildren): React.ReactElement {
    // The Composition Root single-handedly constructs the application graph
    const dependencies = React.useMemo<IDependencies>(() => {
        return {
            authService: new AuthService(authApi, tokenStorage),
        };
    }, []);

    return (
        <DependencyContext.Provider value={dependencies}>
            {children}
        </DependencyContext.Provider>
    );
}