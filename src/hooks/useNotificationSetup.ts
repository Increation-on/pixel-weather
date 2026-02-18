import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushTokenService } from '@/src/api/services/pushTokenService';
import * as SplashScreenExpo from 'expo-splash-screen';

// Конфигурация уведомлений (можно оставить здесь или вынести)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationSetup = (fontsLoaded: boolean) => {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;

    const initializeNotifications = async () => {
      console.log('🚀 Инициализация уведомлений...');

      try {
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          console.log('📱 Expo Push Token:', token);
          await AsyncStorage.setItem('expo_push_token', token);
          await pushTokenService.sendToken(token);
        }

        // Слушатели
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('📨 Получено уведомление:', notification.request.content.title);
        });

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

    initializeNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [fontsLoaded]);
};

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