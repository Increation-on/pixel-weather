// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingContext';
import { formatTemperatureForDisplay } from '../utils/temperature';

export function useWeather(lat: number, lon: number) {
  const { settings } = useSettings();

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon, settings.temperatureUnit],
    queryFn: async () => {

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      
      // Форматируем температуру для отображения
      const displayTemp = formatTemperatureForDisplay(
        newData.current.temperature, 
        settings.temperatureUnit,
        { showUnit: true, decimals: 1 }
      );

      // 2. Сохраняем координаты для фоновых задач
      try {
        await AsyncStorage.setItem('user_location', JSON.stringify({ lat, lon }));
      } catch (error) {
        console.error('❌ Ошибка сохранения координат:', error);
      }

      // 3. Получаем старый снимок
      const oldSnapshot = await WeatherNotificationService.getLastSnapshot();

      if (oldSnapshot) {
        console.log('📊 Есть старые данные для сравнения');
      } else {
        console.log('📭 Первый запрос - нет старых данных для сравнения');
      }

      // 4. Проверяем и уведомляем
      const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);

      if (changes.length > 0) {
        console.log('🔔 ИТОГО ИЗМЕНЕНИЙ:', changes.length);
      }

      console.log('='.repeat(50));
      return newData;
    },
    refetchInterval: 30 * 60 * 1000, // 30 минут
    refetchIntervalInBackground: true,
    staleTime: 15 * 60 * 1000, // 15 минут
    retry: 2,
    enabled: !!lat && !!lon,
  });
}