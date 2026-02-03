import * as BackgroundTask from 'expo-background-task';
import { NativeModules } from 'react-native';

console.log('=== MINIMAL TEST ===');
console.log('1. BackgroundTask объект:', typeof BackgroundTask);
console.log('2. Доступные методы:', Object.keys(BackgroundTask));
console.log('3. Все NativeModules:', Object.keys(NativeModules).sort());
console.log('4. ExpoBackgroundTask есть?', 'ExpoBackgroundTask' in NativeModules);

// Пробуем вызвать простой метод
try {
  const result = await BackgroundTask.isAvailableAsync();
  console.log('5. isAvailableAsync результат:', result);
} catch (error) {
  console.log('5. isAvailableAsync ошибка:', error.message);
}
