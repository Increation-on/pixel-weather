// src/components/location/LocationActions.tsx
import { TouchableOpacity, Text, Image, View } from 'react-native';
import { PixelLoader } from '../shared/PixelLoader';

interface LocationActionsProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  isGeocoding?: boolean;
  compact?: boolean;
  refreshButtonText?: string;
}

export const LocationActions: React.FC<LocationActionsProps> = ({
  onRefresh,
  isRefreshing = false,
  isGeocoding = false,
  compact = false,
}) => {
  const isLoading = isRefreshing || isGeocoding;

  // Компактный вариант (для заголовка)
  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onRefresh()}
        disabled={isLoading}
        className={`p-2 mr-2 ${isLoading ? 'bg-gray-800' : ''} active:opacity-80`}
      >
        {isLoading ? (
          // Заменяем ActivityIndicator на PixelLoader с таким же scale
          <View className="w-6 h-6 items-center justify-center">
            <PixelLoader 
              size="small" 
              color="secondary"
            />
          </View>
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
  
};