// В app/forecast.tsx ЗАМЕНИ весь файл на этот код:
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useWeather } from '../hooks/useWeather';
import WeatherPixelIcon, { type WeatherType } from '../components/weather/WeatherPixelIcon';

export default function ForecastScreen() {
  const { data, isLoading, error } = useWeather(55.7558, 37.6173);

  // ПОЛНАЯ логика определения типа иконки
  const getWeatherType = (description: string): WeatherType => {
    const desc = description.toLowerCase();
    
    // Приоритеты: от самых конкретных к общим
    if (desc.includes('гроз') || desc.includes('thunder') || desc.includes('молн')) return 'thunderstorm';
    if (desc.includes('снег') || desc.includes('snow') || desc.includes('снеж')) return 'snowy';
    if (desc.includes('дожд') || desc.includes('rain') || desc.includes('лив')) return 'rainy';
    if (desc.includes('туман') || desc.includes('fog') || desc.includes('мгл') || desc.includes('дым')) return 'foggy';
    if (desc.includes('облач') || desc.includes('cloud') || desc.includes('пасмур')) return 'cloudy';
    if (desc.includes('ясн') || desc.includes('clear') || desc.includes('солн')) return 'sunny';
    
    // По умолчанию - дневная ясная погода
    return 'sunny';
  };

  if (isLoading) return <Text className="font-pixel">Загрузка...</Text>;
  if (error) return <Text className="font-pixel">Ошибка: {error.message}</Text>;
  if (!data) return <Text className="font-pixel">Нет данных</Text>;

  return (
    <ScrollView className="flex-1 bg-blue-50 p-4">
      <Link href="/" className="text-blue-500 mb-4 font-pixel">
        ← Назад
      </Link>

      {/* Тест ВСЕХ иконок (можно удалить после проверки) */}
      <View className="bg-white p-4 rounded-lg mb-6 border border-gray-300">
        <Text className="font-pixel mb-3 text-center">Все иконки:</Text>
        <View className="flex-row flex-wrap justify-center">
          {(['sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm', 'foggy', 'night'] as WeatherType[]).map((type) => (
            <View key={type} className="m-2 items-center">
              <WeatherPixelIcon type={type} size={32} />
              <Text className="font-pixel text-xs mt-1">{type}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="text-2xl font-pixel mb-6 text-center">Прогноз на 5 дней</Text>

      {data.daily.map((day) => {
        const iconType = getWeatherType(day.weatherDescription);
        
        return (
          <View
            key={day.time}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
          >
            <View className="flex-row justify-between items-center">
              {/* Левая колонка - дата и описание */}
              <View className="flex-1">
                <Text className="text-lg font-pixel">{day.dayOfWeek}</Text>
                <Text className="text-gray-500 text-sm">{day.time}</Text>
                <Text className="text-gray-600 mt-1">{day.weatherDescription}</Text>
              </View>

              {/* Центр - пиксельная иконка */}
              <View className="mx-4">
                <WeatherPixelIcon 
                  type={iconType}
                  size={48}
                />
              </View>

              {/* Правая колонка - температура */}
              <View className="items-end">
                <Text className="text-2xl font-pixel">
                  {day.temperatureMax}°C
                </Text>
                <Text className="text-gray-500 text-sm">
                  мин: {day.temperatureMin}°C
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}