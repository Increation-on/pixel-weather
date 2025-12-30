// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/services/weatherService';
import { WeatherData } from '../types/open-meteo';
import { WeatherNotificationService } from '../api/services/WeatherNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../contexts/SettingContext';
import { formatTemperatureForDisplay } from '../utils/temperature'; // ← Новый импорт

export function useWeather(lat: number, lon: number) {
  const { settings } = useSettings(); // ← Используем настройки

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', lat, lon, settings.temperatureUnit], // ← Добавляем единицы измерения в ключ
    queryFn: async () => {
      console.log('='.repeat(50));
      console.log('🌤️ ЗАПРАШИВАЕМ ПОГОДУ');
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
        // Форматируем старые данные для сравнения
        const oldTempDisplay = formatTemperatureForDisplay(
          oldSnapshot.temperature,
          settings.temperatureUnit,
          { showUnit: true, decimals: 1 }
        );
        
        const newTempDisplay = formatTemperatureForDisplay(
          newData.current.temperature,
          settings.temperatureUnit,
          { showUnit: true, decimals: 1 }
        );
        
        const tempDiff = newData.current.temperature - oldSnapshot.temperature;
        const tempDiffDisplay = formatTemperatureForDisplay(
          Math.abs(tempDiff),
          settings.temperatureUnit,
          { showUnit: true, decimals: 1 }
        );
        
        console.log('📊 СРАВНЕНИЕ С ПРЕДЫДУЩИМИ ДАННЫМИ:');
        console.log('📉 Старая темп:', oldTempDisplay);
        console.log('📈 Новая темп:', newTempDisplay);
        console.log('📊 Разница:', 
          (tempDiff > 0 ? '+' : '-') + tempDiffDisplay);
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