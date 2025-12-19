// src/api/adapters/weatherApiAdapter.ts
import { WeatherData, WEATHER_CODES } from '@/src/types/open-meteo'
import { WeatherAPIData } from '../../types/weatherApi';
import { convertWeatherAPICodeToWMO } from '../../utils/weatherCodeConverter';

export function adaptWeatherAPIToOpenMeteo(
  weatherApiData: WeatherAPIData,
  lat: number,
  lon: number
): WeatherData {
  const wmoCode = convertWeatherAPICodeToWMO(weatherApiData.current.condition.code);
  const windSpeedMps = weatherApiData.current.wind_kph * 0.277778;
  
  return {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    
    current: {
      time: weatherApiData.location.localtime,
      temperature: Math.round(weatherApiData.current.temp_c),
      weatherCode: wmoCode,
      weatherDescription: WEATHER_CODES[wmoCode] || weatherApiData.current.condition.text,
      windSpeed: Math.round(windSpeedMps * 10) / 10,
      isDay: weatherApiData.current.is_day === 1,
      feelsLike: Math.round(weatherApiData.current.feelslike_c), // ✅ теперь обязательное
      humidity: weatherApiData.current.humidity, // ✅ добавляем влажность
    },
    
    daily: [
      {
        time: weatherApiData.location.localtime.split(' ')[0],
        dayOfWeek: 'Сегодня',
        weatherCode: wmoCode,
        weatherDescription: WEATHER_CODES[wmoCode] || weatherApiData.current.condition.text,
        temperatureMax: Math.round(weatherApiData.current.temp_c),
        temperatureMin: Math.round(weatherApiData.current.temp_c - 2),
      }
    ],
    
    metadata: {
      source: 'weather-api',
      retrievedAt: new Date().toISOString(),
      originalLocation: weatherApiData.location.name,
    }
  };
}