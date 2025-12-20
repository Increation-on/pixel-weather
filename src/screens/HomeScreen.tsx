// HomeScreen.tsx (сильно упрощенный)
import { useState, useEffect } from 'react';
import { useWeather } from "../hooks/useWeather";
import { useLocationManager } from '../hooks/useLocationManager';
import { View, Alert } from "react-native";

// Импорты компонентов
import { LocationHeader } from '../components/location/LocationHeader';
import { LocationActions } from '../components/location/LocationActions';
import { LocationErrorAlert } from '../components/location/LocationErrorAlert';
import { WeatherCard } from '../components/weather/WeatherCard';
import { ForecastLink } from '../components/navigation/ForeCastLink';
import { DataSourceInfo } from '../components/shared/DataSourceInfo';
import { LoadingState } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';

export const HomeScreen = () => {
  // 🎯 Логика местоположения
  const {
    coordinates,
    userCity,
    userCountry,
    isLoading: isLoadingLocation,
    isGeocoding,
    isLoadingStorage,
    locationError,
    locationSource,
    handleRefreshLocation,
    handleClearSavedLocation,
    getLocationSubtitle,
    
  } = useLocationManager();

  // 🎯 Логика погоды
  const { data, isLoading: isLoadingWeather, error, refetch: refetchWeather } = useWeather(
    coordinates?.lat || 55.7558,
    coordinates?.lon || 37.6173
  );

  // 🎯 Обновление погоды при изменении координат
  useEffect(() => {
    if (coordinates) {
      console.log('🔄 Координаты изменились, обновляем погоду...');
      refetchWeather();
    }
  }, [coordinates?.lat, coordinates?.lon]);

  // 🎯 Обработчик очистки с подтверждением
  const handleClearWithConfirmation = async () => {
    Alert.alert(
      'Очистить сохраненный город',
      'Вы уверены, что хотите очистить сохраненный город? Приложение снова определит ваше местоположение.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: handleClearSavedLocation,
        },
      ]
    );
  };

  // 🎯 Состояния загрузки
  if ((isLoadingLocation || isGeocoding || isLoadingStorage) && !userCity) {
    return (
      <LoadingState
        message={
          isLoadingStorage 
            ? 'Загружаем сохраненный город...' 
            : 'Определяем ваше местоположение...'
        }
      />
    );
  }

  if (isLoadingWeather) return <LoadingState message="Загружаем погоду..." />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <EmptyState message="Нет данных о погоде" />;

  // 🎯 Основной рендеринг
  return (
    <View style={{ padding: 20 }}>
      {/* Заголовок местоположения */}
      <LocationHeader
        city={userCity}
        country={userCountry}
        subtitle={getLocationSubtitle()}
        isSaved={!!userCity}
      />

      {/* Кнопки действий */}
      <LocationActions
        onRefresh={handleRefreshLocation}
        onClear={userCity ? handleClearWithConfirmation : undefined}
        isRefreshing={isLoadingLocation}
        isGeocoding={isGeocoding}
        hasSavedLocation={!!userCity}
      />

      {/* Ошибки геолокации */}
      <LocationErrorAlert
        error={locationError}
        fallbackCity={userCity}
        isLoading={isLoadingLocation}
      />

      {/* Карточка погоды */}
      <WeatherCard
        temperature={data.current.temperature}
        weatherDescription={data.current.weatherDescription}
        feelsLike={data.current.feelsLike}
        windSpeed={data.current.windSpeed}
        humidity={data.current.humidity}
      />

      {/* Ссылка на прогноз */}
      <ForecastLink />

      {/* Отладочная информация */}
      <DataSourceInfo
        source={data.metadata?.source || 'open-meteo'}
        coordinates={coordinates}
        city={userCity}
        country={userCountry}
        locationSource={locationSource}
      />
    </View>
  );
};