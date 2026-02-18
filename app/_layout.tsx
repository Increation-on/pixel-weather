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
import { useNotificationSetup } from '@/src/hooks/useNotificationSetup';
import '../global.css';
import * as SplashScreenExpo from 'expo-splash-screen';

// Запрещаем скрытие сплеш-скрина пока не загрузится всё
SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  // 🎯 Загружаем шрифты
  const [fontsLoaded] = useFonts({
    'PressStart2P-Regular': PressStart2P_400Regular,
  });

  // 🚀 Подключаем уведомления
  useNotificationSetup(fontsLoaded);

  // Пока шрифты не загружены — ничего не рендерим
  if (!fontsLoaded) {
    return null;
  }

  // ✅ Всё готово — рендерим приложение
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