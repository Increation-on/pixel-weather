// src/components/shared/DataSourceInfo.tsx
import { View, Text } from 'react-native';

interface DataSourceInfoProps {
  source: 'open-meteo' | 'weather-api' | 'cached' | string;
  compact?: boolean;
}

export const DataSourceInfo: React.FC<DataSourceInfoProps> = ({
  source,
  compact = false,
}) => {
  // Компактный режим (только источник)
  if (compact) {
    return (
      <Text className="text-[8px] font-pixel text-text-secondary">
        Источник: {
          source === 'open-meteo' ? 'Open-Meteo'
            : source === 'weather-api' ? 'WeatherAPI'
            : source === 'cached' ? 'Кэш'
            : source
        }
      </Text>
    );
  }

  // Полная версия
  return (
    <View className="mt-5 p-3 bg-card rounded-lg">
      <Text className="text-[10px] font-pixel text-text-secondary">Отладка:</Text>
      <Text className="text-[10px] font-pixel text-text-secondary mt-2">
        Источник данных: {
          source === 'open-meteo' ? 'Open-Meteo'
            : source === 'weather-api' ? 'WeatherAPI'
            : source === 'cached' ? 'Кэш'
            : source
        }
      </Text>
    </View>
  );
};