// src/api/weatherApi.ts
import { WeatherAPIData } from '../types/weatherApi';
import { API_KEYS } from '../config/constants';
import { ApiErrorHandler } from '../utils/ApiErrorHandler';

const WEATHERAPI_KEY = API_KEYS.WEATHERAPI;
const WEATHERAPI_URL = 'https://api.weatherapi.com/v1/current.json';

export async function fetchWeatherAPI(
  lat: number,
  lon: number
): Promise<WeatherAPIData> {
  // ОБЕРНУЛИ В ApiErrorHandler.wrap
  // throw new Error('Тестовая ошибка WEATHERAPI');
  return ApiErrorHandler.wrap(async () => {
    const url = `${WEATHERAPI_URL}?key=${WEATHERAPI_KEY}&q=${lat},${lon}&lang=ru`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WeatherAPI Error: ${response.status}`);
    }
    
    return await response.json();
  }, 'WeatherAPI');
}