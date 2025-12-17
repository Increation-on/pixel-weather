// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/open-meteo-weather';
import { WeatherData } from './../types/weather';

export function useWeather(lat: number, lon: number) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon], // Уникальный ключ для кэша
    queryFn: () => fetchWeather(lat, lon),
    staleTime: 10 * 60 * 1000, // 10 минут - погода меняется нечасто
    retry: 2, // 2 попытки при ошибке
    enabled: !!lat && !!lon, // Запрос только если есть координаты
  });
}