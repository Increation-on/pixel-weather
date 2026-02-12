import { WeatherData } from '@/src/types/open-meteo';
import { fetchOpenMeteo } from '../openMeteoApi';
import { fetchWeatherAPI } from '../weatherApi';
import { adaptWeatherAPIToOpenMeteo } from '../adapters/weatherApiAdapter';
import { ApiErrorHandler } from '@/src/utils/ApiErrorHandler';
import { UserFriendlyError } from '@/src/utils/userFriendlyError';
import { weatherCache } from '@/src/utils/cache';

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  
  return ApiErrorHandler.wrap(async () => {
    // ПЕРВОЕ: Пробуем получить из кэша (если есть свежие данные)
    try {
      const cachedData = await weatherCache.get(lat, lon);
      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        const MAX_CACHE_AGE = 30 * 60 * 1000; // 30 минут
        
        if (cacheAge < MAX_CACHE_AGE) {
          if (__DEV__) {
            console.log('💾 Используем данные из кэша (возраст:', 
              Math.round(cacheAge / 60000), 'мин)');
          }
          return cachedData.data;
        } else {
          if (__DEV__) {
            console.log('💾 Кэш устарел (возраст:', 
              Math.round(cacheAge / 60000), 'мин)');
          }
        }
      }
    } catch (cacheError) {
      console.warn('⚠️ Ошибка чтения кэша:', cacheError);
      // Не прерываем выполнение, продолжаем с API
    }

    // ВТОРОЕ: Запрашиваем у API
    try {
      const weatherData = await fetchOpenMeteo(lat, lon);
      
      // Сохраняем в кэш (в фоне, не блокируем ответ)
      weatherCache.save(lat, lon, weatherData)
        .then(() => {
          if (__DEV__) console.log('💾 Данные сохранены в кэш');
        })
        .catch(error => {
          console.warn('⚠️ Ошибка сохранения в кэш:', error);
        });

      return weatherData;

    } catch (primaryError) {
      console.warn('⚠️ Open-Meteo упал, пробуем WeatherAPI...');

      try {
        const weatherApiData = await fetchWeatherAPI(lat, lon);
        const adaptedData = adaptWeatherAPIToOpenMeteo(weatherApiData, lat, lon);

        // Сохраняем в кэш данные от WeatherAPI
        weatherCache.save(lat, lon, adaptedData)
          .then(() => {
            if (__DEV__) console.log('💾 Данные WeatherAPI сохранены в кэш');
          })
          .catch(error => {
            console.warn('⚠️ Ошибка сохранения кэша WeatherAPI:', error);
          });

        return adaptedData;

      } catch (fallbackError) {
        console.error('❌ Оба API не работают');

        // Последняя попытка: очень старый кэш (до 6 часов)
        try {
          const cachedData = await weatherCache.get(lat, lon);
          if (cachedData) {
            const cacheAge = Date.now() - cachedData.timestamp;
            const MAX_STALE_CACHE = 6 * 60 * 60 * 1000; // 6 часов
            
            if (cacheAge < MAX_STALE_CACHE) {
              console.log('🆘 Используем устаревший кэш в качестве фоллбэка');
              return cachedData.data;
            }
          }
          
          // Еще одна попытка: любой последний кэш
          const lastCache = await weatherCache.getLast();
          if (lastCache) {
            const cacheAge = Date.now() - lastCache.timestamp;
            const MAX_STALE_CACHE = 6 * 60 * 60 * 1000; // 6 часов
            
            if (cacheAge < MAX_STALE_CACHE) {
              console.log('🆘 Используем последний доступный кэш другой локации');
              return lastCache.data;
            }
          }
        } catch (finalCacheError) {
          console.error('❌ И кэш тоже не доступен');
        }

        throw UserFriendlyError.api(
          'Сервисы погоды временно недоступны. Проверьте подключение к интернету.'
        );
      }
    }
  }, 'WeatherService');
}