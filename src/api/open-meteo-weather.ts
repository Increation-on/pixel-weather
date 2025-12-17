// src/api/weather.ts
import { WeatherData, CurrentWeather, DailyForecast, WEATHER_CODES } from '../types/weather';

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  console.log('🌤️ Запрос погоды:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Преобразуем данные API в нашу структуру
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: {
      time: data.current_weather.time,
      temperature: Math.round(data.current_weather.temperature), // округляем
      weatherCode: data.current_weather.weathercode,
      weatherDescription: WEATHER_CODES[data.current_weather.weathercode] || 'Неизвестно',
      windSpeed: data.current_weather.windspeed,
      isDay: data.current_weather.is_day === 1,
      feelsLike: Math.round(data.current_weather.temperature - 2) // пример расчета "ощущается"
    },
    daily: data.daily.time.map((time: string, index: number) => ({
      time,
      dayOfWeek: getDayOfWeek(time), // "Ср", "Чт"
      weatherCode: data.daily.weathercode[index],
      weatherDescription: WEATHER_CODES[data.daily.weathercode[index]] || 'Неизвестно',
      temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
      temperatureMin: Math.round(data.daily.temperature_2m_min[index])
    })).slice(0, 5) // берем только 5 дней для pixel-art
  };
}

// Вспомогательная функция для дня недели
function getDayOfWeek(dateString: string): string {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const date = new Date(dateString);
  return days[date.getDay()];
}