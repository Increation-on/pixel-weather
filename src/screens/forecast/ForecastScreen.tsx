// app/forecast.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useWeather } from '@/src/hooks/useWeather';
import { ForecastDayCard } from './ForecastDayCard';
import { WeatherType } from '@/src/components/weather/WeatherPixelIcon';

export default function ForecastScreen() {
  const { data, isLoading, error } = useWeather(55.7558, 37.6173);

  const getWeatherType = (description: string): WeatherType => {
    const desc = description.toLowerCase();
    
    if (desc.includes('гроз') || desc.includes('thunder') || desc.includes('молн')) return 'thunderstorm';
    if (desc.includes('снег') || desc.includes('snow') || desc.includes('снеж')) return 'snowy';
    if (desc.includes('дожд') || desc.includes('rain') || desc.includes('лив')) return 'rainy';
    if (desc.includes('туман') || desc.includes('fog') || desc.includes('мгл')) return 'foggy';
    if (desc.includes('облач') || desc.includes('cloud') || desc.includes('пасмур')) return 'cloudy';
    if (desc.includes('ясн') || desc.includes('clear') || desc.includes('солн')) return 'sunny';
    
    return 'sunny';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4ecdc4" />
        <Text className="text-text-primary font-pixel mt-4">ЗАГРУЗКА...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-danger font-pixel text-center">
          ОШИБКА ЗАГРУЗКИ
        </Text>
      </View>
    );
  }

  if (!data?.daily?.length) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-primary font-pixel">НЕТ ДАННЫХ</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4 ">
      {/* Заголовок */}
      <View className="items-center mb-6 mt-6">
        <Text className="text-text-primary font-pixel text-2xl text-center">
          ПРОГНОЗ НА 5 ДНЕЙ
        </Text>
        <View className="w-16 h-1 bg-primary mt-2" />
        {/* <BackgroundTaskTester/> */}
      </View>

      {/* Карточки с анимациями */}
      {data.daily.slice(0, 5).map((day) => {
        const iconType = getWeatherType(day.weatherDescription);
        
        return (
          <ForecastDayCard
            key={day.time}
            day={day}
            iconType={iconType}
          />
        );
      })}
    </ScrollView>
  );
}