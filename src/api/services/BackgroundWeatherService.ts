// src/api/BackgroundWeatherService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { WeatherNotificationService } from './WeatherNotificationService';

const TASK_NAME = 'pixel_weather_background_check';

console.log('=== 🎯 BackgroundWeatherService загружен ===');

/**
 * 🎯 ФОНОВАЯ ЗАДАЧА
 * ВЫЗЫВАЕТ СЕРВЕР, а не локальные уведомления!
 */
TaskManager.defineTask(TASK_NAME, async () => {
  console.log('🎯 [ФОН] Задача запущена:', new Date().toISOString());
  
  try {
    // 1. Получаем последнюю локацию
    const location = await WeatherNotificationService.getLastKnownLocation();
    
    if (!location) {
      console.log('📍 [ФОН] Нет сохраненной локации');
      return BackgroundTask.BackgroundTaskResult.Success;
    }
    
    console.log(`📍 [ФОН] Локация: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`);
    
    // 2. 🚨 ВЫЗЫВАЕМ СЕРВЕР (НЕ локальную проверку!)
    const success = await WeatherNotificationService.triggerServerWeatherCheck(
      location.lat,
      location.lon
    );
    
    console.log(`✅ [ФОН] Сервер ответил: ${success ? 'OK' : 'FAIL'}`);
    
    // 3. Сохраняем время последнего запуска
    await AsyncStorage.setItem('last_background_run', Date.now().toString());
    
    return BackgroundTask.BackgroundTaskResult.Success;
    
  } catch (error: any) {
    console.error('❌ [ФОН] Ошибка:', error.message);
    // Всегда возвращаем Success, чтобы не блокировать будущие запуски
    return BackgroundTask.BackgroundTaskResult.Success;
  }
});

/**
 * 📝 РЕГИСТРАЦИЯ ФОНОВОЙ ЗАДАЧИ
 */
export async function registerBackgroundTask() {
  console.log('🎯 Регистрация фоновой задачи...');
  
  try {
    // Проверяем доступность
    const status = await BackgroundTask.getStatusAsync();
    console.log('📊 Статус фоновых задач:', BackgroundTask.BackgroundTaskStatus[status]);
    
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      console.log('❌ Фоновые задачи недоступны');
      return false;
    }
    
    // Проверяем, зарегистрирована ли уже
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    
    if (!isRegistered) {
      console.log(`🔄 Регистрируем задачу "${TASK_NAME}" (интервал: 1 час)...`);
      
      await BackgroundTask.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 60, // 1 час в секундах
      });
      
      console.log('✅ Задача зарегистрирована');
      await AsyncStorage.setItem('background_task_registered', Date.now().toString());
    } else {
      console.log('ℹ️ Задача уже зарегистрирована');
    }
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Ошибка регистрации:', error.message);
    return false;
  }
}

/**
 * 🧪 РУЧНОЙ ЗАПУСК (для тестирования)
 */
export async function runBackgroundCheck() {
  console.log('🧪 Ручной запуск фоновой проверки...');
  
  try {
    // ✅ ПРАВИЛЬНЫЙ СПОСОБ: вызываем обработчик напрямую
    const task = TaskManager.getRegisteredTasksAsync()
      .then(tasks => {
        const taskExists = tasks.some(t => t.taskName === TASK_NAME);
        
        if (taskExists) {
          // Запускаем задачу через системный вызов
          // В expo-background-task нет прямого scheduleTaskAsync
          // Используем альтернативный подход - просто вызываем логику
          return WeatherNotificationService.triggerServerWeatherCheck(
            55.7558, // Москва (тестовые координаты)
            37.6173
          );
        }
        return false;
      });
    
    const result = await task;
    console.log(`✅ Ручная проверка: ${result ? 'OK' : 'FAIL'}`);
    return result;
    
  } catch (error: any) {
    console.error('❌ Ошибка ручного запуска:', error);
    return false;
  }
}

/**
 * 🔍 ПРОВЕРКА СТАТУСА
 */
export async function getBackgroundTaskStatus() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    const lastRun = await AsyncStorage.getItem('last_background_run');
    const status = await BackgroundTask.getStatusAsync();
    
    return {
      isRegistered,
      lastRun: lastRun ? new Date(parseInt(lastRun)).toLocaleString() : 'never',
      status: BackgroundTask.BackgroundTaskStatus[status],
      taskName: TASK_NAME
    };
  } catch (error) {
    return { error: String(error) };
  }
}