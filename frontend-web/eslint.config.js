import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  { ignores: ['dist', 'build', 'node_modules', '.expo', 'android', 'ios', 'public'] },
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
  // Environment override for MOBILE
  {
    files: ['frontend-mobile/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.reactNative,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
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