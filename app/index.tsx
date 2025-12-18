import { useWeather } from './../src/hooks/useWeather';
import { Button, View, Text } from 'react-native';

export default function Home() {
  const { data, isLoading, error } = useWeather(55.7558, 37.6173);

  if (isLoading) return <Text>Загрузка погоды...</Text>;
  if (error) return <Text>Ошибка: {error.message}</Text>;

  // data может быть undefined, поэтому проверяем
  if (!data) return <Text>Нет данных</Text>;
console.log('📊 Проверка:', {
    source: data?.metadata?.source,
    dailyLength: data?.daily?.length,
    isArray: Array.isArray(data?.daily),
    metadataExists: !!data?.metadata,
    metadataKeys: data?.metadata ? Object.keys(data.metadata) : 'нет'
  });
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Температура: {data.current.temperature}°C
      </Text>
      <Text style={{ fontSize: 18 }}>
        Погода: {data.current.weatherDescription}
      </Text>
      <Text style={{ fontSize: 16 }}>
        Ощущается как: {data.current.feelsLike}°C
      </Text>
      <Text style={{ fontSize: 16 }}>
        Ветер: {data.current.windSpeed} м/с
      </Text>
      
      {/* Источник данных - НО сначала нужно добавить metadata в WeatherData! */}
      <Text style={{ fontSize: 10, color: 'gray', marginTop: 20 }}>
        Источник: {data.metadata?.source === 'open-meteo' ? 'Open-Meteo' : 'WeatherAPI (фолбэк)'}
      </Text>
    </View>
  );
}