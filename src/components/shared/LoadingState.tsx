// src/components/shared/LoadingState.tsx
import { View, Text } from 'react-native';
import { PixelLoader } from './PixelLoader';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Загружаем...',
  size = 'large',
  color = 'primary',
}) => {
  // Маппинг размеров: 'small' -> 'medium', 'large' -> 'large'
  const pixelLoaderSize = size === 'small' ? 'medium' : 
                         size === 'large' ? 'large' : 'medium';

  return (
    <View className="flex-1 justify-center items-center p-5">
      {/* Пиксельный лоадер */}
      <PixelLoader 
        size={pixelLoaderSize} 
        color={color}
        className="mb-6"
      />
      
      {/* Пиксельный текст */}
      <Text 
        className="text-text-primary text-center font-pixel"
        style={{ fontSize: size === 'small' ? 10 : 12 }}
      >
        {message.toUpperCase()}
      </Text>
      
      {/* Мигающие точки для индикации процесса */}
      <View className="flex-row mt-2">
        <Text className="text-primary font-pixel text-xs">.</Text>
        <Text className="text-primary font-pixel text-xs opacity-50">.</Text>
        <Text className="text-primary font-pixel text-xs opacity-25">.</Text>
      </View>
    </View>
  );
};