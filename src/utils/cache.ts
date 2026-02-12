import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../types/open-meteo';

const CACHE_PREFIX = 'weather_cache_';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 часа
const MAX_CACHE_ITEMS = 5; // Максимум 5 локаций в кэше

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  lat: number;
  lon: number;
  locationName?: string;
}

export const weatherCache = {
  // Генерация ключа для координат
  getKey(lat: number, lon: number): string {
  // Проверяем и используем дефолтные значения
  const safeLat = (lat === undefined || isNaN(lat)) ? 0 : lat;
  const safeLon = (lon === undefined || isNaN(lon)) ? 0 : lon;
  
  const latKey = safeLat.toFixed(2);
  const lonKey = safeLon.toFixed(2);
  return `${CACHE_PREFIX}${latKey}_${lonKey}`;
},

  // Сохранить данные для конкретных координат
  async save(lat: number, lon: number, data: WeatherData): Promise<void> {
    try {
      const key = this.getKey(lat, lon);
      const cache: CachedWeatherData = {
        data,
        timestamp: Date.now(),
        lat,
        lon,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cache));
      
      // Очищаем старые кэши если их много
      await this.cleanupOldCaches();
      
      if (__DEV__) {
        console.log(`💾 Кэш сохранен: ${key}`);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения кэша:', error);
    }
  },

  // Получить данные для координат
  async get(lat: number, lon: number): Promise<CachedWeatherData | null> {
    try {
      const key = this.getKey(lat, lon);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const cache: CachedWeatherData = JSON.parse(cached);
      
      // Проверяем не устарели ли данные
      const isExpired = Date.now() - cache.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        await AsyncStorage.removeItem(key); // Удаляем только этот кэш
        return null;
      }

      return cache;
    } catch (error) {
      console.error('❌ Ошибка загрузки кэша:', error);
      return null;
    }
  },

  // Получить последний сохраненный кэш (любой локации)
  async getLast(): Promise<CachedWeatherData | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length === 0) {
        return null;
      }

      // Берем самый свежий кэш
      let latestCache: CachedWeatherData | null = null;
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cache: CachedWeatherData = JSON.parse(cached);
          
          // Проверяем актуальность
          const isExpired = Date.now() - cache.timestamp > CACHE_DURATION;
          if (isExpired) {
            await AsyncStorage.removeItem(key);
            continue;
          }
          
          // Ищем самый свежий
          if (!latestCache || cache.timestamp > latestCache.timestamp) {
            latestCache = cache;
          }
        }
      }
      
      return latestCache;
    } catch (error) {
      console.error('❌ Ошибка получения последнего кэша:', error);
      return null;
    }
  },

  // Вспомогательная функция очистки старых кэшей (не экспортируется напрямую)
  async cleanupOldCaches(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length <= MAX_CACHE_ITEMS) {
        return;
      }
      
      // Получаем все кэши
      const caches: Array<{key: string, timestamp: number}> = [];
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cache: CachedWeatherData = JSON.parse(cached);
          caches.push({ key, timestamp: cache.timestamp });
        }
      }
      
      // Сортируем по времени (старые первыми)
      caches.sort((a, b) => a.timestamp - b.timestamp);
      
      // Удаляем самые старые, оставляем только MAX_CACHE_ITEMS
      const toRemove = caches.slice(0, caches.length - MAX_CACHE_ITEMS);
      
      for (const item of toRemove) {
        await AsyncStorage.removeItem(item.key);
      }
      
      if (__DEV__ && toRemove.length > 0) {
        console.log(`🗑️  Удалено старых кэшей: ${toRemove.length}`);
      }
    } catch (error) {
      console.error('❌ Ошибка очистки кэшей:', error);
    }
  },

  // Очистить все кэши
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      if (__DEV__) {
        console.log(`🗑️  Очищено кэшей: ${cacheKeys.length}`);
      }
    } catch (error) {
      console.error('❌ Ошибка очистки кэшей:', error);
    }
  },

  // Получить информацию о всех кэшах (для отладки)
  async getStats(): Promise<{
    total: number;
    locations: Array<{lat: number; lon: number; age: number}>;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      const locations = [];
      const now = Date.now();
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cache: CachedWeatherData = JSON.parse(cached);
          locations.push({
            lat: cache.lat,
            lon: cache.lon,
            age: Math.round((now - cache.timestamp) / 60000), // в минутах
          });
        }
      }
      
      return {
        total: cacheKeys.length,
        locations,
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики кэша:', error);
      return { total: 0, locations: [] };
    }
  },
};