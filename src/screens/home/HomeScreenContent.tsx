// src/components/home/HomeScreenContent.tsx (переименовываем в FullWeatherContent или оставляем)
import React from 'react';
import { WeatherContent } from './WeatherConent';
import { LocationActions } from '@/src/components/location/LocationActions';
import { LocationErrorAlert } from '@/src/components/location/LocationErrorAlert';

interface HomeScreenContentProps {
  // Все пропсы как раньше, но теперь многие optional
  userCity?: string | null;
  userCountry?: string | null;
  displayData: any;
  coordinates?: { lat: number; lon: number } | null;
  locationSource?: string;
  
  isSearchVisible: boolean;
  setIsSearchVisible: (visible: boolean) => void;
  refreshing: boolean;
  isRefetchingWeather: boolean;
  
  // Опциональные (для расширенного режима)
  isLoading?: boolean;
  isFetchingLocation?: boolean;
  isGeocoding?: boolean;
  locationError?: any;
  
  // Функции
  handleRefresh: () => void;
  handleRefreshLocation?: () => void;
  getLocationSubtitle?: () => string;
  getCurrentCityDisplay: () => string;
  
  // Дополнительно
  isOffline?: boolean;
  subtitle?: string;
  showSearchButton?: boolean;
}

export const HomeScreenContent: React.FC<HomeScreenContentProps> = (props) => {
  const {
    isLoading,
    isFetchingLocation,
    isGeocoding,
    locationError,
    handleRefreshLocation,
    getLocationSubtitle,
    ...weatherContentProps
  } = props;

  const showLocationActions = isLoading !== undefined;
  const showLocationError = locationError !== undefined;

  return (
    <>
      <WeatherContent
        {...weatherContentProps}
        weatherData={props.displayData}
        onRefresh={props.handleRefresh}
        isRefetching={props.isRefetchingWeather}
        dataSource={props.displayData?.metadata?.source}
      />
      
      {/* Дополнительные компоненты только если нужны */}
      {showLocationActions && (
        <LocationActions
          onRefresh={handleRefreshLocation!}
          isRefreshing={isLoading || isFetchingLocation || isGeocoding}
          isGeocoding={isGeocoding}
        />
      )}
      
      {showLocationError && (
        <LocationErrorAlert
          error={locationError}
          fallbackCity={props.userCity}
          isLoading={isLoading}
        />
      )}
    </>
  );
};