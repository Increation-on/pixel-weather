// app/hooks/useFirebaseMessaging.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export const useFirebaseMessaging = () => {
  useEffect(() => {
    console.log('🚀 Настройка обработчиков Firebase Messaging...');

    // 1. Обработчик для foreground сообщений
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('📨 [FIREBASE] Data-сообщение получено в foreground');
      
      const data = remoteMessage.data;
      
      if (data) {
        // Безопасное извлечение строковых значений
        const title = typeof data.title === 'string' ? data.title : 'Погодное оповещение';
        const body = typeof data.body === 'string' ? data.body : 'Новое обновление';
        const sound = typeof data.sound === 'string' ? data.sound : 'default';

        const channelId = typeof data.channel_id === 'string' 
          ? data.channel_id 
          : (typeof data.android_channel_id === 'string' 
            ? data.android_channel_id 
            : 'pixel_weather_default');
        
        console.log('📝 Заголовок:', title);
        console.log('📝 Текст:', body);
        console.log('🎯 Канал:', channelId);
        console.log('📊 Все данные:', JSON.stringify(data, null, 2));
        
        // Отображаем уведомление через Notifee
        try {
          await notifee.displayNotification({
            title: title,
            body: body,
            data: data,
            android: {
              channelId: channelId,
              importance: (data.priority === 'max' || channelId.includes('high')) 
                ? AndroidImportance.HIGH 
                : AndroidImportance.DEFAULT,
              pressAction: {
                id: 'default',
                launchActivity: 'default',
              },
              sound:  sound,
            },
          });
          console.log(`✅ Notifee отобразил уведомление в канале: ${channelId}`);
        } catch (error) {
          console.error('❌ Ошибка Notifee:', error);
          console.error('Детали ошибки:', JSON.stringify(error, null, 2));
        }
      }
    });

    // 2. Фоновый обработчик
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🌙 [FIREBASE] Сообщение в фоне:', remoteMessage.data);
      const data = remoteMessage.data;
      
      if (data) {
        const title = typeof data.title === 'string' ? data.title : 'Погодное оповещение';
        const body = typeof data.body === 'string' ? data.body : 'Новое обновление';
        const channelId = typeof data.channel_id === 'string' 
          ? data.channel_id 
          : (typeof data.android_channel_id === 'string' 
            ? data.android_channel_id 
            : 'pixel_weather_default');
        
        await notifee.displayNotification({
          title: title,
          body: body,
          data: data,
          android: {
            channelId: channelId,
          },
        });
      }
      return Promise.resolve();
    });

    // 3. При открытии приложения по уведомлению
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('📱 Приложение открыто из уведомления:', remoteMessage.data);
      }
    });

    // 4. Запрашиваем разрешения для Android 13+
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await notifee.requestPermission();
          console.log('✅ Разрешения Notifee запрошены');
        } catch (error) {
          console.log('⚠️ Ошибка разрешений Notifee:', error);
        }
      }
    };

    requestPermissions();

    console.log('✅ Обработчики Firebase настроены');

    return unsubscribe;
  }, []);

  // Функция для получения токена
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      return null;
    }
  };

  return {
    getFCMToken,
  };
};