import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { useNetwork } from '@/src/providers/NetworkProvider';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/src/hooks/useToast';

export const OfflineBanner = () => {
  const { isOffline, checkNetwork, connectionType } = useNetwork();
  const [isChecking, setIsChecking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const { showToast } = useToast();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Пиксельные сообщения
  const getBannerMessage = () => {
    if (connectionType === 'none') {
      return 'НЕТ ПОДКЛЮЧЕНИЯ';
    }
    if (connectionType === 'cellular') {
      return 'МОБИЛЬНАЯ СЕТЬ НЕ ДОСТУПНА';
    }
    if (connectionType === 'wifi') {
      return 'WI-FI БЕЗ ИНТЕРНЕТА';
    }
    return 'ПРОБЛЕМЫ С ПОДКЛЮЧЕНИЕМ';
  };

  // Показываем плашку с анимацией
  const showBanner = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Автоскрытие через 5 секунд
    setTimeout(() => {
      if (isOffline) {
        hideBanner();
      }
    }, 5000);
  };

  // Скрываем плашку с анимацией
  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  // Основная логика показа/скрытия
  useEffect(() => {
    if (isOffline) {
      showBanner();
    } else {
      hideBanner();
    }

    // Очистка при размонтировании
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isOffline]);

  // Периодическая проверка каждые 15 секунд при offline
  useEffect(() => {
    if (isOffline) {
      checkIntervalRef.current = setInterval(async () => {
        const online = await checkNetwork();
        if (!online) {
          // Если всё ещё offline, показываем плашку снова
          showBanner();
        }
      }, 15000); // 15 секунд
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isOffline]);

  // Иконка
  const renderIcon = () => {
    try {
      return (
        <Image
          source={require('@/assets/icons/errors/offline.png')}
          className="w-5 h-5 mr-2"
          style={{ 
            tintColor: '#f59e0b',
          }}
          resizeMode="contain"
        />
      );
    } catch {
      const emoji = connectionType === 'cellular' ? '📱' : 
                   connectionType === 'wifi' ? '📶' : '🚫';
      return <Text className="text-lg mr-2">{emoji}</Text>;
    }
  };

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
        // Перезапускаем таймер автоскрытия
        showBanner();
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

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          top: 40, // Отступ от верха
          left: 16,
          right: 16,
          zIndex: 9999, // Максимальный z-index
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 10,
        }
      ]}
    >
      <View className="border-2 border-warning bg-card overflow-hidden rounded-lg">
        {/* Верхняя акцентная полоса */}
        <View className="h-1 bg-warning" />
        
        <View className="p-3">
          <View className="flex-row items-center justify-between">
            {/* Левая часть */}
            <View className="flex-row items-center flex-1">
              {renderIcon()}
              <Text 
                className="text-danger font-pixel text-xs flex-1"
                numberOfLines={1}
              >
                {getBannerMessage()}
              </Text>
            </View>

            {/* Правая часть: кнопка */}
            <TouchableOpacity
              onPress={handleRetry}
              disabled={isChecking}
              className={`
                px-3 py-1.5 
                border-2 
                ${isChecking ? 'border-gray-600 bg-gray-800' : 'border-warning bg-warning'}
                active:opacity-80
                ml-2
                min-w-[90px]
              `}
              style={{
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 0,
              }}
            >
              <Text className="text-white font-pixel text-xs text-center">
                {isChecking ? '...' : 'ПОВТОРИТЬ'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};