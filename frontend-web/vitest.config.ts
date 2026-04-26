import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
    },
    resolve: {
        alias: {
            '@shared': resolve(__dirname, 'src/shared'),
            '@features': resolve(__dirname, 'src/features'),
            '@entities': resolve(__dirname, 'src/entities'),
            '@core': resolve(__dirname, 'src/core'),
            '@pages': resolve(__dirname, 'src/pages'),
            '@adapters': resolve(__dirname, 'src/shared/adapters'),
        },
    },
});
