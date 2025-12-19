// src/api/weatherService.ts
import { WeatherData } from '@/src/types/open-meteo';
import { fetchOpenMeteo } from '../openMeteoApi';
import { fetchWeatherAPI } from '../weatherApi';
import { adaptWeatherAPIToOpenMeteo } from '../adapters/weatherApiAdapter';

// ГЛАВНЫЙ СЕРВИС - здесь вся логика фолбэка
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  console.log(`📍 Запрос погоды: ${lat}, ${lon}`);
  
  try {
    // 1. Пробуем Open-Meteo
    console.log('🔄 Open-Meteo...');
    return await fetchOpenMeteo(lat, lon);
    
  } catch (primaryError) {
    console.warn('⚠️ Open-Meteo упал, пробуем WeatherAPI...');
    
    try {
      // 2. Фолбэк на WeatherAPI
      const weatherApiData = await fetchWeatherAPI(lat, lon);
      
      // 3. Адаптируем к нашему формату
      console.log('✅ WeatherAPI успешно')
      return adaptWeatherAPIToOpenMeteo(weatherApiData, lat, lon);
      
    } catch (fallbackError) {
      // 3. Оба упали
      console.error('❌ Оба API не работают');
      throw new Error('Сервис погоды недоступен');
    }
  }
}