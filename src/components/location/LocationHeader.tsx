// src/components/location/LocationHeader.tsx
import { View, Text } from 'react-native';
import { LocationActions } from './LocationActions'; // ← импортируем

interface LocationHeaderProps {
  city?: string | null;
  country?: string | null;
  subtitle?: string;
  isSaved?: boolean;
  showSavedBadge?: boolean;
  // Пропсы для кнопки
  onRefreshLocation?: () => void;
  isRefreshingLocation?: boolean;
  isGeocoding?: boolean;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  city,
  country,
  subtitle,
  isSaved = false,
  showSavedBadge = true,
  onRefreshLocation,
  isRefreshingLocation = false,
  isGeocoding = false,
}) => {
  const getDisplayLocation = () => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    return 'Локация не определена';
  };

  return (
    <View className="mb-6">
      {/* Заголовок и кнопка в одной строке */}
      <View className="flex-row items-center justify-between">
        <Text 
          className="text-base font-pixel text-secondary flex-1 mr-3" 
          numberOfLines={1}
        >
          {getDisplayLocation()}
        </Text>
        
        {/* Кнопка обновления местоположения (компактная) */}
        {onRefreshLocation && (
          <LocationActions
            onRefresh={onRefreshLocation}
            isRefreshing={isRefreshingLocation}
            isGeocoding={isGeocoding}
            compact={true} // ← компактный режим!
          />
        )}
      </View>
      
      {/* Подзаголовок */}
      {subtitle && (
        <Text className="text-xs font-pixel text-text-secondary mt-1">
          {subtitle}
          {isSaved && showSavedBadge && ' • 💾 Сохранено'}
        </Text>
      )}
    </View>
  );
};