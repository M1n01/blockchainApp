import eslint from '@eslint/js';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['frontend//*.{ts,tsx}'],
    ignores: ['frontend/node_modules', 'frontend/types'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['error'],
    },
  },
];
