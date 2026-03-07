import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'build', 'node_modules', '.expo', 'android', 'ios'] },
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
        project: ['./tsconfig.json'],
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
      '@typescript-eslint/explicit-function-return-type': 'error', // Enforced for architectural boundary clarity
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
  }
);