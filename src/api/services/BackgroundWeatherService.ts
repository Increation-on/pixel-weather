// src/services/BackgroundWeatherService.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherNotificationService } from './WeatherNotificationService';
import { fetchWeather } from './../services/weatherService';

// Название задачи
const BACKGROUND_WEATHER_TASK = 'background-weather-check';

// Определяем задачу
TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
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
    const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
    
    console.log(`✅ [Background] Проверка завершена. Изменений: ${changes.length}`);
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ [Background] Ошибка:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Регистрация задачи
export async function registerBackgroundTask() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_WEATHER_TASK, {
      minimumInterval: 30 * 60, // 30 минут (в секундах)
      stopOnTerminate: false,   // Продолжать при закрытии приложения
      startOnBoot: true,        // Запускать при загрузке устройства
    });
    console.log('✅ Фоновая задача зарегистрирована');
    return true;
  } catch (error) {
    console.log('❌ Не удалось зарегистрировать фоновую задачу:', error);
    return false;
  }
}

// Отмена задачи
export async function unregisterBackgroundTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_WEATHER_TASK);
    console.log('✅ Фоновая задача отменена');
    return true;
  } catch (error) {
    console.log('❌ Не удалось отменить фоновую задачу:', error);
    return false;
  }
}

// Проверка зарегистрирована ли задача
export async function isBackgroundTaskRegistered() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEATHER_TASK);
  return isRegistered;
}