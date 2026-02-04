// src/api/services/BackgroundWeatherService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherNotificationService } from './WeatherNotificationService';
import { fetchWeather } from './../services/weatherService';
import { AppState } from 'react-native';

// Название задачи
const BACKGROUND_WEATHER_TASK = 'background-weather-check';

// Определяем задачу - нужно сделать через require чтобы избежать TS ошибок
export const defineBackgroundTask = () => {
  try {
    const TaskManager = require('expo-task-manager');
    const BackgroundTask = require('expo-background-task');
    
    TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
      console.log('🟢 [BackgroundTask] Задача запущена системой');
      
      await AsyncStorage.setItem('last_task_execution', JSON.stringify({
        timestamp: Date.now(),
        state: AppState.currentState,
        task: BACKGROUND_WEATHER_TASK,
        source: 'system-triggered'
      }));
      
      try {
        const savedLocation = await AsyncStorage.getItem('user_location');
        if (!savedLocation) {
          console.log('📍 [BackgroundTask] Нет сохраненной локации');
          return BackgroundTask.BackgroundTaskResult.Failed;
        }
        
        const { lat, lon } = JSON.parse(savedLocation);
        const newData = await fetchWeather(lat, lon);
        const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
        
        await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
        
        console.log('✅ [BackgroundTask] Задача выполнена успешно');
        return BackgroundTask.BackgroundTaskResult.Success;
        
      } catch (error: any) {
        console.error('🔴 [BackgroundTask] Ошибка:', error);
        
        await AsyncStorage.setItem('task_error', JSON.stringify({
          timestamp: Date.now(),
          error: error.message,
          task: BACKGROUND_WEATHER_TASK,
          source: 'system-triggered'
        }));
        
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    });
    
    console.log('✅ Фоновая задача определена');
    return true;
  } catch (error: any) {
    console.log('❌ Ошибка определения задачи:', error.message);
    return false;
  }
};

// Определяем задачу при загрузке модуля
defineBackgroundTask();

// Основная функция регистрации
export async function registerBackgroundTask() {
  try {
    console.log('🎯 [registerBackgroundTask] Начинаем регистрацию...');
    
    const BackgroundTask = require('expo-background-task');
    
    // Пробуем получить статус
    let status;
    try {
      status = await (BackgroundTask as any).getStatusAsync();
      console.log('🎯 Статус BackgroundTask получен:', status);
    } catch (statusError: any) {
      console.log('🎯 Не удалось получить статус:', statusError.message);
      status = null;
    }
    
    // Если статус доступен - регистрируем
    if (status === 0) { // Available код из документации
      console.log('🎯 BackgroundTask доступен, регистрируем...');
      
      await (BackgroundTask as any).registerTaskAsync(BACKGROUND_WEATHER_TASK, {
        minimumInterval: 15, // 15 минут
      });
      
      console.log('✅ Задача успешно зарегистрирована');
      return true;
    } 
    // Если статус не получен
    else {
      console.log('⚠️ Статус BackgroundTask:', status);
      
      // Пробуем все равно зарегистрировать
      try {
        await (BackgroundTask as any).registerTaskAsync(BACKGROUND_WEATHER_TASK, {
          minimumInterval: 15,
        });
        console.log('✅ Задача зарегистрирована (без проверки статуса)');
        return true;
      } catch (finalError: any) {
        console.log('❌ Финальная ошибка регистрации:', finalError.message);
        return false;
      }
    }
    
  } catch (error: any) {
    console.log('🔴 Критическая ошибка в registerBackgroundTask:', error.message);
    return false;
  }
}

// Простая функция для тестирования
export async function testBackgroundTask() {
  console.log('🧪 Тестируем BackgroundTask вручную...');
  
  try {
    const savedLocation = await AsyncStorage.getItem('user_location');
    if (!savedLocation) {
      console.log('📍 Нет локации для теста');
      return false;
    }
    
    const { lat, lon } = JSON.parse(savedLocation);
    const newData = await fetchWeather(lat, lon);
    const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
    
    await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
    
    console.log('✅ Тест выполнен');
    return true;
  } catch (error: any) {
    console.log('❌ Ошибка теста:', error.message);
    return false;
  }
}

// Проверка регистрации
export async function isBackgroundTaskRegistered() {
  try {
    const TaskManager = require('expo-task-manager');
    return await (TaskManager as any).isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
  } catch {
    return false;
  }
}

// Отмена задачи
export async function unregisterBackgroundTask() {
  try {
    const BackgroundTask = require('expo-background-task');
    await (BackgroundTask as any).unregisterTaskAsync(BACKGROUND_WEATHER_TASK);
    return true;
  } catch {
    return false;
  }
}