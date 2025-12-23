// src/components/home/HomeScreenEmpty.tsx
import React from 'react';
import { View } from 'react-native';
import { OfflineBanner } from '@/src/components/shared/OfflineBanner';
import { EmptyState } from '@/src/components/shared/EmptyState';
import { HomeScreenCachedContent } from './HomeScreenCachedContent';

interface HomeScreenEmptyProps {
  // Состояния
  isOffline?: boolean;
  displayType?: 'cached' | 'fresh' | 'no-data';
  
  // Пропсы для кэшированного контента
  cachedContentProps?: any;
  
  // Функции
  onRetry: () => void;
}

export const HomeScreenEmpty: React.FC<HomeScreenEmptyProps> = ({
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
      <EmptyState 
        type="no-data"
        message="Нет данных о погоде"
        onRetry={onRetry}
      />
    </View>
  );
};