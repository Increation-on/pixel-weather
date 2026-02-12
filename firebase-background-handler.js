// firebase-background-handler.js - В КОРНЕ ПРОЕКТА
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🔴 [FCM BACKGROUND] Регистрирую обработчик...');

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🎉 УРА! ФОН РАБОТАЕТ! Данные:', remoteMessage.data);
  
  // Сохраняем факт получения для тестирования
  await AsyncStorage.setItem('FINAL_BACKGROUND_TEST', 
    JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      data: remoteMessage.data
    })
  );

  // Показываем уведомление в любом случае
  await notifee.displayNotification({
    title: remoteMessage.data?.title || 'Фоновое уведомление',
    body: remoteMessage.data?.body || 'Сообщение получено в фоне',
    data: remoteMessage.data,
    android: {
      channelId: 'pixel_weather_default',
      smallIcon: 'notification_icon',
      pressAction: {
        id: 'default',
      },
    },
  });
  
  return Promise.resolve();
});

console.log('🔴 [FCM BACKGROUND] Обработчик зарегистрирован!');