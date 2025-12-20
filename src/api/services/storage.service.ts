import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения
const STORAGE_KEYS = {
  SELECTED_CITY: 'selected_city',
  SELECTED_COUNTRY: 'selected_country',
  COORDINATES: 'coordinates',
  LAST_LOCATION: 'last_location',
} as const;

export interface StoredLocation {
  city: string;
  country?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timestamp: number;
  isManual?: boolean;
}

export class StorageService {
  // 🔧 Сохраняем выбранный город
  static async saveSelectedLocation(location: StoredLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
      console.log('💾 Сохранен город:', location.city);
    } catch (error) {
      console.error('❌ Ошибка сохранения города:', error);
    }
  }

  // 🔧 Получаем сохраненный город
  static async getSelectedLocation(): Promise<StoredLocation | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      if (stored) {
        const location = JSON.parse(stored);
        console.log('💾 Загружен сохраненный город:', location.city);
        return location;
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка загрузки города:', error);
      return null;
    }
  }

  // 🔧 Сохраняем координаты отдельно
  static async saveCoordinates(lat: number, lon: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COORDINATES, JSON.stringify({ lat, lon }));
    } catch (error) {
      console.error('❌ Ошибка сохранения координат:', error);
    }
  }

  // 🔧 Получаем сохраненные координаты
  static async getCoordinates(): Promise<{ lat: number; lon: number } | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.COORDINATES);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Ошибка загрузки координат:', error);
      return null;
    }
  }

  // 🔧 Очищаем сохраненную локацию
  static async clearLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOCATION);
      await AsyncStorage.removeItem(STORAGE_KEYS.COORDINATES);
      console.log('🗑️ Очищена сохраненная локация');
    } catch (error) {
      console.error('❌ Ошибка очистки локации:', error);
    }
  }
}