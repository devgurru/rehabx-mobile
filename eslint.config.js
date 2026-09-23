// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  {
    // react-three-fiber JSX uses three.js props (position, args, intensity…) the DOM rule doesn't know.
    files: ['src/exercise3d/**/*.tsx'],
    rules: { 'react/no-unknown-property': 'off' },
  },
]);
