import { useState, useCallback } from 'react';
import { useWeather } from "./useWeather";
import { useLocationManager } from './useLocationManager';
import { useNetwork } from '../providers/NetworkProvider';
import { weatherCache } from '../utils/cache';
import { CitySearchResult } from '../api/services/city-search.service';

export const useHomeScreenData = () => {
  // 🎯 Состояния UI
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cachedWeather, setCachedWeather] = useState<any>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  
  // 🎯 Внешние хуки
  const { isOffline } = useNetwork();
  
  // 🎯 Логика местоположения
  const {
    coordinates,
    userCity,
    userCountry,
    isLoading: isLoadingLocation,
    isFetching: isFetchingLocation,
    isGeocoding,
    isLoadingStorage,
    locationError,
    locationSource,
    handleRefreshLocation,
    setManualCity,
    getLocationSubtitle,
  } = useLocationManager();

  // 🎯 Логика погоды
  const { 
    data, 
    isLoading: isLoadingWeather, 
    error, 
    refetch: refetchWeather,
    isRefetching: isRefetchingWeather 
  } = useWeather(
    coordinates?.lat || 55.7558,
    coordinates?.lon || 37.6173,
  );

  // 🎯 Загружаем кэш при инициализации
  const loadCachedWeather = useCallback(async () => {
  // Если нет координат — ничего не делаем
  if (!coordinates) {
    console.log('⚠️ Нет координат, кэш не загружается');
    return;
  }

  try {
    const cache = await weatherCache.get(coordinates.lat, coordinates.lon);
    if (cache) {
      setCachedWeather(cache.data);
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке кэша:', error);
  }
}, [coordinates]);

  // 🎯 Получаем отформатированное название текущего города
  const getCurrentCityDisplay = useCallback((): string => {
    if (userCity && userCountry) return `${userCity}, ${userCountry}`;
    if (userCity) return userCity;
    return 'Город не выбран';
  }, [userCity, userCountry]);

  // 🎯 Определяем, что показывать
  const getDisplayData = () => {
    // Если оффлайн и есть кэш - показываем кэш
    if (isOffline && cachedWeather) {
      return {
        type: 'cached' as const,
        data: cachedWeather,
        coordinates,
        userCity,
        userCountry,
        locationSource,
      };
    }
    
    // Если есть свежие данные
    if (data) {
      return {
        type: 'fresh' as const,
        data,
        coordinates,
        userCity,
        userCountry,
        locationSource,
      };
    }
    
    // Если нет данных
    return {
      type: 'no-data' as const,
      data: null,
      coordinates,
      userCity,
      userCountry,
      locationSource,
    };
  };

  // 🎯 Определяем состояние загрузки
  const getLoadingState = () => {
    return {
      isLoading: isLoadingLocation || isGeocoding || isLoadingStorage,
      isLoadingWeather,
      isRefetchingWeather,
      isFetchingLocation,
      isGeocoding,
      isLoadingStorage,
    };
  };

  // 🎯 Обработчик выбора города
  const handleCitySelect = useCallback(async (city: CitySearchResult) => {
    try {
      await setManualCity(city);
      setIsSearchVisible(false);
    } catch (error) {
      console.error('❌ Ошибка при выборе города:', error);
      throw error; // Пробрасываем дальше для обработки в UI
    }
  }, [setManualCity]);

  return {
    // Состояния UI
    isSearchVisible,
    setIsSearchVisible,
    refreshing,
    setRefreshing,
    cachedWeather,
    setCachedWeather,
    lastRefreshTime,
    setLastRefreshTime,
    
    // Данные
    ...getDisplayData(),
    ...getLoadingState(),
    
    // Ошибки
    locationError,
    weatherError: error,
    
    // Функции
    handleRefreshLocation,
    refetchWeather,
    loadCachedWeather,
    getCurrentCityDisplay,
    handleCitySelect,
    getLocationSubtitle,
  };
};