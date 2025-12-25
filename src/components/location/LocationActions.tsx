// src/components/location/LocationActions.tsx
import { TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';

interface LocationActionsProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  isGeocoding?: boolean;
  compact?: boolean; // ← новый пропс для компактного вида
  refreshButtonText?: string;
}

export const LocationActions: React.FC<LocationActionsProps> = ({
  onRefresh,
  isRefreshing = false,
  isGeocoding = false,
  compact = false, // ← по умолчанию полная версия
  refreshButtonText = 'Обновить местоположение',
}) => {
  const isLoading = isRefreshing || isGeocoding;

  // Компактный вариант (для заголовка)
  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onRefresh()}
        disabled={isLoading}
        className={`p-2 ${isLoading ? 'bg-gray-800' : ''} active:opacity-80`}
      >
        {isLoading ? (
          <ActivityIndicator color="#f7fff7" size="small" />
        ) : (
          <Image
            source={require('@/assets/icons/refresh-geo.png')}
            style={{ width: 24, height: 24, transform: [{ scale: 2.2 }] }}
            resizeMode="contain"
            
          />
        )}
      </TouchableOpacity>
    );
  }

  // Полный вариант (как был, но с NativeWind)
  return (
    <TouchableOpacity
      onPress={() => onRefresh()}
      disabled={isLoading}
      className={`flex-row items-center justify-center p-3 rounded-lg mb-4 ${isLoading ? 'bg-gray-800' : 'bg-primary'
        } active:opacity-80`}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color="#f7fff7" size="small" />
          <Text className="text-white text-sm font-medium ml-2">
            {isGeocoding ? 'Определяем город...' : 'Обновляем...'}
          </Text>
        </>
      ) : (
        <>
          <Text className="text-lg mr-2">📍</Text>
          <Text className="text-white text-sm font-medium">
            {refreshButtonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};