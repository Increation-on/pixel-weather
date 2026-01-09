// src/hooks/useWeatherOnAppResume.ts
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Только мониторинг состояния приложения
 * НЕ проверяет погоду при открытии!
 */
export const useWeatherOnAppResume = () => {
  const appState = useRef(AppState.currentState);
  
  useEffect(() => {
    console.log('📱 Монитор состояния приложения запущен');
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // ТОЛЬКО логируем, без проверки погоды
      console.log(`📱 Состояние приложения: ${appState.current} → ${nextAppState}`);
      
      // Можно добавить логику для других целей, но НЕ для погоды
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
      console.log('📱 Монитор состояния остановлен');
    };
  }, []);
};