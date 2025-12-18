// src/utils/weatherCodeConverter.ts

// Маппинг WeatherAPI кодов → WMO кодов (Open-Meteo)
export const WEATHER_API_TO_WMO: Record<number, number> = {
  // Ясная погода
  1000: 0, // Clear/Sunny → Clear sky
  
  // Облачно
  1003: 2, // Partly cloudy → Partly cloudy
  1006: 3, // Cloudy → Overcast
  1009: 3, // Overcast → Overcast (ваш случай!)
  
  // Туман
  1030: 45, // Mist → Fog
  1135: 45, // Fog → Fog
  1147: 45, // Freezing fog → Fog
  
  // Дождь
  1063: 51, // Patchy rain possible → Light drizzle
  1066: 71, // Patchy snow possible → Slight snow fall
  1069: 71, // Patchy sleet possible → Slight snow fall
  1072: 51, // Patchy freezing drizzle possible → Light drizzle
  
  // Снег
  1114: 73, // Blowing snow → Heavy snow fall
  1117: 73, // Blizzard → Heavy snow fall
  1150: 51, // Patchy light drizzle → Light drizzle
  1153: 53, // Light drizzle → Moderate drizzle
  
  // Гроза
  1087: 95, // Thundery outbreaks possible → Thunderstorm
  1273: 95, // Patchy light rain with thunder → Thunderstorm
  1276: 96, // Moderate or heavy rain with thunder → Thunderstorm with hail
};

// Значение по умолчанию
const DEFAULT_WMO_CODE = 3; // Overcast

export function convertWeatherAPICodeToWMO(code: number): number {
  return WEATHER_API_TO_WMO[code] || DEFAULT_WMO_CODE;
}