import { useEffect } from 'react';
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
import { registerBackgroundTask } from '@/src/api/services/BackgroundWeatherService';
import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
import '../global.css';
import * as SplashScreenExpo from 'expo-splash-screen';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as BackgroundTask from 'expo-background-task';
import { NativeModules } from 'react-native';

SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  // ⭐ ТОЛЬКО ОДИН useEffect
  useEffect(() => {
    const initApp = async () => {
      if (fontsLoaded || fontError) {
        console.log('🟢 Шрифты загружены, начинаем инициализацию...');
        
        try {
          // 1. Проверяем NativeModules
          console.log('📱 NativeModules:', Object.keys(NativeModules));
          console.log('📱 Всего модулей:', Object.keys(NativeModules).length);
          
          // 2. Проверяем TaskManager
          console.log('📋 TaskManager доступен:', !!TaskManager);
          
          // 3. Проверяем BackgroundFetch
          console.log('🔄 BackgroundFetch доступен:', !!BackgroundFetch);
          if (BackgroundFetch && BackgroundFetch.getStatusAsync) {
            try {
              const status = await BackgroundFetch.getStatusAsync();
              console.log(`📱 BackgroundFetch статус: ${status}`);
            } catch (e) {
              console.log('📱 Ошибка получения статуса BackgroundFetch:', e);
            }
          }
          
          // 4. Проверяем BackgroundTask
          console.log('🎯 BackgroundTask доступен:', !!BackgroundTask);
          
          // 5. Инициализируем сервисы
          console.log('🔄 Инициализируем BackgroundFetch задачу...');
          await registerBackgroundTask();
          
          console.log('🔔 Инициализируем уведомления...');
          await WeatherNotificationService.initialize();
          
          console.log('✅ Все сервисы инициализированы');
          
        } catch (error: any) {
          console.log('🔴 Ошибка инициализации:', error?.message);
        }
        
        // Скрываем сплеш
        setTimeout(() => {
          SplashScreenExpo.hideAsync();
        }, 1000);
      }
    };
    
    initApp();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SettingsProvider>
      <NetworkProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <Head>
              <link rel="icon" href="/favicon.ico" />
              <link rel="apple-touch-icon" href="/icon.png" />
              <meta name="theme-color" content="#1a1f2e" />
              <meta name="description" content="Пиксельное погодное приложение в ретро-стиле" />
              <title>Pixel Weather</title>
            </Head>

            <ThemeWrapper>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  gestureEnabled: true,
                }}
              />
            </ThemeWrapper>
          </QueryClientProvider>
        </ToastProvider>
      </NetworkProvider>
    </SettingsProvider>
  );
}