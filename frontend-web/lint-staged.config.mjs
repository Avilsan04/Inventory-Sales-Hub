export default {
  'src/**/*.{ts,tsx}': [
    'prettier --write',
    '../node_modules/.bin/eslint --max-warnings 0',
  ],
  'src/**/*.{scss,json}': ['prettier --write'],
};
