import { useWeather } from "../hooks/useWeather";
import { Text} from "@react-navigation/elements";
import { Link } from "expo-router";
import { View } from "react-native";

export const HomeScreen = () => {
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
      <Link href="/forecast" className="mt-4 p-3 bg-blue-500 text-white rounded-lg text-center">
        Смотреть прогноз на 5 дней →
      </Link>
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
