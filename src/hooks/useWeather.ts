// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';

export function useWeather(lat: number, lon: number) {
  console.log('=== useWeather called ===');
  console.log('lat:', lat, 'lon:', lon);
  console.log('prev lat/lon:', /* нужно отслеживать */);
  
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon],
    queryFn: () => {
      console.log('🚀 Выполняется запрос погоды для:', lat, lon);
      return fetchWeather(lat, lon);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!lat && !!lon,
  });
}