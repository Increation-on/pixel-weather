// src/components/shared/EmptyState.tsx
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';

export type EmptyStateType = 'no-data' | 'no-results' | 'offline' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  message?: string;
  onRetry?: () => void;
}

// Импорты PNG иконок
const iconSources = {
  'error': require('@/assets/icons/errors/error.png'),
  'offline': require('@/assets/icons/errors/offline.png'),
  'no-data': require('@/assets/icons/errors/no-data.png'),
  'no-results': require('@/assets/icons/errors/no-results.png'),
};

// Конфигурация
const typeConfig = {
  'no-data': {
    title: 'НЕТ ДАННЫХ',
    defaultMessage: 'ЗДЕСЬ ПОКА НИЧЕГО НЕТ',
    titleColor: 'text-text-secondary',
    messageColor: 'text-text-secondary',
    bgColor: 'bg-card',
    buttonColor: 'primary',
  },
  'no-results': {
    title: 'НИЧЕГО НЕ НАЙДЕНО',
    defaultMessage: 'ПОПРОБУЙТЕ ИЗМЕНИТЬ ПАРАМЕТРЫ ПОИСКА',
    titleColor: 'text-text-secondary',
    messageColor: 'text-text-secondary',
    bgColor: 'bg-card',
    buttonColor: 'primary',
  },
  'offline': {
    title: 'НЕТ ПОДКЛЮЧЕНИЯ',
    defaultMessage: 'ПРОВЕРЬТЕ ПОДКЛЮЧЕНИЕ К ИНТЕРНЕТУ',
    titleColor: 'text-warning',
    messageColor: 'text-warning',
    bgColor: 'bg-card',
    buttonColor: 'warning',
  },
  'error': {
    title: 'ОШИБКА',
    defaultMessage: 'ЧТО-ТО ПОШЛО НЕ ТАК',
    titleColor: 'text-danger',
    messageColor: 'text-danger',
    bgColor: 'bg-card',
    buttonColor: 'danger',
  },
};

// Пиксельная кнопка
const PixelButton = ({ 
  onPress, 
  title,
  color = 'primary',
  disabled = false 
}: { 
  onPress: () => void; 
  title: string;
  color?: 'primary' | 'secondary' | 'danger' | 'warning';
  disabled?: boolean;
}) => {
  const colorClasses = {
    primary: 'border-primary bg-primary',
    secondary: 'border-secondary bg-secondary',
    danger: 'border-danger bg-danger',
    warning: 'border-warning bg-warning',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        px-6 py-3 
        border-2 
        ${disabled ? 'border-gray-600 bg-gray-800' : colorClasses[color]}
        active:opacity-80
      `}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 4,
      }}
    >
      <Text className="text-white font-pixel text-xs tracking-wide">
        {title.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

// Компонент пиксельной иконки
const PixelIcon = ({ 
  type, 
  size = 64 
}: { 
  type: EmptyStateType;
  size?: number;
}) => (
  <Image
    source={iconSources[type]}
    style={{ width: size, height: size }}
    resizeMode="contain"
    className="mb-4"
  />
);

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  message, 
  onRetry 
}) => {
  const config = typeConfig[type];
  const displayMessage = message?.toUpperCase() || config.defaultMessage;

  return (
    <View className={`flex-1 justify-center items-center p-6 ${config.bgColor}`}>
      {/* Пиксельная PNG иконка */}
      <PixelIcon type={type} size={64} />
      
      {/* Заголовок */}
      <Text className={`font-pixel text-lg mb-2 ${config.titleColor}`}>
        {config.title}
      </Text>
      
      {/* Сообщение */}
      <Text 
        className={`font-pixel text-xs text-center mb-6 px-4 ${config.messageColor}`}
        style={{ lineHeight: 18 }}
      >
        {displayMessage}
      </Text>
      
      {/* Кнопка повтора */}
      {onRetry && (
        <PixelButton 
          onPress={onRetry}
          title="Повторить попытку"
          color={config.buttonColor as any}
        />
      )}
      
      {/* Декоративная пиксельная рамка */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-50" />
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-50" />
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-30" />
      <View className="absolute right-0 top-0 bottom-0 w-1 bg-primary opacity-30" />
      
      {/* Угловые акценты */}
      <View className="absolute top-1 left-1 w-2 h-2 bg-primary" />
      <View className="absolute top-1 right-1 w-2 h-2 bg-primary" />
      <View className="absolute bottom-1 left-1 w-2 h-2 bg-primary" />
      <View className="absolute bottom-1 right-1 w-2 h-2 bg-primary" />
    </View>
  );
};