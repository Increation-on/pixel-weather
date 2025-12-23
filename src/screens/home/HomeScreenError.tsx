// src/components/home/HomeScreenError.tsx
import React from 'react';
import { View } from 'react-native';
import { OfflineBanner } from '@/src/components/shared/OfflineBanner';
import { ErrorState } from '@/src/components/shared/ErrorState';
import { HomeScreenCachedContent } from './HomeScreenCachedContent';

interface HomeScreenErrorProps {
  // Ошибка
  error: any;
  
  // Состояния
  isOffline?: boolean;
  displayType?: 'cached' | 'fresh' | 'no-data';
  
  // Пропсы для кэшированного контента
  cachedContentProps?: any;
  
  // Функции
  onRetry: () => void;
}

export const HomeScreenError: React.FC<HomeScreenErrorProps> = ({
  error,
  isOffline,
  displayType,
  cachedContentProps,
  onRetry,
}) => {
  // Если оффлайн и есть кэш - показываем кэш
  if (isOffline && displayType === 'cached' && cachedContentProps) {
    return <HomeScreenCachedContent {...cachedContentProps} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <ErrorState 
        message={error?.message || 'Произошла ошибка'}
        onRetry={onRetry}
      />
    </View>
  );
};