import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClientProvider } from '@tanstack/react-query';

// 🚀 Наши сервисы — ТОЛЬКО pushTokenService!
import { pushTokenService } from '@/src/api/services/pushTokenService';
// 🚫 УДАЛЯЕМ: import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
// 🚫 УДАЛЯЕМ: import { registerBackgroundTask } from '@/src/api/services/BackgroundWeatherService';

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

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;

    const initializeApp = async () => {
      console.log('🚀 Инициализация приложения...');

      try {
        // 🚫 УДАЛЯЕМ: await WeatherNotificationService.initialize();
        // 🚫 УДАЛЯЕМ: await registerBackgroundTask();

        // Получаем токен и регистрируем устройство
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          console.log('📱 Expo Push Token:', token);
          
          await AsyncStorage.setItem('expo_push_token', token);
          
          // ✅ Отправляем токен на сервер
          await pushTokenService.sendToken(token);
        }

        // Слушаем уведомления
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('📨 Получено уведомление:', notification.request.content.title);
        });

        // Слушаем нажатия
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('👉 Нажатие на уведомление');
        });

        await SplashScreenExpo.hideAsync();
        console.log('✅ Инициализация завершена');

      } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        await SplashScreenExpo.hideAsync();
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