// src/api/weatherService.ts
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
  console.log(`📍 Запрос погоды: ${lat}, ${lon}`);
  
  return ApiErrorHandler.wrap(async () => {
    try {
      console.log('🔄 Open-Meteo...');
      const weatherData = await fetchOpenMeteo(lat, lon);
      
      // ✅ СОХРАНЯЕМ В КЭШ ПОСЛЕ УСПЕШНОГО ЗАПРОСА
      await weatherCache.save(lat, lon, weatherData);
      console.log('💾 Данные сохранены в кэш');
      
      return weatherData;
      
    } catch (primaryError) {
      console.warn('⚠️ Open-Meteo упал, пробуем WeatherAPI...');
      
      try {
        const weatherApiData = await fetchWeatherAPI(lat, lon);
        console.log('✅ WeatherAPI успешно');
        const adaptedData = adaptWeatherAPIToOpenMeteo(weatherApiData, lat, lon);
        
        // ✅ СОХРАНЯЕМ В КЭШ ДАННЫЕ ОТ WEATHERAPI
        await weatherCache.save(lat, lon, adaptedData);
        console.log('💾 Данные от WeatherAPI сохранены в кэш');
        
        return adaptedData;
        
      } catch (fallbackError) {
        console.error('❌ Оба API не работают');
        
        // Проверяем, может есть старый кэш?
        const cachedData = await weatherCache.get();
        if (cachedData) {
          console.log('💾 Используем кэшированные данные как фолбэк');
          return cachedData.data;
        }
        
        throw UserFriendlyError.api(
          'Сервисы погоды временно недоступны. Попробуйте позже.'
        );
      }
    }
  }, 'WeatherService');
}