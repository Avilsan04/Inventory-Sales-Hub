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
            reporter: ['text', 'lcov'],
            thresholds: {
                lines: 70,
                branches: 70,
                functions: 70,
                statements: 70,
            },
            exclude: [
                'src/app/mock/**',
                'src/mocks/**',
                '**/*.mock.ts',
                '**/*.d.ts',
                'src/core/i18n/**',
                'tests/**',
            ],
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
