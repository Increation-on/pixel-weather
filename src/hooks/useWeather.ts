// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingContext';

export function useWeather(lat: number, lon: number) {
  const { settings } = useSettings();

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon, settings.temperatureUnit],
    queryFn: async () => {
      console.log('🔄 useWeather: ЗАПРОС погоды для', lat.toFixed(4), lon.toFixed(4));

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      console.log('🌤️ Новые данные получены');
      console.log('🌡️ Температура:', newData.current.temperature);
      console.log('☁️  Погода:', newData.current.weatherCode);

      // 2. Сохраняем координаты для фоновых задач
      try {
        await AsyncStorage.setItem('user_location', JSON.stringify({ lat, lon }));
      } catch (error) {
        console.error('❌ Ошибка сохранения координат:', error);
      }

      // 3. Получаем старый снимок ДЛЯ ЭТОЙ ЛОКАЦИИ
      console.log('📂 Запрашиваю oldSnapshot для этой локации...');
      const oldSnapshot = await WeatherNotificationService.getLastSnapshot(lat, lon);

      if (oldSnapshot) {
        console.log('📊 Старые данные ЕСТЬ для сравнения');
      } else {
        console.log('📭 Старых данных НЕТ (первый запуск для этой локации)');
      }

      // 4. Проверяем и уведомляем (передаем координаты!)
      console.log('🔔 Вызываю checkAndNotify...');
      const changes = await WeatherNotificationService.checkAndNotify(
        lat, 
        lon, 
        oldSnapshot, 
        newData
      );
      
      console.log('🎯 checkAndNotify вернул', changes.length, 'изменений');

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