module.exports = {
  extends: ["next/core-web-vitals", 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    dev: true,
  },
};