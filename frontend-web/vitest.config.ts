import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            exclude: [
                'src/app/mock/**',
                'src/mocks/**',
                '**/*.mock.ts',
                '**/*.d.ts',
                'src/core/i18n/**',
                'tests/**',
            ],
            thresholds: {
                // Global baseline — UI components, pages, widgets
                lines: 70,
                branches: 70,
                functions: 70,
                statements: 70,
                // Strict — core infrastructure must be well-covered (failures originate here)
                'src/core/**/*.ts': {
                    lines: 95,
                    branches: 95,
                    functions: 95,
                    statements: 95,
                },
                // Strict — feature hooks are business logic (most production bugs live here)
                'src/features/**/hooks/**/*.ts': {
                    lines: 95,
                    branches: 95,
                    functions: 95,
                    statements: 95,
                },
            },
        },
    },
    resolve: {
        alias: {
            '@shared': resolve(__dirname, 'src/shared'),
            '@features': resolve(__dirname, 'src/features'),
            '@entities': resolve(__dirname, 'src/entities'),
            '@core': resolve(__dirname, 'src/core'),
            '@pages': resolve(__dirname, 'src/pages'),
            '@adapters': resolve(__dirname, 'src/shared/adapters'),
            '@app': resolve(__dirname, 'src/app'),
            '@widgets': resolve(__dirname, 'src/widgets'),
            '@assets': resolve(__dirname, 'src/assets'),
        },
    },
});
