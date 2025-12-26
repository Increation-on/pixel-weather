// src/api/openMeteoApi.ts
import { WeatherData, WEATHER_CODES } from '@/src/types/open-meteo';
import { ApiErrorHandler } from '../utils/ApiErrorHandler';

export async function fetchOpenMeteo(
  lat: number,
  lon: number
): Promise<WeatherData> {
  // ОБЕРНУЛИ ВСЮ ЛОГИКУ В ApiErrorHandler.wrap
  return ApiErrorHandler.wrap(async () => {
    // ВРЕМЕННО ДЛЯ ТЕСТА (раскомментируй):
    // throw new Error('Тестовая ошибка Open-Meteo');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max&hourly=relativehumidity_2m,pressure_msl,visibility&current=uv_index&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo API Error: ${response.status}`);
    }

    const data = await response.json();
    const humidity = data.hourly?.relativehumidity_2m?.[0] || 50;
    const pressure = data.hourly?.pressure_msl?.[0] || 1013;
    const visibility = data.hourly?.visibility?.[0] || 10000;
    const uvIndex = data.current?.uv_index || data.daily?.uv_index_max?.[0] || 0;

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      current: {
        time: data.current_weather.time,
        temperature: Math.round(data.current_weather.temperature),
        weatherCode: data.current_weather.weathercode,
        weatherDescription: WEATHER_CODES[data.current_weather.weathercode] || 'Неизвестно',
        windSpeed: data.current_weather.windspeed,
        isDay: data.current_weather.is_day === 1,
        feelsLike: Math.round(data.current_weather.temperature - 2),
        humidity: Math.round(humidity),
        pressure: Math.round(pressure),
        visibility: Math.round(visibility),
        uvIndex: Math.round(uvIndex),
      },
      daily: data.daily.time.map((time: string, index: number) => ({
        time,
        dayOfWeek: getDayOfWeek(time),
        weatherCode: data.daily.weathercode[index],
        weatherDescription: WEATHER_CODES[data.daily.weathercode[index]] || 'Неизвестно',
        temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[index])
      })).slice(0, 5),
      metadata: {
        source: 'open-meteo',
        retrievedAt: new Date().toISOString(),
        originalLocation: `Координаты: ${lat.toFixed(2)}, ${lon.toFixed(2)}`
      }
    };
  }, 'OpenMeteoAPI');
}

function getDayOfWeek(dateString: string): string {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const date = new Date(dateString);
  return days[date.getDay()];
}