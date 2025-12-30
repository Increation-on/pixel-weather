// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ← добавляем импорт

export function useWeather(lat: number, lon: number) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      console.log('='.repeat(50));
      console.log('🌤️ ЗАПРАШИВАЕМ ПОГОДУ');
      console.log('='.repeat(50));

      // 1. Получаем новые данные
      const newData = await fetchWeather(lat, lon);
      console.log('📅 Время запроса:', new Date().toLocaleTimeString());
      console.log('📍 Координаты:', lat.toFixed(2), lon.toFixed(2));
      console.log('🌡️ Температура:', newData.current.temperature + '°C');
      console.log('🌧️ Осадки:', (newData.current.precipitation || 0) + 'мм');

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
        console.log('📊 СРАВНЕНИЕ С ПРЕДЫДУЩИМИ ДАННЫМИ:');
        console.log('📉 Старая темп:', oldSnapshot.temperature + '°C');
        console.log('📈 Новая темп:', newData.current.temperature + '°C');
        console.log('📊 Разница:', 
          (newData.current.temperature - oldSnapshot.temperature).toFixed(1) + '°C');
      } else {
        console.log('📭 Первый запрос - нет старых данных для сравнения');
      }

      // 4. Проверяем и уведомляем
      const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);

      if (changes.length > 0) {
        console.log('🔔 ИТОГО ИЗМЕНЕНИЙ:', changes.length);
      }

      // 5. Сохраняем новые данные для следующей проверки
      await WeatherNotificationService.saveLastWeather(newData);
      console.log('💾 Данные погоды сохранены для следующей проверки');
      console.log('='.repeat(50));

      return newData;
    },
    staleTime: 30 * 60 * 1000, // 30 минут (согласуем с фоновой задачей)
    retry: 2,
    enabled: !!lat && !!lon,
  });
}