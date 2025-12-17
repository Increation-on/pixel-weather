const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Отключаем автоудаление неиспользуемых импортов
      'no-unused-vars': 'off', // Для JavaScript[citation:1]
      '@typescript-eslint/no-unused-vars': 'off', // Для TypeScript[citation:3]
      // Можно отключить другие агрессивные правила
      'prefer-const': 'warn', // вместо 'error'[citation:2]
    },
  },
]);