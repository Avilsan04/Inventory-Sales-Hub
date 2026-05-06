import * as React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DependencyContext, type IDependencies } from '../../src/app/providers/DependencyProvider';
import { createMockAuthService } from './mockDependencies';

function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

interface RenderOptions {
    dependencies?: Partial<IDependencies>;
    initialEntries?: string[];
}

export function renderWithProviders(
    ui: React.ReactElement,
    { dependencies = {}, initialEntries = ['/'] }: RenderOptions = {}
): RenderResult {
    const queryClient = createTestQueryClient();

    const mockDeps: IDependencies = {
        authService: createMockAuthService(),
        ...dependencies,
    };

    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <DependencyContext.Provider value={mockDeps}>
                <QueryClientProvider client={queryClient}>
                    {ui}
                </QueryClientProvider>
            </DependencyContext.Provider>
        </MemoryRouter>
    );
}
