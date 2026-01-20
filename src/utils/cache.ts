// src/utils/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 часа

interface CachedWeatherData {
  data: any;
  timestamp: number;
  coordinates: { lat: number; lon: number };
}

export const weatherCache = {
  async save(lat: number, lon: number, data: any): Promise<void> {
    const cache: CachedWeatherData = {
      data,
      timestamp: Date.now(),
      coordinates: { lat, lon },
    };
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  },

  async get(): Promise<CachedWeatherData | null> {
    try {
      const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
      if (!cached) return null;

      const cache: CachedWeatherData = JSON.parse(cached);
      
      // Проверяем не устарели ли данные
      const isExpired = Date.now() - cache.timestamp > CACHE_DURATION;
      if (isExpired) {
        await this.clear();
        return null;
      }

      return cache;
    } catch (error) {
      console.error('❌ Ошибка загрузки кэша:', error);
      return null;
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(WEATHER_CACHE_KEY);
  },
};