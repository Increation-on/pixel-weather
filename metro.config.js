// metro.config.js - Исправленная версия для Windows
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// 1. Получаем дефолтную конфигурацию
const config = getDefaultConfig(__dirname, {
  // Это важно для Windows
  isCSSEnabled: true,
});

// 2. Добавляем поддержку .ico файлов
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'ico',
];

// 3. Настройка для TypeScript
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'd.ts',
];


// 4. Настройка для алиасов (если используете @/src)
const path = require('path');
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

// 5. Экспортируем с NativeWind
module.exports = withNativeWind(config, { 
  input: './global.css',
  // Для Windows может потребоваться явно указать проект
  projectRoot: __dirname 
});