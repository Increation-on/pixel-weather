// src/services/BackgroundWeatherService.ts
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherNotificationService } from './WeatherNotificationService';
import { fetchWeather } from './../services/weatherService';
import { AppState } from 'react-native';

// Название задачи
const BACKGROUND_WEATHER_TASK = 'background-weather-check';

// 1. Определяем задачу (в глобальной области видимости)
TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
  console.log('🟢 [MAIN TASK] СТАРТ основной задачи (BackgroundTask)');
  
  // Логирование в AsyncStorage
  await AsyncStorage.setItem('last_task_execution', JSON.stringify({
    timestamp: Date.now(),
    state: AppState.currentState,
    task: BACKGROUND_WEATHER_TASK,
    version: 'background-task-correct'
  }));
  
  try {
    console.log('🌤️ [Background] Запуск проверки погоды...');
    
    // 1. Получаем сохраненные координаты
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 [Background] Нет сохраненной локации');
      return; // BackgroundTask не возвращает результат
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
    
  } catch (error) {
    const err = error as Error;
    console.error('🔴 [MAIN TASK] КРИТИЧЕСКАЯ ОШИБКА:', err);
    
    await AsyncStorage.setItem('task_error', JSON.stringify({
      timestamp: Date.now(),
      error: err.message,
      stack: err.stack,
      version: 'background-task-correct'
    }));
  }
});

// 2. Регистрация задачи
export async function registerBackgroundTask() {
  try {
    // Сначала проверяем доступность
    const status = await BackgroundTask.getStatusAsync();
    console.log(`📱 Статус BackgroundTask: ${status} (${BackgroundTask.BackgroundTaskStatus[status]})`);
    
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      console.log('⚠️ BackgroundTask ограничен системой');
      return false;
    }
    
    // Регистрируем задачу
    await BackgroundTask.registerTaskAsync(BACKGROUND_WEATHER_TASK);
    console.log('✅ [BackgroundTask] Фоновая задача зарегистрирована');
    
    return true;
    
  } catch (error) {
    console.log('❌ [BackgroundTask] Не удалось зарегистрировать:', error);
    return false;
  }
}

// 3. Отмена задачи
export async function unregisterBackgroundTask() {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_WEATHER_TASK);
    console.log('✅ [BackgroundTask] Фоновая задача отменена');
    return true;
  } catch (error) {
    console.log('❌ [BackgroundTask] Не удалось отменить:', error);
    return false;
  }
}

// 4. Проверка зарегистрирована ли задача
export async function isBackgroundTaskRegistered() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
    return isRegistered;
  } catch (error) {
    console.log('❌ Ошибка проверки регистрации:', error);
    return false;
  }
}

// 5. Запуск задачи вручную (для тестирования)
export async function runBackgroundTaskNow() {
  console.log('🚀 Пытаемся запустить задачу вручную...');
  
  try {
    // BackgroundTask не имеет метода для немедленного запуска
    // Но можно попробовать через TaskManager (если доступно)
    console.log('⚠️ BackgroundTask не поддерживает немедленный запуск');
    console.log('ℹ️ Система запустит задачу автоматически');
    
    return false;
  } catch (error) {
    console.log('❌ Ошибка запуска:', error);
    return false;
  }
}

// 6. Получение статуса
export async function getBackgroundTaskStatus() {
  try {
    const status = await BackgroundTask.getStatusAsync();
    return status;
  } catch (error) {
    console.log('❌ Ошибка получения статуса:', error);
    return BackgroundTask.BackgroundTaskStatus.Restricted;
  }
}