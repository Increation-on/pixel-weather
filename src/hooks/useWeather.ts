import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingContext';

export function useWeather(lat: number, lon: number) {
  const { settings } = useSettings();

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon], // УБРАЛИ temperatureUnit - он не влияет на запрос
    queryFn: async () => {
      // ТОЛЬКО ключевые логи в DEV режиме
      if (__DEV__) {
        console.log('🔄 Запрос погоды для', lat.toFixed(4), lon.toFixed(4));
      }

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      
      if (__DEV__) {
        console.log('🌤️ Получено:', newData.current.temperature + '°C', 
          newData.current.weatherCode);
      }

      // 2. Сохраняем координаты для фоновых задач
      try {
        await AsyncStorage.setItem('user_location', JSON.stringify({ lat, lon }));
      } catch (error) {
        console.error('❌ Ошибка сохранения координат:', error);
      }

      // 3. Проверяем изменения ТОЛЬКО если уведомления включены
      if (settings.notifications) {
        // Получаем старый снимок
        const oldSnapshot = await WeatherNotificationService.getLastSnapshot(lat, lon);
        
        if (__DEV__) {
          console.log('📊 Старые данные:', oldSnapshot ? 'Есть' : 'Нет');
        }
        
        // Проверяем изменения
        const changes = await WeatherNotificationService.checkAndNotify(
          lat, 
          lon, 
          oldSnapshot, 
          newData
        );
        
        if (changes.length > 0 && __DEV__) {
          console.log('🔔 Изменений:', changes.length);
        }
      } else if (__DEV__) {
        console.log('🔕 Уведомления выключены, пропускаем проверку');
        
        // Но сохраняем данные для будущих сравнений если они понадобятся
        const oldSnapshot = await WeatherNotificationService.getLastSnapshot(lat, lon);
        if (!oldSnapshot) {
          await WeatherNotificationService.saveLastWeather(lat, lon, newData);
        }
      }

      return newData;
    },
    refetchInterval: 30 * 60 * 1000, // 30 минут
    refetchIntervalInBackground: false, // ВЫКЛЮЧИЛИ - чтобы не конфликтовало с фоновой задачей
    staleTime: 15 * 60 * 1000, // 15 минут
    retry: 2,
    enabled: !!lat && !!lon,
  });
}