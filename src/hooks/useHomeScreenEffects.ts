import { useEffect } from 'react';
import { useNetwork } from '../providers/NetworkProvider';
import { useAppState } from '../hooks/useAppState';

export const useHomeScreenEffects = (homeData: any) => {
  const { isAppActive } = useAppState();
  const { checkNetwork } = useNetwork();
  
  const {
    loadCachedWeather,
    coordinates,
    isOffline,
    lastRefreshTime,
    setLastRefreshTime,
    refetchWeather,
  } = homeData;

  // 🎯 Загружаем кэш при монтировании
  useEffect(() => {
    loadCachedWeather();
  }, [loadCachedWeather]);

  // 🎯 Проверяем сеть при возвращении в приложение
  useEffect(() => {
    if (isAppActive) {
      console.log('📱 Приложение активно, проверяем сеть...');
      
      const performNetworkCheck = async () => {
        await checkNetwork();
      };
      
      performNetworkCheck();
    }
  }, [isAppActive, checkNetwork]);

  // 🎯 Обновление погоды при изменении координат
  useEffect(() => {
    if (coordinates?.lat && coordinates?.lon && !isOffline) {
      console.log('🔄 Координаты изменились, обновляем погоду...');
      
      const shouldRefresh = Date.now() - lastRefreshTime > 30000; // 30 секунд минимальный интервал
      
      if (shouldRefresh) {
        refetchWeather();
        setLastRefreshTime(Date.now());
      }
    }
  }, [coordinates?.lat, coordinates?.lon, refetchWeather, isOffline, lastRefreshTime, setLastRefreshTime]);
};