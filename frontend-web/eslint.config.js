import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  { ignores: ['dist', 'build', 'node_modules', '.expo', 'android', 'ios', 'public', 'e2e/**', 'playwright.config.ts', 'coverage/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, eslintConfigPrettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      // Allow specific globals based on environment explicitly in sub-folders later,
      // but establish common globals here.
      globals: {
        ...globals.es2020,
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Cyclomatic complexity — a 80-line hook with 10 nested ifs is worse than 150 lines of sequential mapping
      'complexity': ['warn', { max: 12 }],
      // File size limits — signals SRP violation when exceeded
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      // Deep import prevention — enforce public API (index.ts) for all cross-slice imports.
      // Set to 'warn' during migration. Reduce --max-warnings threshold as violations are fixed.
      // Target: 'error' + --max-warnings 0 once all violations are resolved (estimated end of FASE 3).
      // SCSS module imports are excluded — they have no TS public API by design.
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@features/*/*', '@features/*/**', '!@features/**/*.scss', '!@features/**/*.module.scss'],
            message: "Deep import forbidden. Use public API: import from '@features/[slice]' only.",
          },
          {
            group: ['@widgets/*/*', '@widgets/*/**', '!@widgets/**/*.scss', '!@widgets/**/*.module.scss'],
            message: "Deep import forbidden. Use public API: import from '@widgets/[slice]' only.",
          },
          {
            group: ['@entities/*/*', '@entities/*/**', '!@entities/**/*.scss', '!@entities/**/*.module.scss'],
            message: "Deep import forbidden. Use public API: import from '@entities/[slice]' only.",
          },
          {
            group: ['@shared/ui/*/*', '@shared/ui/*/**', '@shared/hooks/*/*', '@shared/hooks/*/**', '@shared/lib/*/*', '@shared/lib/*/**'],
            message: "Deep import forbidden. Use public API: import from '@shared/[layer]' only (e.g. '@shared/ui', '@shared/hooks', '@shared/lib').",
          },
          {
            group: ['@pages/*/*', '@pages/*/**', '!@pages/**/*.scss', '!@pages/**/*.module.scss'],
            message: "Deep import forbidden. Use public API: import from '@pages/[slice]' only.",
          },
        ],
      }],
    },
  },
  // Environment override for WEB
  {
    files: ['frontend-web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    }
  },
  // FSD layer boundary enforcement
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app',      pattern: 'src/app/**'      },
        { type: 'pages',    pattern: 'src/pages/**'    },
        { type: 'widgets',  pattern: 'src/widgets/**'  },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared',   pattern: 'src/shared/**'   },
        { type: 'core',     pattern: 'src/core/**'     },
      ],
      'boundaries/resolve-aliases': {
        '@app':      { path: './src/app'      },
        '@pages':    { path: './src/pages'    },
        '@widgets':  { path: './src/widgets'  },
        '@features': { path: './src/features' },
        '@entities': { path: './src/entities' },
        '@shared':   { path: './src/shared'   },
        '@adapters': { path: './src/shared/adapters' },
        '@core':     { path: './src/core'     },
      },
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app',      allow: ['pages', 'widgets', 'features', 'entities', 'shared', 'core'] },
          { from: 'pages',    allow: ['widgets', 'features', 'entities', 'shared', 'core'] },
          { from: 'widgets',  allow: ['features', 'entities', 'shared', 'core'] },
          { from: 'features', allow: ['entities', 'shared', 'core'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared',   allow: ['core'] },
          { from: 'core',     allow: [] },
        ],
      }],
    },
  }
);