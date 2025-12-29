// src/components/shared/OfflineBanner.tsx
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNetwork } from '@/src/providers/NetworkProvider';
import { useState } from 'react';
import { useToast } from '@/src/hooks/useToast';

export const OfflineBanner = () => {
  const { isOffline, checkNetwork, connectionType } = useNetwork();
  const [isChecking, setIsChecking] = useState(false);
  const { showToast } = useToast();

  // Пиксельные сообщения в верхнем регистре
  const getBannerMessage = () => {
    if (connectionType === 'none') {
      return 'НЕТ ПОДКЛЮЧЕНИЯ К ИНТЕРНЕТУ';
    }

    if (connectionType === 'cellular') {
      return 'МОБИЛЬНАЯ СЕТЬ НЕ ДОСТУПНА';
    }

    if (connectionType === 'wifi') {
      return 'WI-FI ПОДКЛЮЧЕН, НО НЕТ ДОСТУПА В ИНТЕРНЕТ';
    }

    return 'ПРОБЛЕМЫ С ПОДКЛЮЧЕНИЕМ К ИНТЕРНЕТУ';
  };

  // Используем иконку из EmptyState (офлайн иконка)
  const renderIcon = () => {
    try {
      // Пытаемся использовать ту же иконку что в EmptyState
      return (
        <Image
          source={require('@/assets/icons/errors/offline.png')}
          className="w-5 h-5 mr-2"
          style={{ 
            tintColor: '#f59e0b', // warning цвет
          }}
          resizeMode="contain"
        />
      );
    } catch (error) {
      // Fallback на эмодзи если иконка не найдена
      const emoji = connectionType === 'cellular' ? '📱' : 
                   connectionType === 'wifi' ? '📶' : '🚫';
      return <Text className="text-lg mr-2">{emoji}</Text>;
    }
  };

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const isOnline = await checkNetwork();

      if (!isOnline) {
        showToast({
          message: 'Интернет всё ещё недоступен',
          type: 'warning',
          duration: 2000
        });
        return;
      }

      showToast({
        message: 'Подключение восстановлено!',
        type: 'success',
        duration: 2000
      });

    } catch (error) {
      showToast({
        message: 'Ошибка при проверке сети',
        type: 'error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="border-2 border-warning bg-card overflow-hidden">
      {/* Верхняя акцентная полоса */}
      <View className="h-1 bg-warning" />
      
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          {/* Левая часть: иконка + текст */}
          <View className="flex-row items-center flex-1">
            {renderIcon()}
            <Text 
              className="text-danger font-pixel text-xs flex-1"
              numberOfLines={2}
              style={{ lineHeight: 16 }}
            >
              {getBannerMessage()}
            </Text>
          </View>

          {/* Правая часть: пиксельная кнопка */}
          <TouchableOpacity
            onPress={handleRetry}
            disabled={isChecking}
            className={`
              px-3 py-1.5 
              border-2 
              ${isChecking ? 'border-gray-600 bg-gray-800' : 'border-warning bg-warning'}
              active:opacity-80
              ml-2
              min-w-[100px]
            `}
            style={{
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 0,
            }}
          >
            <Text className="text-white font-pixel text-xs text-center">
              {isChecking ? 'ПРОВЕРКА...' : 'ПОВТОРИТЬ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Декоративные пиксельные уголки */}
        <View className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-warning opacity-50" />
        <View className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-warning opacity-50" />
        <View className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-warning opacity-50" />
        <View className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-warning opacity-50" />
      </View>
    </View>
  );
};