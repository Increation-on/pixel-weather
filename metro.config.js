const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// Получаем дефолтную конфигурацию
const config = getDefaultConfig(__dirname);

// Добавляем поддержку .ico файлов
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'ico', // ← ДОБАВЛЯЕМ ЭТО
];

// Настройка для TypeScript
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'd.ts', // для деклараций
];

module.exports = withNativeWind(config, { input: './global.css' });