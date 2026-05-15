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

// Mock handlers co-located in features import mock utils — group together to avoid circular deps
const APP_CHUNK_MAP: Array<[string, string]> = [
  ['.mock.ts', 'app-mock'],
  ['/src/app/mock/', 'app-mock'],
  ['/src/shared/ui/', 'shared-ui'],
  ['/src/features/auth/', 'features-auth'],
  ['/src/features/notifications/', 'features-notifications'],
  ['/src/features/', 'features'],
  ['/src/entities/', 'entities'],
  ['/src/widgets/layout/', 'widgets-layout'],
  ['/src/widgets/pos/', 'widgets-pos'],
  ['/src/widgets/dashboard/', 'widgets-dashboard'],
  ['/src/widgets/', 'widgets-shared'],
];

function resolveChunk(id: string): string | undefined {
  if (id.includes('node_modules')) {
    return VENDOR_MAP.find(([pattern]) => id.includes(pattern))?.[1];
  }
  // Animated components (FadeIn, Reveal) only used by lazy LandingPage — keep out of shared-ui
  if (id.includes('/src/shared/ui/animated/')) return undefined;
  return APP_CHUNK_MAP.find(([pattern]) => id.includes(pattern))?.[1];
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
        additionalData: `@use "@shared/styles/tokens/colors" as *;\n@use "@shared/styles/tokens/auth-colors" as *;\n@use "@shared/styles/tokens/typography" as *;\n@use "@shared/styles/tokens/spacing" as *;\n@use "@shared/styles/tokens/layout" as *;\n@use "@shared/styles/tokens/z-index" as *;\n`,
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
});
