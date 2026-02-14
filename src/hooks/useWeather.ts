import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
// 🚫 УДАЛЯЕМ: import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingContext';

export function useWeather(lat: number, lon: number) {
  const { settings } = useSettings();

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      if (__DEV__) {
        console.log('🔄 Запрос погоды для', lat.toFixed(4), lon.toFixed(4));
      }

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      
      if (__DEV__) {
        console.log('🌤️ Получено:', newData.current.temperature + '°C', 
          newData.current.weatherCode);
      }

      // 2. Сохраняем координаты (оставляем, пригодится)
      try {
        await AsyncStorage.setItem('user_location', JSON.stringify({ lat, lon }));
      } catch (error) {
        console.error('❌ Ошибка сохранения координат:', error);
      }

      // 🚫 УДАЛЯЕМ ВЕСЬ БЛОК УВЕДОМЛЕНИЙ
      // if (settings.notifications) {
      //   ... старый код с WeatherNotificationService ...
      // }

      return newData;
    },
    refetchInterval: 30 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 15 * 60 * 1000,
    retry: 2,
    enabled: !!lat && !!lon,
  });
}