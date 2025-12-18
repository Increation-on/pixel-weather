// app/forecast.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useWeather } from '../hooks/useWeather';

export default function ForecastScreen() {
  const { data, isLoading, error } = useWeather(55.7558, 37.6173);

  if (isLoading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка: {error.message}</Text>;
  if (!data) return <Text>Нет данных</Text>;

  return (
    <ScrollView className="flex-1 bg-blue-50 p-4">
      <Link href="/" className="text-blue-500 mb-4">
        ← Назад
      </Link>
      
      <Text className="text-2xl font-bold mb-6">Прогноз на 5 дней</Text>
      
      {data.daily.map((day) => (
        <View 
          key={day.time} 
          className="bg-white rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-semibold">{day.dayOfWeek}</Text>
              <Text className="text-gray-500">{day.time}</Text>
              <Text className="text-gray-600 mt-1">{day.weatherDescription}</Text>
            </View>
            
            <View className="items-end">
              <Text className="text-2xl font-bold">
                {day.temperatureMax}°C
              </Text>
              <Text className="text-gray-500">
                мин: {day.temperatureMin}°C
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}