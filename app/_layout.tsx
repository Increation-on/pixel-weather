// app/_layout.tsx - ДОБАВЛЯЕМ SettingsProvider
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { SplashScreen } from 'expo-router';
import Head from 'expo-router/head';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@/src/providers/ToastProvider';
import { NetworkProvider } from '@/src/providers/NetworkProvider';
import { SettingsProvider } from '@/src/contexts/SettingContext';
import { queryClient } from '@/src/lib/react-query';
import { registerBackgroundTask } from '@/src/api/services/BackgroundWeatherService';
import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const initServices = async () => {
      if (fontsLoaded) {
        try {
          // Регистрируем фоновую задачу
          await registerBackgroundTask();
          // Инициализируем уведомления
          await WeatherNotificationService.initialize();
        } catch (error) {
          console.log('⚠️ Ошибка инициализации сервисов:', error);
        }
      }
    };

    initServices();
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SettingsProvider> {/* ← ОБОРАЧИВАЕМ ВСЁ В SettingsProvider */}
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
            
            <StatusBar style="light" />
            
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </QueryClientProvider>
        </ToastProvider>
      </NetworkProvider>
    </SettingsProvider>
  );
}