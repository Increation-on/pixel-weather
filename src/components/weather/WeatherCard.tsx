// src/components/weather/WeatherCard.tsx
import { View, Text } from 'react-native';
import WeatherPixelIcon, { WeatherType as IconWeatherType } from './WeatherPixelIcon';
import PrecipitationAnimation from './animations/PrecipitationAnimation';

interface WeatherCardProps {
  temperature: number;
  weatherDescription: string;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  weatherDescription,
  feelsLike,
  windSpeed,
  humidity,
}) => {
  // Функция для цвета текста
  const getWeatherColor = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('ясн') || desc.includes('солн')) return 'text-primary';
    if (desc.includes('дожд') || desc.includes('ливень')) return 'text-secondary';
    if (desc.includes('снег') || desc.includes('метель')) return 'text-text-primary';
    if (desc.includes('гроз') || desc.includes('шторм')) return 'text-danger';
    return 'text-primary';
  };

  // Функция для типа иконки/анимации
  const getWeatherType = (description: string): IconWeatherType => {
    const desc = description.toLowerCase();
    if (desc.includes('ясн') || desc.includes('солн')) return 'sunny';
    if (desc.includes('облач') || desc.includes('пасмур')) return 'cloudy';
    if (desc.includes('дожд') || desc.includes('ливень')) return 'rainy';
    if (desc.includes('снег') || desc.includes('метель')) return 'snowy';
    if (desc.includes('гроз') || desc.includes('шторм')) return 'thunderstorm';
    if (desc.includes('туман')) return 'foggy';
    return 'sunny';
  };

  const weatherType = getWeatherType(weatherDescription);
  const textColor = getWeatherColor(weatherDescription);

  return (
    <View className="bg-card p-5 border border-gray-800 overflow-hidden mt-20">
      {/* Погодная анимация на фоне карточки */}
      <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none ">
        <PrecipitationAnimation
          weatherType={weatherType}
          intensity="medium"
        />
      </View>

      {/* Контент карточки (поверх анимации) */}
      <View className="relative z-10 ">
        {/* Температура - основной акцент */}
        <Text className="text-4xl font-pixel text-secondary text-center mt-3">
          {Math.round(temperature)}°C
        </Text>
        {/*иконка погоды*/}
        <WeatherPixelIcon
          type={weatherType}
          size={120}
          className="mt-3"
        />
        {/* Описание погоды */}
        <View className="flex-row items-center justify-center">
          <Text className={`text-2xl font-pixel ${textColor} text-center`}>
            {weatherDescription}
          </Text>
        </View>

        {/* Детали погоды */}
        <View className="flex-row mt-10 mb-4">
          {/* Левая колонка - Ощущается */}
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-pixel text-text-secondary">Ощущается</Text>
            <Text className="text-xs font-pixel text-text-primary font-semibold mt-4">
              {Math.round(feelsLike)}°C
            </Text>
          </View>

          {/* Центральная колонка - Ветер */}
          <View className="flex-1 items-center border-l border-r border-gray-700">
            <Text className="text-[10px] font-pixel text-text-secondary">Ветер</Text>
            <Text className="text-xs font-pixel text-text-primary font-semibold mt-4">
              {windSpeed} м/с
            </Text>
          </View>

          {/* Правая колонка - Влажность */}
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-pixel text-text-secondary">Влажность</Text>
            <Text className="text-xs font-pixel text-text-primary font-semibold mt-4">
              {humidity}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};