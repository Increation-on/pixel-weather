import { useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { useNetwork } from '../providers/NetworkProvider';

export const useHomeScreenActions = (homeData: any) => {
  const { showToast } = useToast();
  const { checkNetwork } = useNetwork();
  
  const {
    setRefreshing,
    handleRefreshLocation,
    refetchWeather,
    setLastRefreshTime,
    handleCitySelect: originalHandleCitySelect,
  } = homeData;

  // 🎯 Функция для pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (homeData.refreshing) return;
    
    setRefreshing(true);
    
    try {
      // Сначала проверяем сеть
      const isOnline = await checkNetwork();
      
      if (!isOnline) {
        showToast({
          message: 'Нет подключения к интернету. Используются кэшированные данные.',
          type: 'warning',
          duration: 3000
        });
        return;
      }
      
      // Обновляем и геолокацию, и погоду
      await Promise.all([
        handleRefreshLocation(),
        refetchWeather()
      ]);
      
      setLastRefreshTime(Date.now());
      
      showToast({
        message: 'Данные обновлены',
        type: 'success',
        duration: 2000
      });
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      showToast({
        message: 'Ошибка при обновлении данных',
        type: 'error',
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  }, [homeData.refreshing, checkNetwork, showToast, handleRefreshLocation, refetchWeather, setRefreshing, setLastRefreshTime]);

  // 🎯 Обработчик выбора города с тостом
  const handleCitySelect = useCallback(async (city: any) => {
    try {
      await originalHandleCitySelect(city);
      
      // Показываем успешное уведомление
      showToast({
        message: `Город "${city.city}" выбран`,
        type: 'success',
        duration: 3000
      });
      
    } catch (error) {
      // Toast уже показывается внутри setManualCity или покажем здесь
      console.error('❌ Ошибка при выборе города:', error);
      throw error;
    }
  }, [originalHandleCitySelect, showToast]);

  return {
    handleRefresh,
    handleCitySelect,
    checkNetwork,
  };
};