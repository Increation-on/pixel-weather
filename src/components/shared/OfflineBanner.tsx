// src/components/shared/OfflineBanner.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useNetwork } from '@/src/providers/NetworkProvider';
import { useState } from 'react';
import { useToast } from '@/src/hooks/useToast';

export const OfflineBanner = () => {
  const { isOffline, checkNetwork, connectionType } = useNetwork();
  const [isChecking, setIsChecking] = useState(false);
  const { showToast } = useToast();

  console.log('🚨 OfflineBanner: isOffline =', isOffline);


  const getBannerMessage = () => {
    if (connectionType === 'none') {
      return 'Нет подключения к интернету';
    }

    if (connectionType === 'cellular') {
      return 'Мобильная сеть не доступна';
    }

    if (connectionType === 'wifi') {
      return 'Wi-Fi подключен, но нет доступа в интернет';
    }

    return 'Проблемы с подключением к интернету';
  };

  const getBannerEmoji = () => {
    if (connectionType === 'cellular') return '📱';
    if (connectionType === 'wifi') return '📶';
    return '🚫';
  };

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      // 1. Проверяем сеть
      const isOnline = await checkNetwork();

      if (!isOnline) {
        showToast({
          message: 'Интернет всё ещё недоступен',
          type: 'warning',
          duration: 2000
        });
        return;
      }

      // 2. Сеть есть - показываем успех
      showToast({
        message: 'Подключение восстановлено!',
        type: 'success',
        duration: 2000
      });

      // 3. Баннер автоматически скроется т.к. isOffline станет false

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
    <View style={{
      backgroundColor: '#f59e0b',
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>{getBannerEmoji()}</Text> {/* <- Изменено */}
        <Text style={{ color: 'white', fontWeight: '500', flex: 1 }}>
          {getBannerMessage()} {/* <- Изменено */}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleRetry}
        disabled={isChecking}
        style={{
          backgroundColor: '#d97706',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 4
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
          {isChecking ? 'Проверка...' : 'ПОВТОРИТЬ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};