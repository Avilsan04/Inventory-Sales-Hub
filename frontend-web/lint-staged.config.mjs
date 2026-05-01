export default {
  'src/**/*.{ts,tsx}': [
    'prettier --write',
    'eslint --max-warnings 0',
  ],
  'src/**/*.{scss,json}': ['prettier --write'],
};
