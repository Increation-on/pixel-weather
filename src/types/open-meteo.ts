// src/types/open-meteo.ts - ФИНАЛЬНАЯ ВЕРСИЯ
export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  metadata?: {
    source: 'open-meteo' | 'weather-api';
    retrievedAt: string;
    originalLocation?: string;
  };
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  isDay: boolean;
  feelsLike: number;       // УБРАТЬ "?" - сделать обязательным
  humidity: number;        // ДОБАВИТЬ новое поле
  precipitation?: number;  // опционально
  pressure?: number;       // опционально
}

export interface DailyForecast {
  time: string;
  dayOfWeek: string; // "Пн", "Вт" - для отображения
  weatherCode: number;
  weatherDescription: string;
  temperatureMax: number;
  temperatureMin: number;
}

// Таблица преобразования WMO кодов в текст
export const WEATHER_CODES: Record<number, string> = {
  0: 'Ясно',
  1: 'Преимущественно ясно',
  2: 'Переменная облачность',
  3: 'Пасмурно',
  45: 'Туман',
  48: 'Инейный туман',
  51: 'Лежащая морось',
  53: 'Умеренная морось',
  55: 'Сильная морось',
  56: 'Ледяная морось',
  57: 'Сильная ледяная морось',
  61: 'Небольшой дождь',
  63: 'Умеренный дождь',
  65: 'Сильный дождь',
  71: 'Небольшой снег',
  73: 'Умеренный снег',
  75: 'Сильный снег',
  77: 'Снежные зерна',
  80: 'Небольшие ливни',
  81: 'Умеренные ливни',
  82: 'Сильные ливни',
  85: 'Небольшие снегопады',
  86: 'Сильные снегопады',
  95: 'Гроза',
  96: 'Гроза с градом',
  99: 'Сильная гроза с градом'
};