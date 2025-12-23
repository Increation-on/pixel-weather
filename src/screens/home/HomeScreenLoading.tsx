// src/components/home/HomeScreenLoading.tsx
import React from 'react';
import { View } from 'react-native';
import { OfflineBanner } from '@/src/components/shared/OfflineBanner';
import { EmptyState } from '@/src/components/shared/EmptyState';
import { HomeScreenCachedContent } from './HomeScreenCachedContent';
import { LoadingState } from '@/src/components/shared/LoadingState';

interface HomeScreenLoadingProps {
  // Состояния загрузки
  isLoading: boolean;
  isGeocoding: boolean;
  isLoadingStorage: boolean;
  isLoadingWeather: boolean;
  
  // Данные
  userCity?: string | null;
  isOffline?: boolean;
  displayType?: 'cached' | 'fresh' | 'no-data';
  displayData?: any;
  
  // Пропсы для кэшированного контента
  cachedContentProps?: any;
  
  // Функции
  onRetry?: () => void;
}

export const HomeScreenLoading: React.FC<HomeScreenLoadingProps> = ({
  isLoading,
  isGeocoding,
  isLoadingStorage,
  isLoadingWeather,
  userCity,
  isOffline,
  displayType,
  displayData,
  cachedContentProps,
  onRetry,
}) => {
  // Если оффлайн и есть кэш - показываем кэш
  if (isOffline && displayType === 'cached' && cachedContentProps) {
    return <HomeScreenCachedContent {...cachedContentProps} />;
  }

  // Если оффлайн без кэша
  if (isOffline) {
    return (
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <EmptyState 
          type="offline"
          message="Нет подключения к интернету"
          onRetry={onRetry}
        />
      </View>
    );
  }

  // Основная загрузка
  const getLoadingMessage = () => {
    if (isLoadingStorage) return 'Загружаем сохраненный город...';
    if (isGeocoding) return 'Определяем местоположение...';
    if (isLoadingWeather) return 'Загружаем погоду...';
    if (isLoading) return 'Определяем ваше местоположение...';
    return 'Загрузка...';
  };

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <LoadingState message={getLoadingMessage()} />
    </View>
  );
};