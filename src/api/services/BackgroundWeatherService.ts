// src/services/BackgroundWeatherService.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherNotificationService } from './WeatherNotificationService';
import { fetchWeather } from './../services/weatherService';
import { AppState } from 'react-native';

// Название задачи
const BACKGROUND_WEATHER_TASK = 'background-weather-check';

// 1. Определяем задачу (в глобальной области видимости)
TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
  console.log('🟢 [MAIN TASK] СТАРТ основной задачи (BackgroundFetch)');
  
  // Логирование в AsyncStorage
  await AsyncStorage.setItem('last_task_execution', JSON.stringify({
    timestamp: Date.now(),
    state: AppState.currentState,
    task: BACKGROUND_WEATHER_TASK,
    version: 'with-background-fetch'
  }));
  
  try {
    console.log('🌤️ [Background] Запуск проверки погоды...');
    
    // 1. Получаем сохраненные координаты
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 [Background] Нет сохраненной локации');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const { lat, lon } = JSON.parse(savedLocation);
    
    // 2. Получаем погоду
    const newData = await fetchWeather(lat, lon);
    
    // 3. Получаем старые данные
    const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
    
    // 4. Проверяем изменения
    await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
    
    console.log(`✅ [Background] Проверка завершена`);
    console.log('🟢 [MAIN TASK] УСПЕШНОЕ завершение');
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
    
  } catch (error: any) {
    console.error('🔴 [MAIN TASK] КРИТИЧЕСКАЯ ОШИБКА:', error);
    
    await AsyncStorage.setItem('task_error', JSON.stringify({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      version: 'with-background-fetch'
    }));
    
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Регистрация задачи через BackgroundFetch
export async function registerBackgroundTask() {
  try {
    console.log('📱 Регистрируем фоновую задачу через BackgroundFetch...');
    
    // Проверяем доступность BackgroundFetch
    const status = await BackgroundFetch.getStatusAsync();
    console.log(`📱 Статус BackgroundFetch: ${status}`);
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      // Регистрируем задачу
      await BackgroundFetch.registerTaskAsync(BACKGROUND_WEATHER_TASK, {
        minimumInterval: 15 * 60, // 15 минут в секундах (900)
        stopOnTerminate: false,   // Продолжать после закрытия приложения
        startOnBoot: true,        // Запускать при старте устройства
      });
      
      console.log('✅ BackgroundFetch задача зарегистрирована');
      return true;
    } else {
      console.log(`⚠️ BackgroundFetch недоступен. Статус: ${status}`);
      return false;
    }
    
  } catch (error: any) {
    console.log('❌ Ошибка регистрации задачи:', error);
    return false;
  }
}

// 3. Отмена задачи
export async function unregisterBackgroundTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_WEATHER_TASK);
    console.log('✅ BackgroundFetch задача отменена');
    return true;
  } catch (error: any) {
    console.log('❌ Ошибка отмены задачи:', error);
    return false;
  }
}

// 4. Проверка зарегистрирована ли задача
export async function isBackgroundTaskRegistered() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
    console.log(`🔍 Задача "${BACKGROUND_WEATHER_TASK}" зарегистрирована: ${isRegistered}`);
    return isRegistered;
  } catch (error: any) {
    console.log('❌ Ошибка проверки регистрации:', error);
    return false;
  }
}

// 5. Запуск задачи вручную (для тестирования) - ИСПРАВЛЕННАЯ ВЕРСИЯ
export async function runBackgroundTaskNow() {
  console.log('🚀 Пытаемся запустить задачу вручную...');
  
  try {
    // BackgroundFetch не имеет scheduleTaskAsync, используем локальное выполнение
    console.log('ℹ️ BackgroundFetch не поддерживает немедленный запуск');
    console.log('ℹ️ Выполняем задачу локально...');
    
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 Нет сохраненной локации');
      return false;
    }
    
    const { lat, lon } = JSON.parse(savedLocation);
    const newData = await fetchWeather(lat, lon);
    const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
    await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
    
    console.log('✅ Задача выполнена локально');
    return true;
  } catch (error: any) {
    console.log('❌ Ошибка запуска:', error);
    return false;
  }
}

// 6. Получение статуса - ИСПРАВЛЕННАЯ ВЕРСИЯ
export async function getBackgroundTaskStatus(): Promise<string> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    console.log(`📱 Статус BackgroundFetch: ${status}`);
    
    // Конвертируем в более понятный формат
    const statusMap: Record<number, string> = {
      [BackgroundFetch.BackgroundFetchStatus.Available]: 'available',
      [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'restricted',
      [BackgroundFetch.BackgroundFetchStatus.Denied]: 'denied',
    };
    
    // Проверяем что status не null/undefined
    if (status !== null && status !== undefined) {
      return statusMap[status] || 'unknown';
    }
    
    return 'unknown';
  } catch (error: any) {
    console.log('❌ Ошибка получения статуса:', error);
    return 'error';
  }
}

// 7. Инициализация фоновых задач при запуске приложения
export async function initializeBackgroundTasks() {
  console.log('🔄 Инициализация фоновых задач...');
  
  // Проверяем доступность
  const status = await BackgroundFetch.getStatusAsync();
  console.log(`📱 BackgroundFetch статус: ${status}`);
  
  if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
    // Автоматически регистрируем задачу при запуске
    const registered = await registerBackgroundTask();
    console.log(`📱 Фоновая задача ${registered ? 'зарегистрирована' : 'не зарегистрирована'}`);
    return registered;
  } else {
    console.log('⚠️ BackgroundFetch недоступен. Причина:', status);
    return false;
  }
}

// 8. Получить информацию о доступных задачах
export async function getAvailableTasks() {
  try {
    const tasks = await TaskManager.getRegisteredTasksAsync();
    console.log('📋 Доступные задачи:', tasks);
    return tasks;
  } catch (error: any) {
    console.log('❌ Ошибка получения задач:', error);
    return [];
  }
}

// 9. Простая проверка работы TaskManager
export async function testTaskManager() {
  try {
    console.log('🧪 Тестируем TaskManager...');
    
    // Проверяем доступность
    const tasks = await TaskManager.getRegisteredTasksAsync();
    console.log('📋 Зарегистрированные задачи:', tasks);
    
    // Проверяем нашу задачу
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
    console.log(`🔍 Наша задача зарегистрирована: ${isRegistered}`);
    
    // Проверяем BackgroundFetch статус
    const bgStatus = await BackgroundFetch.getStatusAsync();
    console.log(`📱 BackgroundFetch статус: ${bgStatus}`);
    
    return {
      available: Array.isArray(tasks),
      ourTaskRegistered: isRegistered,
      totalTasks: tasks?.length || 0,
      backgroundFetchStatus: bgStatus
    };
  } catch (error: any) {
    console.log('❌ Ошибка тестирования TaskManager:', error);
    return { 
      available: false, 
      error: error.message || 'Unknown error' 
    };
  }
}

// 10. Принудительное изменение погоды для теста
export async function forceWeatherChangeForTest() {
  console.log('🧪 Принудительно создаем изменение погоды для теста...');
  
  try {
    // Получаем текущие данные
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 Нет сохраненной локации');
      return false;
    }
    
    const { lat, lon } = JSON.parse(savedLocation);
    const currentWeather = await fetchWeather(lat, lon);
    
    // Создаем "старые" данные с другой погодой
    const fakeOldSnapshot = {
      timestamp: Date.now() - 100000, // 100 секунд назад
      temperature: currentWeather.current.temperature,
      precipitation: currentWeather.current.precipitation || 0,
      windSpeed: currentWeather.current.windSpeed,
      weatherCode: 0, // Ясно (отличается от текущей)
    };
    
    console.log('📊 Тестовые данные:');
    console.log('   Старая погода: Ясно ☀️ (код 0)');
    console.log('   Новая погода:', currentWeather.current.weatherCode);
    
    // Проверяем уведомления
    const changes = await WeatherNotificationService.checkAndNotify(
      fakeOldSnapshot,
      currentWeather
    );
    
    console.log(`✅ Тест завершен. Изменений: ${changes.length}`);
    return changes.length > 0;
    
  } catch (error: any) {
    console.log('❌ Ошибка теста:', error);
    return false;
  }
}

// 11. Симуляция выполнения в фоне
export async function simulateBackgroundExecution() {
  console.log('🌙 Симулируем выполнение в фоне...');
  
  try {
    // Сохраняем время "фонового" запуска
    await AsyncStorage.setItem('background_simulation', JSON.stringify({
      timestamp: Date.now(),
      simulated: true
    }));
    
    // Выполняем задачу как будто в фоне
    console.log('🔄 Выполняем задачу...');
    
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 Нет локации');
      return;
    }
    
    const { lat, lon } = JSON.parse(savedLocation);
    const newData = await fetchWeather(lat, lon);
    const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
    
    // Принудительно меняем AppState для теста
    console.log('📱 AppState (симулированный): background');
    
    await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
    
    console.log('✅ Симуляция завершена');
    
  } catch (error: any) {
    console.log('❌ Ошибка симуляции:', error);
  }
}

// 12. Мониторинг фоновых выполнений
export async function monitorBackgroundExecution() {
  console.log('👁️ Мониторинг фоновых выполнений...');
  
  // Проверяем были ли выполнения в фоне
  const lastExecution = await AsyncStorage.getItem('last_task_execution');
  if (lastExecution) {
    const data = JSON.parse(lastExecution);
    console.log('📝 Последнее выполнение задачи:');
    console.log('   Время:', new Date(data.timestamp).toLocaleTimeString());
    console.log('   Статус AppState:', data.state);
    console.log('   Версия:', data.version);
    console.log('   Задача:', data.task);
  } else {
    console.log('📝 Задач еще не выполнялось');
  }
  
  // Проверяем симуляции
  const simulation = await AsyncStorage.getItem('background_simulation');
  if (simulation) {
    const simData = JSON.parse(simulation);
    console.log('🎭 Последняя симуляция:');
    console.log('   Время:', new Date(simData.timestamp).toLocaleTimeString());
  }
  
  // Проверяем ошибки
  const lastError = await AsyncStorage.getItem('task_error');
  if (lastError) {
    console.log('🔴 Последняя ошибка задачи:');
    console.log(JSON.parse(lastError));
  }
  
  // Проверяем статус BackgroundFetch
  try {
    const status = await BackgroundFetch.getStatusAsync();
    console.log(`📱 Текущий статус BackgroundFetch: ${status}`);
  } catch (error: any) {
    console.log('📱 Не удалось получить статус BackgroundFetch');
  }
}

// 13. Быстрая проверка всех систем
export async function quickSystemCheck() {
  console.log('🔍 Быстрая проверка систем...');
  
  const results = {
    taskManager: await testTaskManager(),
    backgroundFetchStatus: await getBackgroundTaskStatus(),
    lastExecution: await AsyncStorage.getItem('last_task_execution') ? true : false,
    hasLocation: await AsyncStorage.getItem('user_location') ? true : false,
  };
  
  console.log('📊 Результаты проверки:', results);
  return results;
}