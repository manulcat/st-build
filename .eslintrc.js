module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es2024: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['lib/js/**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
