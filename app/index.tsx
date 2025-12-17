import { useWeather } from './../src/hooks/useWeather';
import { Button, View, Text } from 'react-native';

export default function Home() {
  const { data, isLoading, error } = useWeather(55.7558, 37.6173);

  if (isLoading) return <Text>Загрузка погоды...</Text>;
  if (error) return <Text>Ошибка: {error.message}</Text>;

  return (
    <View>
      <Text>Температура: {data?.current.temperature}°C</Text>
      <Text>Погода: {data?.current.weatherDescription}</Text>
    </View>
  );
}