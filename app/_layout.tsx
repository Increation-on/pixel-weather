// app/_layout.tsx
import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import Head from 'expo-router/head';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ToastProvider } from '@/src/providers/ToastProvider';
import { NetworkProvider } from '@/src/providers/NetworkProvider';
import { SettingsProvider } from '@/src/contexts/SettingContext';
import ThemeWrapper from '@/src/components/ThemeWrapper';
import { queryClient } from '@/src/lib/react-query';
import '../global.css';
import * as SplashScreenExpo from 'expo-splash-screen';

// 🔔 Уведомления
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚀 Наши сервисы — ТОЛЬКО pushTokenService!
import { pushTokenService } from '@/src/api/services/pushTokenService';
// 🚫 УДАЛЯЕМ: import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
// 🚫 УДАЛЯЕМ: import { registerBackgroundTask } from '@/src/api/services/BackgroundWeatherService';

SplashScreenExpo.preventAutoHideAsync();

// Конфигурация уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

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
    };

    initializeApp();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <NetworkProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <Head>
              <title>Pixel Weather</title>
              <meta name="theme-color" content="#1a1f2e" />
            </Head>
            <ThemeWrapper>
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            </ThemeWrapper>
          </QueryClientProvider>
        </ToastProvider>
      </NetworkProvider>
    </SettingsProvider>
  );
}

/**
 * 📱 Регистрация для получения Expo Push Token
 */
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('📱 Пуш-уведомления только на реальных устройствах');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.error('❌ Нет разрешения на уведомления');
    return null;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('❌ Нет projectId в app.config.js');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return token;
  } catch (error) {
    console.error('❌ Ошибка получения токена:', error);
    return null;
  }
}