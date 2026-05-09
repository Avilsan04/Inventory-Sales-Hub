import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react-dom/') || id.includes('/react-router-dom/') || id.includes('/react/')) return 'vendor-react';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('@radix-ui/')) return 'vendor-radix';
            if (id.includes('/recharts/')) return 'vendor-charts';
            if (id.includes('/react-hook-form/') || id.includes('@hookform/') || id.includes('/zod/')) return 'vendor-forms';
            if (id.includes('/framer-motion/')) return 'vendor-motion';
          }
          // Eagerly-loaded widgets inflate index.js — split into own chunk
          if (id.includes('/src/widgets/')) return 'app-widgets';
          // MSW seed/mock data only needed in dev — keep out of main bundle
          if (id.includes('/src/app/mock/')) return 'app-mock';
        },
      },
    },
  },
});
