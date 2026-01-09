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
      console.log('='.repeat(50));
      console.log('🌤️ ЗАПРАШИВАЕМ ПОГОДЫ');
      console.log('='.repeat(50));

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      
      // Форматируем температуру для отображения
      const displayTemp = formatTemperatureForDisplay(
        newData.current.temperature, 
        settings.temperatureUnit,
        { showUnit: true, decimals: 1 }
      );
      
      console.log('📅 Время запроса:', new Date().toLocaleTimeString());
      console.log('📍 Координаты:', lat.toFixed(2), lon.toFixed(2));
      console.log('🌡️ Температура:', displayTemp);
      console.log('🌧️ Осадки:', (newData.current.precipitation || 0) + 'мм');
      console.log('📊 Единицы измерения:', settings.temperatureUnit === 'celsius' ? '°C' : '°F');

      // 2. Сохраняем координаты для фоновых задач
      try {
        await AsyncStorage.setItem('user_location', JSON.stringify({ lat, lon }));
        console.log('💾 Координаты сохранены для фоновых задач');
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