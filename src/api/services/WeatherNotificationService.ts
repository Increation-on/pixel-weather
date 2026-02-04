// src/api/services/WeatherNotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { WeatherData } from '@/src/types/open-meteo';
import { WeatherSnapshot } from '@/src/types/notifications';
import { detectWeatherChanges } from '@/src/utils/weatherDetector';
import { AppState } from 'react-native'

const STORAGE_KEY = 'last_weather_data';
const SETTINGS_KEY = 'notification_settings';
const PERMISSION_ASKED_KEY = 'notification_permission_asked';

// Настройки - ТОЛЬКО ВКЛ/ВЫКЛ
const DEFAULT_SETTINGS = {
  enabled: true,
};

// Конфигурация уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: Platform.OS === 'ios',
    shouldShowList: Platform.OS === 'ios',
  } as any),
});

export class WeatherNotificationService {
  static readonly DEFAULT_SETTINGS = DEFAULT_SETTINGS;

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
    oldSnapshot: WeatherSnapshot | null,
    newData: WeatherData
  ): Promise<string[]> {
    console.log('🔔 [checkAndNotify] === НОВАЯ ЛОГИКА ===');
    console.log('📱 AppState.currentState:', AppState.currentState);

    // === ВАЖНОЕ ИЗМЕНЕНИЕ 1: УБРАЛИ ПРОВЕРКУ НА ACTIVE ===
    // Раньше было: if (AppState.currentState === 'active') { return []; }
    // Теперь: всегда продолжаем, если уведомления включены
    if (AppState.currentState !== 'active') {
      console.log('📱 Приложение в фоне - проверка уведомлений');
      // Здесь можно добавить дополнительную логику для фонового режима
    }
    console.log('✅ Продолжаем проверку (независимо от AppState)');

    // 1. Настройки и разрешения
    const settings = await this.getSettings();
    if (!settings.enabled) {
      console.log('🔕 Уведомления выключены в настройках');
      return [];
    }

    // 2. Разрешения (только для не-Expo Go)
    if (!this.isExpoGo()) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('🔕 Нет разрешений на уведомления');
        await this.saveSettings({ enabled: false });
        return [];
      }
    }

    // 3. Если нет старых данных - сохраняем и выходим (самый первый запуск)
    if (!oldSnapshot) {
      console.log('📭 Самый первый запуск - сохраняем как основу');
      await this.saveLastWeather(newData);
      return []; // НЕТ уведомления при самом первом запуске
    }

    // 4. Проверяем возраст данных (3 часа максимум)
    const now = Date.now();
    const dataAge = now - oldSnapshot.timestamp;
    const MAX_AGE = 3 * 60 * 60 * 1000; // 3 часа

    if (dataAge > MAX_AGE) {
      console.log(`⏰ Данные устарели (${Math.round(dataAge / 3600000)}ч)`);
      console.log('🔄 Обновляем базу');
      await this.saveLastWeather(newData);
      return []; // НЕТ уведомления, просто обновили старые данные
    }

    // 5. Проверяем реальные изменения погоды
    console.log('🔍 Сравниваем погоду...');
    const changes = detectWeatherChanges(oldSnapshot, {
      weatherCode: newData.current.weatherCode,
      precipitation: newData.current.precipitation || 0,
      windSpeed: newData.current.windSpeed
    });

    // 6. ТОЛЬКО если есть изменения - уведомление
    if (changes.length > 0) {
      console.log('🎉 Обнаружены изменения погоды:', changes);

      // Сохраняем новые данные
      await this.saveLastWeather(newData);

      // Отправляем уведомление
      if (!this.isExpoGo()) {
        console.log('📱 Отправляем уведомление...');
        await this.showNotification(changes);
      } else {
        console.log('🤖 Expo Go: имитируем отправку уведомления');
      }

      return changes;
    } else {
      console.log('✅ Изменений нет - НЕ сохраняем данные');
      // НЕ сохраняем! timestamp остается старым
      return [];
    }
  }

  // Показать уведомление (упрощенное, без иконок)
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          ...(Platform.OS === 'android' && {
            color: '#4ecdc4',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }),
        },
        trigger: null,
      });

      console.log('✅ Уведомление отправлено');
    }
  }

  private static createNotificationBody(changes: string[]): string {
    if (changes.length === 0) return '';

    // Убираем эмодзи для чистого текста
    const cleanChanges = changes.map(change =>
      change.replace(/[☀️⛅☁️🌫️🌧️❄️💨💦🧊💥⚡💪🌊]/g, '').trim()
    );

    if (cleanChanges.length === 1) {
      return cleanChanges[0];
    }

    let body = 'Изменения погоды:\n';
    cleanChanges.forEach(change => {
      body += `• ${change}\n`;
    });

    return body.trim();
  }

  // Создать снимок
  private static createSnapshot(data: WeatherData): WeatherSnapshot {
    return {
      timestamp: Date.now(),
      temperature: data.current.temperature,
      precipitation: data.current.precipitation || 0,
      windSpeed: data.current.windSpeed,
      weatherCode: data.current.weatherCode,
    };
  }

  // Сохранить данные
  static async saveLastWeather(data: WeatherData) {
    try {
      const snapshot = this.createSnapshot(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      console.log('💾 Данные сохранены:', new Date(snapshot.timestamp).toLocaleTimeString());
    } catch (error) {
      console.error('Ошибка сохранения погоды:', error);
    }
  }

  // Получить сохраненные данные
  static async getLastSnapshot(): Promise<WeatherSnapshot | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
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
}