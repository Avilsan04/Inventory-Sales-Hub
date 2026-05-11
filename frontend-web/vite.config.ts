import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const VENDOR_MAP: Array<[string, string]> = [
  ['/react-dom/', 'vendor-react'],
  ['/react-router-dom/', 'vendor-react'],
  ['/react/', 'vendor-react'],
  ['@tanstack/react-query', 'vendor-query'],
  ['@radix-ui/', 'vendor-radix'],
  ['/recharts/', 'vendor-charts'],
  ['/react-hook-form/', 'vendor-forms'],
  ['@hookform/', 'vendor-forms'],
  ['/zod/', 'vendor-forms'],
  ['/framer-motion/', 'vendor-motion'],
];

function resolveChunk(id: string): string | undefined {
  if (id.includes('node_modules')) {
    return VENDOR_MAP.find(([pattern]) => id.includes(pattern))?.[1];
  }
  if (id.includes('/src/widgets/')) return 'app-widgets';
  if (id.includes('/src/app/mock/')) return 'app-mock';
  return undefined;
}

export default defineConfig({
  plugins: [
    react(),
    // Run `npm run analyze` to open an interactive bundle size treemap (mode === 'analyze')
    process.env['npm_lifecycle_event'] === 'analyze' && visualizer({ open: true, gzipSize: true, filename: 'dist/stats.html' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@adapters': path.resolve(__dirname, './src/shared/adapters'),
      '@core': path.resolve(__dirname, './src/core'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@shared/styles/tokens/colors" as *;\n@use "@shared/styles/tokens/typography" as *;\n@use "@shared/styles/tokens/spacing" as *;\n@use "@shared/styles/tokens/layout" as *;\n@use "@shared/styles/tokens/z-index" as *;\n`,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveChunk,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
          ],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
