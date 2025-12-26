// src/types/weatherApi.ts
export interface WeatherAPICondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherAPICurrent {
  temp_c: number;
  condition: WeatherAPICondition;
  wind_kph: number;
  is_day: number;
  feelslike_c: number;
  humidity: number;
  cloud: number;
  pressure_mb: number;    // давление в миллибарах
  vis_km: number;         // видимость в километрах
  uv: number;             // УФ-индекс
}

export interface WeatherAPILocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  localtime: string;
}

export interface WeatherAPIData {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
}