// app/_layout.tsx
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
import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  // Добавь в useEffect в _layout.tsx
useEffect(() => {
  if (fontsLoaded || fontError) {
    console.log('🔍 ТОЧНАЯ ПРОВЕРКА ОКРУЖЕНИЯ:');
    
    // 1. NativeModules
    const allModules = Object.keys(NativeModules);
    console.log('📱 Всего NativeModules:', allModules.length);
    
    // 2. Выводим ВСЕ модули
    allModules.forEach((module, index) => {
      console.log(`  ${index + 1}. ${module}`);
    });
    
    // 3. Проверяем PlatformConstants
    if (NativeModules.PlatformConstants) {
      console.log('📦 PlatformConstants:', NativeModules.PlatformConstants);
      console.log('📦 Имя приложения:', NativeModules.PlatformConstants.appName);
      console.log('📦 Версия реакта:', NativeModules.PlatformConstants.reactNativeVersion);
    }
    
    // 4. Проверяем I18nManager (должен быть в Development Build)
    if (NativeModules.I18nManager) {
      console.log('🌍 I18nManager найден → Development Build');
    } else {
      console.log('🌍 I18nManager не найден → возможно Expo Go');
    }
    
    // 5. Проверяем UIManager (должен быть)
    if (NativeModules.UIManager) {
      console.log('🎨 UIManager найден → Development Build');
    } else {
      console.log('🎨 UIManager не найден → Expo Go');
    }
  }
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