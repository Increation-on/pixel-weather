// app/services/firebase-messaging.ts
import messaging from '@react-native-firebase/messaging';

class FirebaseMessagingService {
  // Запрос разрешений
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔔 Запрашиваю разрешения FCM...');
      
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log(`📊 Статус разрешений: ${enabled ? '✅ Granted' : '❌ Denied'}`);
      return enabled;
    } catch (error) {
      console.error('❌ Ошибка запроса разрешений FCM:', error);
      throw error;
    }
  }

  // Получение FCM токена
  static async getFCMToken(): Promise<string> {
    try {
      console.log('🔑 Получаю FCM токен...');
      
      const token = await messaging().getToken();
      
      if (!token) {
        throw new Error('Пустой токен получен от Firebase');
      }
      
      console.log('✅ FCM токен получен');
      return token;
    } catch (error) {
      console.error('❌ Ошибка получения FCM токена:', error);
      throw error;
    }
  }

  // Настройка обработчиков уведомлений
  static setupNotificationHandlers() {
    console.log('🎯 Настройка обработчиков уведомлений...');
    
    // Фоновые сообщения
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📱 Уведомление в фоне:', remoteMessage);
    });

    // Сообщения на переднем плане
    messaging().onMessage(async remoteMessage => {
      console.log('📱 Уведомление на переднем плане:', remoteMessage);
    });

    // Нажатие на уведомление
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🖱️ Нажато уведомление:', remoteMessage);
    });

    // Проверяем, было ли открыто приложение по уведомлению
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('📱 Приложение открыто по уведомлению:', remoteMessage);
      }
    });
  }
}

export default FirebaseMessagingService;