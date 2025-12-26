// src/utils/weatherParams.ts
import { ImageSourcePropType } from 'react-native';

// Вспомогательные функции (оставляем как есть)
export function getPressureDescription(pressure?: number): string {
  if (!pressure) return 'Нет данных';
  if (pressure < 1000) return 'Низкое';
  if (pressure > 1020) return 'Высокое';
  return 'Нормальное';
}

export function getVisibilityDescription(visibility?: number): string {
  if (!visibility) return 'Нет данных';
  if (visibility < 1000) return 'Очень плохая';
  if (visibility < 5000) return 'Плохая';
  if (visibility < 10000) return 'Умеренная';
  return 'Хорошая';
}

export function getUVDescription(uvIndex?: number): string {
  if (!uvIndex) return 'Нет данных';
  if (uvIndex < 3) return 'Низкий';
  if (uvIndex < 6) return 'Умеренный';
  if (uvIndex < 8) return 'Высокий';
  if (uvIndex < 11) return 'Очень высокий';
  return 'Экстремальный';
}

export function getHumidityDescription(humidity?: number): string {
  if (!humidity) return 'Нет данных';
  if (humidity < 30) return 'Сухо';
  if (humidity < 60) return 'Комфортно';
  return 'Влажно';
}

export function getWindDescription(windSpeed?: number): string {
  if (!windSpeed) return 'Нет данных';
  if (windSpeed < 5) return 'Легкий';
  if (windSpeed < 10) return 'Умеренный';
  if (windSpeed < 15) return 'Сильный';
  return 'Очень сильный';
}

// Тип для параметра погоды
export interface WeatherParam {
  id: string;
  icon: ImageSourcePropType; // Изменяем тип на ImageSourcePropType
  title: string;
  value: string | number;
  unit: string;
  description: string;
}

// Словарь иконок
const WEATHER_ICONS = {
  pressure: require('@/assets/metrics/pressure.png'),
  visibility: require('@/assets/metrics/visibility.png'),
  uv: require('@/assets/metrics/uv.png'),
  humidity: require('@/assets/metrics/humidity.png'),
  wind: require('@/assets/metrics/wind.png'),
} as const;

// Функция для создания массива параметров
export function createWeatherParams(params: {
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  humidity?: number;
  windSpeed?: number;
}): WeatherParam[] {
  return [
    {
      id: 'pressure',
      icon: WEATHER_ICONS.pressure,
      title: 'Давление',
      value: params.pressure || '--',
      unit: 'hPa',
      description: getPressureDescription(params.pressure),
    },
    {
      id: 'visibility',
      icon: WEATHER_ICONS.visibility,
      title: 'Видимость',
      value: params.visibility ? (params.visibility / 1000).toFixed(1) : '--',
      unit: 'км',
      description: getVisibilityDescription(params.visibility),
    },
    {
      id: 'uv',
      icon: WEATHER_ICONS.uv,
      title: 'УФ-индекс',
      value: params.uvIndex || '--',
      unit: '',
      description: getUVDescription(params.uvIndex),
    },
    {
      id: 'humidity',
      icon: WEATHER_ICONS.humidity,
      title: 'Влажность',
      value: params.humidity || '--',
      unit: '%',
      description: getHumidityDescription(params.humidity),
    },
    {
      id: 'wind',
      icon: WEATHER_ICONS.wind,
      title: 'Ветер',
      value: params.windSpeed || '--',
      unit: 'м/с',
      description: getWindDescription(params.windSpeed),
    },
  ];
}