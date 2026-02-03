import { requireNativeModule } from 'expo-modules-core';
console.log('Тест: пытаемся загрузить модуль...');
try {
  const module = requireNativeModule('ExpoBackgroundTask');
  console.log('✅ УСПЕХ! Модуль загружен:', module);
} catch (error) {
  console.log('❌ ОШИБКА:', error.message);
  console.log('Стек:', error.stack);
}