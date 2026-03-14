import * as React from 'react';
import { DependencyContext } from '@app/providers/DependencyProvider';
import type { IDependencies } from '@app/providers/DependencyProvider';

export function useDependencies(): IDependencies {
    const context = React.useContext(DependencyContext);

    if (context === null) {
        throw new Error(
            '[Architecture Violation] useDependencies invoked outside of DependencyProvider boundary.'
        );
    }

    return context;
}