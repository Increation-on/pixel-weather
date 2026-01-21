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

// ⭐ Импортируем правильную библиотеку
import * as SplashScreenExpo from 'expo-splash-screen';

// Настройка анимации сплеш-скрина
SplashScreenExpo.setOptions({
  duration: 1000,
  fade: true,
});

// Предотвращаем автоматическое скрытие
SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  // ⭐ ОДИН эффект для скрытия сплеша с логами
// ⭐ ОДИН эффект для скрытия сплеша с минимальным временем
useEffect(() => {
  if (fontsLoaded || fontError) {
    // Искусственная задержка: минимум 1 секунда сплеша
    const timer = setTimeout(() => {
      SplashScreenExpo.hideAsync();
    }, 2000);
    
    return () => clearTimeout(timer); // Очистка при размонтировании
  }
}, [fontsLoaded, fontError]);

  // ⭐ ОТДЕЛЬНЫЙ эффект для инициализации сервисов
  useEffect(() => {
    const initServices = async () => {
      if (fontsLoaded) {
        try {
          await registerBackgroundTask();
          await WeatherNotificationService.initialize();
        } catch (error) {
          console.log('⚠️ Ошибка инициализации сервисов:', error);
        }
      }
    };

    initServices();
  }, [fontsLoaded]);

  // ⭐ Условие рендера
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