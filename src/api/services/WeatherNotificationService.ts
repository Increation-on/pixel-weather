import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { WeatherData } from '@/src/types/open-meteo';
import { WeatherSnapshot } from '@/src/types/notifications';
import { detectWeatherChanges } from '@/src/utils/weatherDetector';
import { AppState } from 'react-native'

const SETTINGS_KEY = 'notification_settings';
const PERMISSION_ASKED_KEY = 'notification_permission_asked';

// Настройки - ТОЛЬКО ВКЛ/ВЫКЛ
const DEFAULT_SETTINGS = {
  enabled: true,
};

// Конфигурация уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  } as any),
});

export class WeatherNotificationService {
  static readonly DEFAULT_SETTINGS = DEFAULT_SETTINGS;

  // Ключ для хранения данных с координатами
  static getStorageKey(lat: number, lon: number): string {
    // Округляем до 3 знаков (~110 метров точности)
    const latKey = lat.toFixed(3);
    const lonKey = lon.toFixed(3);
    return `weather_data_${latKey}_${lonKey}`;
  }

  // Проверяем, используем ли Expo Go
  static isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  }

  // Инициализация при запуске приложения
  static async initialize() {
    // Настраиваем канал для Android (только не в Expo Go)
    if (Platform.OS === 'android' && !this.isExpoGo()) {
      await Notifications.setNotificationChannelAsync('weather', {
        name: 'Weather Updates',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ecdc4',
      });
    }

    // Проверяем, запрашивали ли уже разрешения
    const hasAsked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
    if (!hasAsked) {
      console.log('🔄 Первый запуск - проверяем разрешения на уведомления');
      await this.requestPermissions();
    }
  }

  // Запрос разрешений
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔔 Запрашиваем разрешения на уведомления...');

      // Помечаем, что уже спрашивали
      await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');

      // В Expo Go всегда возвращаем true для тестирования
      if (this.isExpoGo()) {
        console.log('📱 Expo Go: имитируем разрешение для тестирования');
        return true;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('🔄 Разрешение не предоставлено, запрашиваем...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('🔕 Разрешение на уведомления не предоставлено');
        // Если разрешение не дано, выключаем уведомления в настройки
        await this.saveSettings({ enabled: false });
        return false;
      }

      console.log('✅ Разрешение на уведомления получено');
      return true;
    } catch (error) {
      console.error('Ошибка при запросе разрешений:', error);
      await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
      return false;
    }
  }

  // Основной метод: проверяем изменения и отправляем уведомления
  static async checkAndNotify(
    lat: number,
    lon: number,
    oldSnapshot: WeatherSnapshot | null,
    newData: WeatherData
  ): Promise<string[]> {
    console.log('='.repeat(50));
    console.log('🔔 [checkAndNotify] Проверка для локации:', lat.toFixed(4), lon.toFixed(4));
    console.log('📍 Координаты запроса:', lat, lon);
    
    if (oldSnapshot) {
      console.log('📍 Координаты старых данных:', oldSnapshot.lat, oldSnapshot.lon);
      
      // Проверяем, изменилась ли локация (точность 0.01 ≈ 1.1 км)
      const locationChanged = 
        Math.abs(oldSnapshot.lat - lat) > 0.01 || 
        Math.abs(oldSnapshot.lon - lon) > 0.01;
      
      if (locationChanged) {
        console.log('🌍 ЛОКАЦИЯ ИЗМЕНИЛАСЬ! Не сравниваем разные города');
        console.log('💾 Сохраняем новые данные для новой локации');
        await this.saveLastWeather(lat, lon, newData);
        console.log('🚫 Уведомление НЕ отправляем (смена локации)');
        console.log('='.repeat(50));
        return [];
      }
    }

    console.log('📱 AppState:', AppState.currentState);
    console.log('📊 oldSnapshot есть?:', oldSnapshot ? '✅ ДА' : '❌ НЕТ');
    
    // 1. Если нет старых данных - сохраняем и выходим (самый первый запуск для этой локации)
    if (!oldSnapshot) {
      console.log('📭 Первый запуск для этой локации!');
      console.log('💾 Сохраняем как основу для будущих сравнений...');
      await this.saveLastWeather(lat, lon, newData);
      console.log('🚫 Уведомление НЕ отправляем (первый запуск для локации)');
      console.log('='.repeat(50));
      return [];
    }

    // 2. Настройки и разрешения
    const settings = await this.getSettings();
    if (!settings.enabled) {
      console.log('🔕 Уведомления выключены в настройках');
      console.log('='.repeat(50));
      return [];
    }

    // 3. Разрешения (только для не-Expo Go)
    if (!this.isExpoGo()) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('🔕 Нет разрешений на уведомления');
        await this.saveSettings({ enabled: false });
        console.log('='.repeat(50));
        return [];
      }
    }

    // 4. Проверяем возраст данных (3 часа максимум)
    const now = Date.now();
    const dataAge = now - oldSnapshot.timestamp;
    const MAX_AGE = 3 * 60 * 60 * 1000; // 3 часа

    if (dataAge > MAX_AGE) {
      console.log(`⏰ Данные устарели (${Math.round(dataAge / 3600000)}ч)`);
      console.log('🔄 Обновляем базу, уведомление НЕ отправляем');
      await this.saveLastWeather(lat, lon, newData);
      console.log('='.repeat(50));
      return [];
    }

    // 5. Проверяем реальные изменения погоды
    console.log('🔍 Сравниваем погоду...');
    
    console.log('📊 Старые данные:', {
      precipitation: oldSnapshot.precipitation,
      temperature: oldSnapshot.temperature,
      weatherCode: oldSnapshot.weatherCode,
      windSpeed: oldSnapshot.windSpeed,
      timestamp: new Date(oldSnapshot.timestamp).toLocaleTimeString()
    });
    
    console.log('📊 Новые данные:', {
      precipitation: newData.current.precipitation || 0,
      temperature: newData.current.temperature,
      weatherCode: newData.current.weatherCode,
      windSpeed: newData.current.windSpeed
    });
    
    // 6. Проверка на нереальные быстрые изменения (защита от глюков API)
    const isUnrealisticChange = 
      Math.abs(newData.current.temperature - oldSnapshot.temperature) > 5 && 
      dataAge < 60000; // 1 минута
    
    if (isUnrealisticChange) {
      console.log('🤔 НЕРЕАЛЬНОЕ изменение температуры за короткое время!');
      console.log('🚫 Игнорируем, вероятно глюк API');
      console.log('='.repeat(50));
      return [];
    }
    
    // Подготавливаем данные для детектора
    const oldDataForDetector = {
      weatherCode: oldSnapshot.weatherCode,
      precipitation: oldSnapshot.precipitation,
      windSpeed: oldSnapshot.windSpeed,
      temperature: oldSnapshot.temperature
    };
    
    const newDataForDetector = {
      weatherCode: newData.current.weatherCode,
      precipitation: newData.current.precipitation || 0,
      windSpeed: newData.current.windSpeed,
      temperature: newData.current.temperature
    };
    
    const changes = detectWeatherChanges(oldDataForDetector, newDataForDetector);

    // 7. ТОЛЬКО если есть изменения - уведомление
    if (changes.length > 0) {
      console.log('🎉 Обнаружены изменения погоды:', changes.length, 'изменений');
      console.log('📝 Изменения:', changes);

      // Сохраняем новые данные
      await this.saveLastWeather(lat, lon, newData);

      // Отправляем уведомление
      if (!this.isExpoGo()) {
        console.log('📱 Отправляем уведомление...');
        await this.showNotification(changes);
        console.log('✅ Уведомление отправлено!');
      } else {
        console.log('🤖 Expo Go: имитируем отправку уведомления');
      }
      
      console.log('='.repeat(50));
      return changes;
    } else {
      console.log('✅ Изменений нет - НЕ сохраняем данные');
      // НЕ сохраняем! timestamp остается старым
      console.log('🚫 Уведомление НЕ отправляем (нет изменений)');
      console.log('='.repeat(50));
      return [];
    }
  }

  // Показать уведомление
  private static async showNotification(changes: string[]) {
    if (changes.length === 0) return;

    const title = 'PIXEL WEATHER';
    const body = this.createNotificationBody(changes);

    console.log('='.repeat(50));
    console.log('📱 ОТПРАВКА УВЕДОМЛЕНИЯ:');
    console.log('📌 Заголовок:', title);
    console.log('📝 Текст:', body);
    console.log('='.repeat(50));

    if (!this.isExpoGo()) {
      try {
        const notificationConfig = {
          title,
          body,
          sound: true,
        };

        await Notifications.scheduleNotificationAsync({
          content: notificationConfig,
          trigger: null,
        });

        console.log('✅ Уведомление отправлено');
      } catch (error) {
        console.error('❌ Ошибка отправки уведомления:', error);
      }
    } else {
      console.log('🤖 Expo Go: имитируем отправку уведомления');
    }
  }

  private static createNotificationBody(changes: string[]): string {
    if (changes.length === 0) return '';

    if (changes.length === 1) {
      return changes[0];
    }

    let body = 'Изменения погоды:\n';
    changes.forEach((change, index) => {
      body += `${index + 1}. ${change}\n`;
    });

    return body.trim();
  }

  // Создать снимок
  private static createSnapshot(lat: number, lon: number, data: WeatherData): WeatherSnapshot {
    return {
      timestamp: Date.now(),
      temperature: data.current.temperature,
      precipitation: data.current.precipitation || 0,
      windSpeed: data.current.windSpeed,
      weatherCode: data.current.weatherCode,
      lat,
      lon,
    };
  }

  // Сохранить данные ДЛЯ КОНКРЕТНОЙ ЛОКАЦИИ
  static async saveLastWeather(lat: number, lon: number, data: WeatherData) {
    try {
      const key = this.getStorageKey(lat, lon);
      const snapshot = this.createSnapshot(lat, lon, data);
      await AsyncStorage.setItem(key, JSON.stringify(snapshot));
      console.log('💾 Данные сохранены для локации:', lat.toFixed(4), lon.toFixed(4));
      console.log('⏰ Время:', new Date(snapshot.timestamp).toLocaleTimeString());
    } catch (error) {
      console.error('Ошибка сохранения погоды:', error);
    }
  }

  // Получить сохраненные данные ДЛЯ КОНКРЕТНОЙ ЛОКАЦИИ
  static async getLastSnapshot(lat: number, lon: number): Promise<WeatherSnapshot | null> {
    try {
      const key = this.getStorageKey(lat, lon);
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const parsed = JSON.parse(data);
        console.log('✅ Данные найдены для локации:', lat.toFixed(4), lon.toFixed(4));
        return parsed;
      } else {
        console.log('❌ Нет данных для локации:', lat.toFixed(4), lon.toFixed(4));
        return null;
      }
      
    } catch (error) {
      console.error('Ошибка загрузки погоды:', error);
      return null;
    }
  }

  // Настройки
  static async getSettings(): Promise<{ enabled: boolean }> {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<{ enabled: boolean }>) {
    try {
      const current = await this.getSettings();
      const newSettings = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      console.log('💾 Настройки сохранены:', newSettings);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  }

  // Простая проверка
  static async areNotificationsEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled;
  }

  // Проверить статус разрешений
  static async getPermissionStatus(): Promise<string> {
    if (this.isExpoGo()) {
      return 'granted'; // Для Expo Go всегда granted для тестирования
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Отправить тестовое уведомление
  static async sendTestNotification(): Promise<boolean> {
    console.log('🧪 Отправка тестового уведомления...');
    
    try {
      if (!this.isExpoGo()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'PIXEL WEATHER - ТЕСТ',
            body: '✅ Уведомления работают!\nЭто тестовое сообщение.',
            sound: true,
          },
          trigger: null,
        });
        
        console.log('✅ Тестовое уведомление отправлено');
        return true;
      } else {
        console.log('🤖 Expo Go: тестовое уведомление сымитировано');
        return true;
      }
    } catch (error) {
      console.error('❌ Ошибка отправки тестового уведомления:', error);
      return false;
    }
  }

  // 📌 МЕТОД ДЛЯ ФОНОВОЙ ЗАДАЧИ:
  static async processBackgroundWeatherCheck(): Promise<boolean> {
    console.log('🌙 [processBackgroundWeatherCheck] СТАРТ фоновой проверки');
    console.log('⏰ Время начала:', new Date().toLocaleTimeString());
    
    try {
      // 1. Получаем сохраненные координаты
      console.log('📋 Шаг 1: Получаю сохраненные координаты...');
      const locationStr = await AsyncStorage.getItem('user_location');
      
      if (!locationStr) {
        console.log('❌ Нет сохраненных координат для фоновой проверки');
        return false;
      }
      
      const location = JSON.parse(locationStr);
      console.log('📍 Координаты из хранилища:', location.lat, location.lon);
      
      // 2. Запрашиваем погоду
      console.log('📡 Шаг 2: Запрашиваю погоду через API...');
      const weatherModule = require('./weatherService');
      
      let newData;
      try {
        newData = await weatherModule.fetchWeather(location.lat, location.lon);
        console.log('✅ Погода получена в фоне');
        console.log('🌡️ Температура:', newData.current.temperature);
        console.log('☁️  Код погоды:', newData.current.weatherCode);
        console.log('💧 Осадки:', newData.current.precipitation || 0);
        console.log('💨 Ветер:', newData.current.windSpeed);
      } catch (apiError) {
        console.error('❌ Ошибка API в фоне:', apiError);
        return false;
      }
      
      // 3. Получаем старые данные
      console.log('📂 Шаг 3: Ищу старые данные для локации...');
      const oldSnapshot = await this.getLastSnapshot(location.lat, location.lon);
      
      if (oldSnapshot) {
        console.log('✅ Старые данные найдены');
        console.log('📅 Сохранены:', new Date(oldSnapshot.timestamp).toLocaleTimeString());
        console.log('🌡️ Было:', oldSnapshot.temperature, '°C');
        console.log('☁️  Было код:', oldSnapshot.weatherCode);
        console.log('⏱️ Возраст данных:', Date.now() - oldSnapshot.timestamp, 'мс');
      } else {
        console.log('📭 Нет старых данных для этой локации (первая фоновая проверка)');
      }
      
      // 4. Проверяем изменения
      console.log('🔔 Шаг 4: Вызываю checkAndNotify...');
      const changes = await this.checkAndNotify(location.lat, location.lon, oldSnapshot, newData);
      
      console.log('🎯 ИТОГ фоновой проверки:');
      console.log('📊 Изменений найдено:', changes.length);
      
      if (changes.length > 0) {
        console.log('✅ Есть изменения!');
        changes.forEach((change, i) => {
          console.log(`  ${i + 1}. ${change}`);
        });
      } else {
        console.log('🤔 Изменений нет');
        
        // Логируем почему нет изменений
        if (!oldSnapshot) {
          console.log('   • Причина: Нет старых данных для сравнения');
        } else if (!this.areNotificationsEnabled) {
          console.log('   • Причина: Уведомления выключены');
        } else {
          console.log('   • Причина: Погода не изменилась');
        }
      }
      
      return changes.length > 0;
      
    } catch (error) {
      console.error('❌ КРИТИЧЕСКАЯ ошибка фоновой проверки:', error);
      return false;
    }
  }
}