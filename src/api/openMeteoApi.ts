// src/api/openMeteoApi.ts
import { WeatherData, WEATHER_CODES } from '@/src/types/open-meteo';

// ТОЛЬКО запрос к Open-Meteo API, БЕЗ бизнес-логики
export async function fetchOpenMeteo(
  lat: number,
  lon: number
): Promise<WeatherData> {
   // ВРЕМЕННО ДОБАВЬТЕ ЭТУ СТРОКУ ДЛЯ ТЕСТА:
  // throw new Error('Тестовая ошибка Open-Meteo');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Open-Meteo API Error: ${response.status}`);
  }
  
  const data = await response.json();
  
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
      feelsLike: Math.round(data.current_weather.temperature - 2)
    },
    daily: data.daily.time.map((time: string, index: number) => ({
      time,
      dayOfWeek: getDayOfWeek(time),
      weatherCode: data.daily.weathercode[index],
      weatherDescription: WEATHER_CODES[data.daily.weathercode[index]] || 'Неизвестно',
      temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
      temperatureMin: Math.round(data.daily.temperature_2m_min[index])
    })).slice(0, 5),
    metadata: {  // ← ДОБАВЬТЕ ЕСЛИ НЕТ!
    source: 'open-meteo',
    retrievedAt: new Date().toISOString(),
  }
  };
}

function getDayOfWeek(dateString: string): string {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const date = new Date(dateString);
  return days[date.getDay()];
}