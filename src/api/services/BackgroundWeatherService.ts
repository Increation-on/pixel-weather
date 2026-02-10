import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { WeatherNotificationService } from './WeatherNotificationService';

// Имя задачи
const TASK_NAME = 'background-weather-check';

console.log('=== DEBUG: Файл BackgroundWeatherService загружен ===');

// Определение задачи с поддержкой FCM
TaskManager.defineTask(TASK_NAME, async () => {
  console.log('🎯 [BACKGROUND TASK] Система запустила задачу:', new Date().toISOString());
  console.log('=== DEBUG: Задача "background-weather-check" ВЫЗВАНА ===');
  
  await AsyncStorage.setItem('DEBUG_TASK_CALLED', Date.now().toString());
  
  try {
    // Запускаем улучшенную версию с FCM
    const result = await runEnhancedBackgroundCheck();
    
    console.log('✅ Фоновая задача выполнена с результатом:', result);
    return BackgroundTask.BackgroundTaskResult.Success;
    
  } catch (error: any) {
    console.error('❌ Задача упала с ошибкой:', error.message);
    // Всегда возвращаем Success, чтобы система не блокировала будущие запуски
    return BackgroundTask.BackgroundTaskResult.Success;
  }
});

// Улучшенная фоновая проверка с FCM
async function runEnhancedBackgroundCheck(): Promise<boolean> {
  console.log('🌙 [runEnhancedBackgroundCheck] Запуск улучшенной проверки');
  
  try {
    // 1. Получаем FCM токен
    const fcmToken = await AsyncStorage.getItem('fcm_token');
    const hasFCM = !!fcmToken;
    
    console.log(`🔑 FCM доступен: ${hasFCM ? '✅ Да' : '❌ Нет'}`);
    
    // 2. Выполняем проверку погоды
    console.log('🌡️ Выполняю проверку погоды...');
    const weatherChanged = await WeatherNotificationService.processBackgroundWeatherCheck();
    
    console.log(`📊 Изменения погоды: ${weatherChanged ? '✅ Да' : '❌ Нет'}`);
    
    // 3. Если есть FCM и изменения - отправляем пуш
    if (hasFCM && weatherChanged && fcmToken) {
      console.log('📡 Отправляю push-уведомление через сервер...');
      
      try {
        // Получаем информацию о локации
        const locationStr = await AsyncStorage.getItem('user_location');
        let locationData = null;
        
        if (locationStr) {
          locationData = JSON.parse(locationStr);
        }
        
        // Подготавливаем данные для пуша
        const pushData = {
          fcmToken: fcmToken,
          title: '🌤️ PIXEL WEATHER',
          body: 'Погода изменилась!',
          data: {
            type: 'weather_change',
            timestamp: new Date().toISOString(),
            source: 'background_task',
            location: locationData,
            task_id: Date.now().toString()
          }
        };
        
        // Отправляем запрос на наш сервер
        const response = await fetch(
          'https://pixel-weather-server.vercel.app/api/send-test',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushData),
          }
        );
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Push-уведомление успешно отправлено через сервер');
          console.log('📊 ID сообщения:', result.messageId);
          
          // Сохраняем информацию об отправке
          await AsyncStorage.setItem(
            'last_push_sent',
            JSON.stringify({
              timestamp: Date.now(),
              messageId: result.messageId,
              weatherChanged: true
            })
          );
        } else {
          console.log('❌ Ошибка отправки push:', result.error);
        }
      } catch (pushError: any) {
        console.error('❌ Ошибка при отправке push:', pushError.message);
      }
    } else if (!hasFCM) {
      console.log('ℹ️ FCM токен не найден, push не отправляется');
    } else if (!weatherChanged) {
      console.log('ℹ️ Изменений погоды нет, push не отправляется');
    }
    
    // 4. Сохраняем результат выполнения
    await saveExecutionResult(weatherChanged, hasFCM);
    
    return weatherChanged;
    
  } catch (error: any) {
    console.error('❌ Ошибка в улучшенной проверке:', error.message);
    
    // Сохраняем информацию об ошибке
    await AsyncStorage.setItem(
      'background_task_last_error',
      JSON.stringify({
        timestamp: Date.now(),
        error: error.message,
        hasFCM: !!(await AsyncStorage.getItem('fcm_token'))
      })
    );
    
    return false;
  }
}

// Сохранение результата выполнения
async function saveExecutionResult(weatherChanged: boolean, hasFCM: boolean) {
  try {
    const executionData = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      type: 'enhanced_background_check',
      weatherChanged,
      hasFCM,
      platform: 'android/ios' // Можно определить через Platform.OS если передать
    };
    
    // Получаем текущие логи
    const existingLogs = await AsyncStorage.getItem('enhanced_background_logs') || '[]';
    const logsArray = JSON.parse(existingLogs);
    
    // Добавляем новую запись
    logsArray.unshift(executionData);
    
    // Сохраняем (максимум 50 записей)
    await AsyncStorage.setItem(
      'enhanced_background_logs',
      JSON.stringify(logsArray.slice(0, 50))
    );
    
    // Сохраняем время последнего выполнения
    await AsyncStorage.setItem(
      'last_enhanced_background_execution',
      Date.now().toString()
    );
    
    console.log('💾 Результат выполнения сохранен');
    
  } catch (error) {
    console.error('❌ Ошибка сохранения результата:', error);
  }
}

// Регистрация задачи
export async function registerBackgroundTask() {
  console.log('🎯 [registerBackgroundTask] Начинаем регистрацию...');
  
  try {
    // 1. Проверяем доступность
    const status = await BackgroundTask.getStatusAsync();
    console.log('📊 Статус фоновых задач:', BackgroundTask.BackgroundTaskStatus[status]);
    
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      console.log('❌ Фоновые задачи недоступны на этом устройстве');
      return false;
    }
    
    // 2. Проверяем, зарегистрирована ли уже задача
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    
    if (!isRegistered) {
      // 3. Регистрируем задачу
      console.log(`🔄 Регистрируем задачу "${TASK_NAME}"...`);
      
      await BackgroundTask.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 60, // 1 час
      });
      
      console.log('✅ Задача зарегистрирована успешно');
      
      // Сохраняем время регистрации
      await AsyncStorage.setItem('background_task_registered', Date.now().toString());
    } else {
      console.log('ℹ️ Задача уже была зарегистрирована ранее');
    }
    
    return true;
    
  } catch (error: any) {
    console.log('❌ Ошибка регистрации задачи:', error.message);
    return false;
  }
}

// Проверка статуса задачи
export async function checkBackgroundTaskStatus() {
  try {
    // Проверяем, зарегистрирована ли задача
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    
    // Получаем данные из AsyncStorage
    const [
      lastExec,
      enhancedLogsJson,
      fcmToken,
      lastPushSent
    ] = await AsyncStorage.multiGet([
      'last_enhanced_background_execution',
      'enhanced_background_logs',
      'fcm_token',
      'last_push_sent'
    ]);
    
    const enhancedLogs = enhancedLogsJson[1] ? JSON.parse(enhancedLogsJson[1]) : [];
    
    // Статистика
    let stats = {
      totalExecutions: enhancedLogs.length,
      weatherChanges: 0,
      pushesSent: 0
    };
    
    if (enhancedLogs.length > 0) {
      stats.weatherChanges = enhancedLogs.filter((log: any) => log.weatherChanged).length;
      stats.pushesSent = enhancedLogs.filter((log: any) => log.weatherChanged && log.hasFCM).length;
    }
    
    return {
      taskName: TASK_NAME,
      isRegistered,
      hasFCM: !!fcmToken[1],
      fcmTokenShort: fcmToken[1] ? `${fcmToken[1].substring(0, 20)}...` : 'Нет',
      lastExecuted: lastExec[1] ? new Date(parseInt(lastExec[1])).toLocaleString('ru-RU') : 'Никогда',
      lastPush: lastPushSent[1] ? JSON.parse(lastPushSent[1]) : null,
      stats: stats,
      recentExecutions: enhancedLogs.slice(0, 5)
    };
    
  } catch (error: any) {
    console.log('❌ Ошибка проверки статуса:', error.message);
    return null;
  }
}

// Запуск фоновой проверки вручную (для тестирования)
export async function runBackgroundCheck() {
  console.log('🧪 [runBackgroundCheck] Ручной запуск фоновой проверки...');
  
  try {
    // 1. Проверяем, зарегистрирована ли задача
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    
    if (!isRegistered) {
      console.log('⚠️ Задача не зарегистрирована. Регистрируем...');
      await registerBackgroundTask();
    }
    
    // 2. Запускаем улучшенную проверку
    const result = await runEnhancedBackgroundCheck();
    
    console.log('✅ Ручная проверка завершена. Изменения:', result ? '✅ ДА' : '❌ НЕТ');
    return result;
    
  } catch (error: any) {
    console.error('❌ Ошибка ручной проверки:', error);
    return false;
  }
}

// Проверить результаты последней фоновой задачи
export async function checkLastBackgroundResult() {
  try {
    console.log('🔍 Проверка результатов последней фоновой задачи...');
    
    const [
      lastExec,
      lastEnhancedExec,
      fcmToken,
      enhancedLogsJson,
      lastPushSent
    ] = await AsyncStorage.multiGet([
      'last_background_execution',
      'last_enhanced_background_execution',
      'fcm_token',
      'enhanced_background_logs',
      'last_push_sent'
    ]);
    
    console.log('='.repeat(50));
    console.log('📊 СТАТУС ФОНОВЫХ ЗАДАЧ С FCM');
    console.log('='.repeat(50));
    
    // FCM статус
    if (fcmToken[1]) {
      console.log(`🔑 FCM токен: ${fcmToken[1].substring(0, 30)}...`);
    } else {
      console.log('🔑 FCM токен: ❌ НЕ НАЙДЕН');
    }
    
    // Время последнего выполнения
    if (lastEnhancedExec[1]) {
      const execTime = new Date(parseInt(lastEnhancedExec[1])).toLocaleString('ru-RU');
      console.log(`🔄 Последняя улучшенная задача: ${execTime}`);
    }
    
    // Статистика
    if (enhancedLogsJson[1]) {
      const logs = JSON.parse(enhancedLogsJson[1]);
      console.log(`📈 Всего выполнений: ${logs.length}`);
      
      const changesFound = logs.filter((log: any) => log.weatherChanged).length;
      const pushesPossible = logs.filter((log: any) => log.weatherChanged && log.hasFCM).length;
      
      console.log(`🌤️  С изменениями погоды: ${changesFound}`);
      console.log(`📨  Возможных push-уведомлений: ${pushesPossible}`);
    }
    
    // Последний отправленный пуш
    if (lastPushSent[1]) {
      const pushData = JSON.parse(lastPushSent[1]);
      const pushTime = new Date(pushData.timestamp).toLocaleTimeString();
      console.log(`📤 Последний пуш отправлен: ${pushTime}`);
    }
    
    console.log('='.repeat(50));
    
    return {
      hasFCM: !!fcmToken[1],
      lastEnhancedExecution: lastEnhancedExec[1],
      totalExecutions: enhancedLogsJson[1] ? JSON.parse(enhancedLogsJson[1]).length : 0,
      lastPush: lastPushSent[1] ? JSON.parse(lastPushSent[1]) : null
    };
    
  } catch (error) {
    console.error('❌ Ошибка проверки результатов:', error);
    return null;
  }
}

// Очистка логов
export async function clearBackgroundLogs() {
  try {
    await AsyncStorage.multiRemove([
      'last_background_execution',
      'background_task_logs',
      'last_background_result',
      'background_task_registered',
      'background_task_started',
      'background_task_last_success',
      'background_task_last_error',
      'last_enhanced_background_execution',
      'enhanced_background_logs',
      'last_push_sent',
      'fcm_token' // Осторожно! Это удалит FCM токен
    ]);
    
    console.log('✅ Логи фоновых задач очищены');
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка очистки логов:', error);
    return false;
  }
}

// Получить FCM токен (удобный метод)
export async function getFCMToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('fcm_token');
  } catch (error) {
    console.error('❌ Ошибка получения FCM токена:', error);
    return null;
  }
}

// Тест отправки push-уведомления
export async function testPushNotification(customMessage?: string): Promise<boolean> {
  try {
    console.log('🧪 Тест отправки push-уведомления...');
    
    const fcmToken = await AsyncStorage.getItem('fcm_token');
    
    if (!fcmToken) {
      console.log('❌ Нет FCM токена для теста');
      return false;
    }
    
    const response = await fetch(
      'https://pixel-weather-server.vercel.app/api/send-test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fcmToken: fcmToken,
          title: 'PIXEL WEATHER - ТЕСТ',
          body: customMessage || '✅ Push-уведомления работают!',
          data: {
            type: 'test',
            timestamp: new Date().toISOString(),
            test: true
          }
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Тестовый push успешно отправлен');
      console.log('📊 ID сообщения:', data.messageId);
      return true;
    } else {
      console.log('❌ Ошибка отправки тестового push:', data.error);
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Ошибка теста push:', error.message);
    return false;
  }
}