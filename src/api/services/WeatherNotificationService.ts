// src/api/services/WeatherNotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { WeatherData } from '@/src/types/open-meteo';
import { WeatherSnapshot } from '@/src/types/notifications';

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
        // Если разрешение не дано, выключаем уведомления в настройках
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
    // 1. Получаем настройки
    const settings = await this.getSettings();

    // 2. Если уведомления выключены - выходим
    if (!settings.enabled) {
      console.log('🔕 Уведомления выключены в настройках');
      return [];
    }

    // 3. Проверяем разрешения (только не в Expo Go)
    if (!this.isExpoGo()) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('🔕 Нет разрешений на уведомления');
        await this.saveSettings({ enabled: false });
        return [];
      }
    }

    // 4. Если нет старых данных - просто сохраняем новые
    if (!oldSnapshot) {
      console.log('📭 Первый запуск - нет данных для сравнения');
      return [];
    }

    // 5. Проверяем изменения
    const changes = this.detectChanges(oldSnapshot, newData);

    // 6. Если есть изменения - показываем уведомление
    if (changes.length > 0) {
      console.log('🔔 Обнаружены изменения погоды:');
      changes.forEach(change => console.log(`  • ${change}`));
      
      // Только если не в Expo Go отправляем реальные уведомления
      if (!this.isExpoGo()) {
        await this.showNotification(changes);
      } else {
        console.log('📱 Expo Go: push-уведомления недоступны');
        console.log('🔧 Используйте Development Build для тестирования');
      }
    } else {
      console.log('✅ Изменений погоды не обнаружено');
    }

    // 7. Возвращаем изменения для логов
    return changes;
  }

  // Детектор изменений (публичный для тестов)
  static detectChanges(oldSnapshot: WeatherSnapshot, newData: WeatherData): string[] {
    const changes: string[] = [];

    // 1. Температура изменилась?
    const tempDiff = newData.current.temperature - oldSnapshot.temperature;
    if (Math.abs(tempDiff) > 0.1) {
      const direction = tempDiff > 0 ? '↑' : '↓';
      changes.push(`🌡️ Температура ${direction} на ${Math.abs(tempDiff).toFixed(1)}°C`);
    }

    // 2. Осадки изменились?
    const oldPrecip = oldSnapshot.precipitation > 0;
    const newPrecip = (newData.current.precipitation || 0) > 0;

    if (oldPrecip && !newPrecip) {
      changes.push('⛅ Осадки прекратились');
    } else if (!oldPrecip && newPrecip) {
      changes.push('🌧️ Начались осадки');
    }

    // 3. Экстремальные условия?
    const extremeConditions = this.checkExtremeConditions(newData);
    if (extremeConditions.length > 0) {
      changes.push(...extremeConditions);
    }

    return changes;
  }

  // Проверка экстремальных условий
  private static checkExtremeConditions(data: WeatherData): string[] {
    const alerts: string[] = [];

    // Гроза
    if (data.current.weatherCode >= 95) {
      alerts.push('⚡ Гроза');
    }

    // Очень сильный ветер
    if (data.current.windSpeed > 20) {
      alerts.push('💨 Сильный ветер');
    }

    return alerts;
  }

  // Показать уведомление
  private static async showNotification(changes: string[]) {
    if (changes.length === 0) return;

    // Пиксельный стиль для заголовка
    const title = '🌤️ PIXEL WEATHER';
    
    // Пиксельный стиль для тела
    const body = this.createPixelNotificationBody(changes);
    
    console.log('='.repeat(50));
    console.log('🎮 ПИКСЕЛЬНОЕ PUSH-УВЕДОМЛЕНИЕ');
    console.log('='.repeat(50));
    console.log(`📱 Заголовок: ${title}`);
    console.log(`📝 Текст: ${body}`);
    console.log('='.repeat(50));

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
            // Android стилизация
            ...(Platform.OS === 'android' && {
                color: '#4ecdc4', // Акцентный цвет из темы
                // Можно добавить большую иконку позже
                // largeIcon: require('@/assets/icons/weather-large.png'),
            }),
            // iOS
            ...(Platform.OS === 'ios' && { 
                categoryIdentifier: 'weather',
                // Для iOS можно настроить badge
            }),
        },
        trigger: null,
    });
}

private static createPixelNotificationBody(changes: string[]): string {
    if (changes.length === 0) return '';
    
    // Если одно изменение - простой формат
    if (changes.length === 1) {
        return `📊 ${changes[0]}`;
    }
    
    // Если несколько - форматируем как список
    let body = '📊 ИЗМЕНЕНИЯ ПОГОДЫ:\n';
    changes.forEach(change => {
        // Добавляем пиксельные маркеры
        body += `• ${change}\n`;
    });
    
    // Добавляем пиксельный footer
    body += '─'.repeat(20);
    
    return body;
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