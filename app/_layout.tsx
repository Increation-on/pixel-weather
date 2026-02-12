import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClientProvider } from '@tanstack/react-query';

import { pushTokenService } from '@/src/api/services/pushTokenService';
import { queryClient } from '@/src/lib/react-query';
import { SettingsProvider } from '@/src/contexts/SettingContext';
import { NetworkProvider } from '@/src/providers/NetworkProvider';
import { ToastProvider } from '@/src/providers/ToastProvider';
import ThemeWrapper from '@/src/components/ThemeWrapper';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <NetworkProvider>
          <ToastProvider>
            <ThemeWrapper>
              <LayoutContent />
            </ThemeWrapper>
          </ToastProvider>
        </NetworkProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

function LayoutContent() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const registerDevice = async () => {
      if (!Device.isDevice) {
        console.log('📱 Пуш только на реальных устройствах');
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('🔕 Нет разрешения на уведомления');
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('❌ Нет projectId');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await AsyncStorage.setItem('expo_push_token', token);
      
      await pushTokenService.registerDevice(token);
    };

    registerDevice();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Получен PUSH:', notification.request.content.title);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Нажатие на PUSH');
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}