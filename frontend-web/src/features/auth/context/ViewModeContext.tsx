import * as React from 'react';

type ViewRole = 'admin' | 'customer';

interface ViewModeContextValue {
    viewAs: ViewRole;
    setViewAs: (role: ViewRole) => void;
}

const ViewModeContext = React.createContext<ViewModeContextValue>({
    viewAs: 'admin',
    setViewAs: () => undefined,
});

export function ViewModeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [viewAs, setViewAs] = React.useState<ViewRole>('admin');

    const value = React.useMemo(
        () => ({ viewAs, setViewAs }),
        [viewAs],
    );

    return (
        <ViewModeContext.Provider value={value}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode(): ViewModeContextValue {
    return React.useContext(ViewModeContext);
}
