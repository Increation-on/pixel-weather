import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import Head from 'expo-router/head';
import { QueryClientProvider } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import { ToastProvider } from '@/src/providers/ToastProvider';
import { NetworkProvider } from '@/src/providers/NetworkProvider';
import { SettingsProvider } from '@/src/contexts/SettingContext';
import ThemeWrapper from '@/src/components/ThemeWrapper';
import { queryClient } from '@/src/lib/react-query';
import '../global.css';
import * as SplashScreenExpo from 'expo-splash-screen';
import { View, AppState, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  const initializedRef = useRef(false);

  // ========== Android 13+ разрешения ==========
  useEffect(() => {
    const requestAndroid13Permission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Разрешение на уведомления',
              message: 'Приложению нужно разрешение для показа уведомлений',
              buttonNeutral: 'Спросить позже',
              buttonNegative: 'Отмена',
              buttonPositive: 'OK',
            }
          );
          console.log('Android 13+ разрешение:', granted);
        } catch (err) {
          console.warn('Ошибка запроса разрешения:', err);
        }
      }
    };

    requestAndroid13Permission();
  }, []);

  // В RootLayout.tsx ОСТАВЬТЕ ТОЛЬКО ЭТО:
useEffect(() => {
  console.log('=== СОЗДАНИЕ КАНАЛОВ NOTIFEE ===');

  const createNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('🔔 Создаю каналы уведомлений через Notifee...');
        
        // Запрашиваем разрешения
        await notifee.requestPermission();
        
        // Создаем каналы
        await notifee.createChannel({
          id: 'pixel_weather_high',
          name: '🚨 Экстренные погодные оповещения',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 200, 300, 200],
          lights: true,
          lightColor: '#FF3B30',
          bypassDnd: true,
          description: 'Критические погодные предупреждения',
        });
        console.log('✅ Канал создан: pixel_weather_high (HIGH)');

        await notifee.createChannel({
          id: 'pixel_weather_default',
          name: '📊 Погодные обновления',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 200, 300, 200],
          lights: true,
          lightColor: '#007AFF',
          description: 'Ежедневные прогнозы и обновления',
        });
        console.log('✅ Канал создан: pixel_weather_default (DEFAULT)');

        await notifee.createChannel({
          id: 'pixel_weather_low',
          name: '🌤️ Тихие обновления',
          importance: AndroidImportance.LOW,
          vibration: false,
          lights: false,
          description: 'Фоновые обновления без звука',
        });
        console.log('✅ Канал создан: pixel_weather_low (LOW)');
        
        console.log('🎉 Все каналы Notifee созданы успешно!');
        
      } catch (channelError) {
        console.error('❌ Ошибка создания каналов Notifee:', channelError);
      }
    }
  };

  createNotificationChannel();
}, []); 

  // ========== Инициализация приложения ==========
  useEffect(() => {
    if ((fontsLoaded || fontError) && !initializedRef.current) {
      initializedRef.current = true;
      
      const initializeApp = async () => {
        try {
          console.log('🚀 Инициализация приложения...');

          // Получаем FCM токен
          const token = await messaging().getToken();
          if (token) {
            console.log(`✅ Firebase токен: ${token.substring(0, 20)}...`);
            
            // Проверяем канал после получения токена
            if (Platform.OS === 'android') {
              console.log('🔍 Для проверки канала выполните:');
              console.log('adb shell dumpsys notification | findstr pixel_weather');
              console.log('📱 Или проверьте вручную в Настройки → Приложения → Pixel Weather → Уведомления');
            }
          }

        } catch (error) {
          console.error('❌ Ошибка инициализации:', error);
        } finally {
          await SplashScreenExpo.hideAsync();
        }
      };

      initializeApp();
    }
  }, [fontsLoaded, fontError]);

  // ========== AppState монитор ==========
  useEffect(() => {
    let backgroundStartTime: number | null = null;

    const handleAppStateChange = (state: string) => {
      const prevState = AppState.currentState;
      
      if (prevState !== state) {
        console.log(`📱 AppState: ${prevState} → ${state}`);
      }

      if (state === 'background') {
        backgroundStartTime = Date.now();
      }

      if (state === 'active' && backgroundStartTime) {
        const timeInBackground = Date.now() - backgroundStartTime;
        console.log(`⏱️ В фоне: ${Math.floor(timeInBackground / 1000)}с`);
        backgroundStartTime = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
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
              {/* Ссылка на тестовый экран - только в DEV */}
              {__DEV__ && (
                <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 9999 }}>
                  <Link 
                    href="/test-firebase" 
                    style={{ 
                      color: '#4ecdc4',
                      backgroundColor: 'rgba(26, 31, 46, 0.9)',
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#4ecdc4',
                      fontFamily: 'PressStart2P-Regular',
                      fontSize: 10,
                    }}
                  >
                    🔥 TEST FIREBASE
                  </Link>
                </View>
              )}

              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              />
            </ThemeWrapper>
          </QueryClientProvider>
        </ToastProvider>
      </NetworkProvider>
    </SettingsProvider>
  );
}