// src/api/weatherApi.ts
import { WeatherAPIData } from '../types/weatherApi';
import { API_KEYS } from '../config/constants';

const WEATHERAPI_KEY = API_KEYS.WEATHERAPI; // Вставьте ваш ключ
const WEATHERAPI_URL = 'https://api.weatherapi.com/v1/current.json';

// ТОЛЬКО запрос к WeatherAPI, БЕЗ адаптации
export async function fetchWeatherAPI(
  lat: number,
  lon: number
): Promise<WeatherAPIData> {
  const url = `${WEATHERAPI_URL}?key=${WEATHERAPI_KEY}&q=${lat},${lon}&lang=ru`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`WeatherAPI Error: ${response.status}`);
  }
  
  return await response.json();
}