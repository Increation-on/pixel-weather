// src/api/services/WeatherNotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { WeatherData } from '@/src/types/open-meteo';
import { WeatherSnapshot } from '@/src/types/notifications';
import { detectWeatherChanges } from '@/src/utils/weatherDetector';

const SETTINGS_KEY = 'notification_settings';
const PERMISSION_ASKED_KEY = 'notification_permission_asked';
const LAST_LOCATION_KEY = 'last_known_location';

// Настройки - ТОЛЬКО ВКЛ/ВЫКЛ
const DEFAULT_SETTINGS = {
  enabled: true,
};

export class WeatherNotificationService {
  static readonly DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  static readonly API_URL = 'https://pixel-weather-server.vercel.app';

  // ========== ОСНОВНАЯ ЛОГИКА ==========

  /**
   * 🎯 ФОНОВЫЙ РЕЖИМ: Вызов сервера (используется в BackgroundTask)
   */
  static async triggerServerWeatherCheck(lat: number, lon: number): Promise<boolean> {
    console.log('🌐 [СЕРВЕР] Запрос проверки погоды...');
    
    try {
      const response = await fetch(`${this.API_URL}/api/weather-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon })
      });
      
      const data = await response.json();
      console.log('✅ [СЕРВЕР] Ответ:', data);
      return response.ok;
    } catch (error) {
      console.error('❌ [СЕРВЕР] Ошибка вызова:', error);
      return false;
    }
  }

  /**
   * 🎯 ЛОКАЛЬНЫЙ РЕЖИМ: Проверка и уведомление (когда приложение открыто)
   */
  static async checkAndNotify(
    lat: number,
    lon: number,
    oldSnapshot: WeatherSnapshot | null,
    newData: WeatherData
  ): Promise<string[]> {
    console.log('='.repeat(50));
    console.log('🔔 [ЛОКАЛЬНО] Проверка для:', lat.toFixed(4), lon.toFixed(4));
    
    // 1. Если нет старых данных - сохраняем и выходим
    if (!oldSnapshot) {
      console.log('📭 Первый запуск для этой локации!');
      await this.saveLastWeather(lat, lon, newData);
      return [];
    }
    
    // 2. Проверяем настройки
    const settings = await this.getSettings();
    if (!settings.enabled) {
      console.log('🔕 Уведомления выключены в настройках');
      return [];
    }
    
    // 3. Проверяем возраст данных (максимум 6 часов)
    const now = Date.now();
    const dataAge = now - oldSnapshot.timestamp;
    const MAX_AGE = 6 * 60 * 60 * 1000;
    
    if (dataAge > MAX_AGE) {
      console.log(`⏰ Данные устарели (${Math.round(dataAge / 3600000)}ч), обновляем`);
      await this.saveLastWeather(lat, lon, newData);
      return [];
    }
    
    // 4. Проверяем изменения погоды
    console.log('🔍 Проверяем изменения...');
    
    const oldData = {
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
    
    const changes = detectWeatherChanges(oldData, newDataForDetector);
    
    // 5. ТОЛЬКО если есть изменения - отправляем локальное уведомление
    if (changes.length > 0) {
      console.log('🎉 Обнаружены изменения:', changes.length);
      await this.saveLastWeather(lat, lon, newData);
      
      const priority = this.determinePriority(changes);
      await this.showLocalNotification(changes, priority);
      
      return changes;
    } else {
      console.log('🤔 Изменений нет');
      return [];
    }
  }

  // ========== ЛОКАЛЬНЫЕ УВЕДОМЛЕНИЯ (ТОЛЬКО ДЛЯ ОТКРЫТОГО ПРИЛОЖЕНИЯ) ==========

  /**
   * 📱 Показывает локальное уведомление (когда приложение на переднем плане)
   */
  static async showLocalNotification(changes: string[], priority: 'high' | 'default' | 'low' = 'default'): Promise<void> {
    if (changes.length === 0) return;

    const title = '🌤️ PIXEL WEATHER';
    const body = this.createNotificationBody(changes);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type: 'weather_change', 
            changes, 
            priority,
            source: 'local' // 👈 помечаем что это локальное
          },
          sound: true,
        },
        trigger: null,
      });
      
      console.log('✅ Локальное уведомление отправлено');
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления:', error);
    }
  }

  // ========== УПРАВЛЕНИЕ ЛОКАЦИЕЙ ==========

  /**
   * 📍 Получить последнюю известную локацию
   */
  static async getLastKnownLocation(): Promise<{ lat: number; lon: number } | null> {
    try {
      // 1. Пробуем получить из сохраненной локации
      const lastLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);
      if (lastLocation) {
        return JSON.parse(lastLocation);
      }
      
      // 2. Пробуем найти среди снапшотов
      const keys = await AsyncStorage.getAllKeys();
      const snapshotKey = keys.find(key => key.startsWith('weather_snapshot_'));
      
      if (snapshotKey) {
        const snapshot = await AsyncStorage.getItem(snapshotKey);
        if (snapshot) {
          const data = JSON.parse(snapshot);
          return { lat: data.lat, lon: data.lon };
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Ошибка получения локации:', error);
      return null;
    }
  }

  /**
   * 📍 Сохранить последнюю локацию
   */
  static async saveLastLocation(lat: number, lon: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify({ lat, lon }));
      console.log('💾 Локация сохранена:', lat.toFixed(4), lon.toFixed(4));
    } catch (error) {
      console.error('❌ Ошибка сохранения локации:', error);
    }
  }

  // ========== РАБОТА С ДАННЫМИ ПОГОДЫ ==========

  static getStorageKey(lat: number, lon: number): string {
    return `weather_snapshot_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  }

  static async saveLastWeather(lat: number, lon: number, data: WeatherData) {
    try {
      const key = this.getStorageKey(lat, lon);
      const snapshot = this.createSnapshot(lat, lon, data);
      await AsyncStorage.setItem(key, JSON.stringify(snapshot));
      await this.saveLastLocation(lat, lon); // 👈 сохраняем локацию отдельно
      console.log('💾 Данные сохранены');
    } catch (error) {
      console.error('❌ Ошибка сохранения погоды:', error);
    }
  }

  static async getLastSnapshot(lat: number, lon: number): Promise<WeatherSnapshot | null> {
    try {
      const key = this.getStorageKey(lat, lon);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Ошибка загрузки погоды:', error);
      return null;
    }
  }

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

  // ========== НАСТРОЙКИ И РАЗРЕШЕНИЯ ==========

  static async initialize() {
    console.log('🔔 Инициализация службы уведомлений');
    try {
      await this.createNotificationChannels();
      
      const hasAsked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
      if (!hasAsked) {
        await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
    }
  }

  static async createNotificationChannels() {
    if (Platform.OS !== 'android') return;
    
    try {
      await Notifications.setNotificationChannelAsync('pixel_weather_high', {
        name: 'Экстренные погодные уведомления',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [300, 200, 300, 200],
        lightColor: '#FF0000',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('pixel_weather_default', {
        name: 'Изменения погоды',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [300, 200, 300, 200],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('pixel_weather_low', {
        name: 'Обновления погоды',
        importance: Notifications.AndroidImportance.LOW,
        sound: 'default',
      });

      console.log('✅ Каналы уведомлений созданы');
    } catch (error) {
      console.error('❌ Ошибка создания каналов:', error);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        console.log('✅ Разрешение получено');
        return true;
      } else {
        console.log('🔕 Разрешение не предоставлено');
        await this.saveSettings({ enabled: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка запроса разрешений:', error);
      return false;
    }
  }

  static async getSettings(): Promise<{ enabled: boolean }> {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<{ enabled: boolean }>) {
    try {
      const current = await this.getSettings();
      const newSettings = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('❌ Ошибка сохранения настроек:', error);
    }
  }

  static async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch {
      return 'undetermined';
    }
  }

  static async areNotificationsEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled;
  }

  static async sendTestNotification(): Promise<boolean> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Тестовое уведомление',
          body: 'Expo Push работает!',
          sound: true,
        },
        trigger: null,
      });
      return true;
    } catch (error) {
      console.error('❌ Ошибка тестового уведомления:', error);
      return false;
    }
  }

  // ========== ХЕЛПЕРЫ ==========

  private static determinePriority(changes: string[]): 'high' | 'default' | 'low' {
    const highKeywords = ['гроза', 'сильный', 'ливень', 'шторм', 'ураган'];
    const defaultKeywords = ['Температура', 'дождь', 'снег', 'туман', 'облачно'];
    
    const changesText = changes.join(' ').toLowerCase();
    
    if (highKeywords.some(k => changesText.includes(k))) return 'high';
    if (defaultKeywords.some(k => changesText.includes(k.toLowerCase()))) return 'default';
    return 'low';
  }

  private static createNotificationBody(changes: string[]): string {
    if (changes.length === 0) return '';
    if (changes.length === 1) return this.formatChange(changes[0]);
    
    const formatted = changes.slice(0, 3).map(c => this.formatChange(c));
    
    if (changes.length <= 3) {
      return formatted.join(' • ');
    } else {
      return `${formatted.join(' • ')} • +${changes.length - 3} еще`;
    }
  }

  private static formatChange(change: string): string {
    return change
      .replace('Температура ', '')
      .replace('Начался ', '')
      .replace('Усилился ', '')
      .replace('Прекратился ', '')
      .trim();
  }
}