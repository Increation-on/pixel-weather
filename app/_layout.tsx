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
import { NativeModules } from 'react-native';
import { Button, View } from 'react-native';
// import * as BackgroundTask from 'expo-background-task';
import * as BackgroundTask from './temp-background-task.js'; 









// DEBUG
console.log('=== NATIVE MODULES DEBUG ===');
console.log('Все модули:', Object.keys(NativeModules).sort());
console.log('ExpoBackgroundTask есть?', 'ExpoBackgroundTask' in NativeModules);
console.log('ExpoBackgroundTask объект:', NativeModules.ExpoBackgroundTask);
console.log('Методы модуля:', NativeModules.ExpoBackgroundTask ? Object.keys(NativeModules.ExpoBackgroundTask) : 'нет');
// Проверим другие экспо-модули
const expoModules = Object.keys(NativeModules).filter(key => key.includes('Expo'));
console.log('Все Expo модули:', expoModules);
console.log('TaskManager есть?', 'ExpoTaskManager' in NativeModules);
import * as TaskManager from 'expo-task-manager';
console.log('TaskManager работает?', typeof TaskManager.defineTask === 'function');
console.log('=== ПОДРОБНЫЙ АНАЛИЗ ===');
const allModules = NativeModules;
for (const key in allModules) {
  console.log(`Модуль "${key}":`, allModules[key]);
}
console.log('=== СТРУКТУРА NativeModules ===');
console.log('NativeModules сам объект:', NativeModules);
console.log('typeof NativeModules:', typeof NativeModules);
console.log('Количество ключей:', Object.keys(NativeModules).length);
// Проверяем конкретно
console.log('ExpoBackgroundTask через точку:', NativeModules.ExpoBackgroundTask);
console.log('ExpoTaskManager через точку:', NativeModules.ExpoTaskManager);
console.log('=== НЕПЕРЕЧИСЛИМЫЕ СВОЙСТВА ===');
console.log('=== ПРОТОТИП NativeModules ===');
console.log('NativeModules.__proto__:', NativeModules.__proto__);
console.log('NativeModules.constructor:', NativeModules.constructor);
console.log('NativeModules.constructor.name:', NativeModules.constructor?.name);
console.log('=== МОДУЛИ КОТОРЫЕ НЕ NULL ===');
for (const key in NativeModules) {
  if (NativeModules[key] !== null) {
    console.log(`${key}:`, NativeModules[key]);
  }
}
// Или попробуем получить все свойства другим способом
console.log('=== ВСЕ СВОЙСТВА (включая скрытые) ===');
const allProps = [];
for (let i = 0; i < 100; i++) {
  try {
    const prop = Object.getOwnPropertyNames(NativeModules)[i];
    if (prop) {
      allProps.push(prop);
      console.log(`${prop}:`, NativeModules[prop]);
    }
  } catch (e) {
    break;
  }
}
console.log('Найдено свойств:', allProps.length);









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
  // useEffect(() => {
  //   const initServices = async () => {
  //     if (fontsLoaded) {
  //       try {
  //         await registerBackgroundTask();
  //         await WeatherNotificationService.initialize();
  //       } catch (error) {
  //         console.log('⚠️ Ошибка инициализации сервисов:', error);
  //       }
  //     }
  //   };

  //   initServices();
  // }, [fontsLoaded]);

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
      <View style={{ position: 'absolute', top: 50, right: 20 }}>
  <Button 
    title="Test Background" 
    onPress={async () => {
      console.log('Testing background task...');
      try {
        // const result = await BackgroundTask.triggerTaskWorkerForTestingAsync();
        // console.log('Trigger result:', result);
      } catch (error) {
        console.error('Trigger failed:', error);
      }
    }}
  />
</View>
    </SettingsProvider>
  );
}