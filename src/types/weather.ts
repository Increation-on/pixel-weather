// Основные типы для погодного приложения

// Унифицированные данные после обработки
export interface UnifiedWeatherData {
  temp: number;           // температура
  feelsLike: number;      // ощущается как
  humidity: number;       // влажность %
  condition: string;      // описание ("ясно", "дождь")
  icon: string;          // код иконки
  city: string;          // название города
  source: 'openweather' | 'weatherapi';  // какой API использован
  timestamp?: number;     // когда получены (опционально)
}

// Типы погодных условий для удобства
export type WeatherCondition = 
  | 'clear'        // ясно
  | 'clouds'       // облачно
  | 'rain'         // дождь
  | 'snow'         // снег
  | 'thunderstorm' // гроза
  | 'drizzle'      // морось
  | 'mist'         // туман
  | 'fog';         // туман

// Тип для ошибок API
export interface WeatherError {
  message: string;
  code?: number;
  isFallback?: boolean;  // true если ошибка после фолбэка
}