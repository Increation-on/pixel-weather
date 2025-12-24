// components/weather/WeatherPixelIcon.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import { Image, View } from 'react-native';

// Убираем 'night' - это не погодное состояние
type WeatherType = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'snowy' 
  | 'thunderstorm' 
  | 'foggy';

interface WeatherPixelIconProps {
  type: WeatherType;
  size?: number;
  className?: string;
}

const iconMap: Record<WeatherType, any> = {
  sunny: require('@/assets/weather-icons/sunny.png'),
  cloudy: require('@/assets/weather-icons/cloudy.png'),
  rainy: require('@/assets/weather-icons/rainy.png'),
  snowy: require('@/assets/weather-icons/snowy.png'),
  thunderstorm: require('@/assets/weather-icons/thunderstorm.png'),
  foggy: require('@/assets/weather-icons/foggy.png'),
};

export default function WeatherPixelIcon({ 
  type, 
  size = 32,
  className = '' 
}: WeatherPixelIconProps) {
  const iconSource = iconMap[type];
  
  if (!iconSource) {
    console.warn(`Иконка типа "${type}" не найдена, используем sunny`);
    return (
      <View className={`items-center justify-center ${className}`}>
        <Image
          source={iconMap.sunny}
          style={{ width: size, height: size, resizeMode: 'contain' }}
        />
      </View>
    );
  }
  
  return (
    <View className={`items-center justify-center ${className}`}>
      <Image
        source={iconSource}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}

export type { WeatherType };