export type NotificationType = 
  | 'temperature_change'
  | 'precipitation_change'
  | 'weather_alert';

export interface NotificationSettings {
  enabled: boolean;
}

export interface WeatherSnapshot {
  timestamp: number;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  lat: number;    // ← добавляем координаты
  lon: number;
}