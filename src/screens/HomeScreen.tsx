import { useState, useEffect } from 'react';
import { useWeather } from "../hooks/useWeather";
import { useLocationManager } from '../hooks/useLocationManager';
import { View, TouchableOpacity, Text, Alert } from "react-native";

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
import { CitySearch } from '../components/search/CitySeacrh';
import { CitySearchResult } from '../api/services/city-search.service';

export const HomeScreen = () => {
  // 🎯 Состояние для модалки поиска
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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
  const { data, isLoading: isLoadingWeather, error, refetch: refetchWeather } = useWeather(
    coordinates?.lat || 55.7558,
    coordinates?.lon || 37.6173
  );

  // 🎯 Обновление погоды при изменении координат
  useEffect(() => {
    console.log('=== COORDINATES EFFECT FIRED ===');
  console.log('coordinates:', coordinates);
  console.log('coordinates?.lat:', coordinates?.lat);
  console.log('coordinates?.lon:', coordinates?.lon);
    if (coordinates) {
      console.log('🔄 Координаты изменились, обновляем погоду...');
      console.log('🔄 Запускаю refetchWeather...');
      refetchWeather();
    }
  }, [coordinates?.lat, coordinates?.lon]);

  // 🎯 Обработчик выбора города
  const handleCitySelect = async (city: CitySearchResult) => {
  try {
    console.log('🎯 Выбран город:', city.city);
    
    await setManualCity(city);
    console.log('✅ setManualCity завершен');
    
    // useEffect с coordinates должен сработать автоматически
    // потому что setCoordinates был вызван внутри setManualCity
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить выбранный город.');
  }
};

  // 🎯 Получаем отформатированное название текущего города
  const getCurrentCityDisplay = (): string => {
    if (userCity && userCountry) return `${userCity}, ${userCountry}`;
    if (userCity) return userCity;
    return 'Город не выбран';
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
    <View style={{ flex: 1, padding: 20 }}>
      {/* Кнопка открытия поиска городов */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
        }}
        onPress={() => setIsSearchVisible(true)}
      >
        <Text style={{ fontSize: 18, marginRight: 10 }}>🔍</Text>
        <Text style={{ color: '#64748b', fontSize: 16, flex: 1 }}>
          {userCity ? `Искать другой город` : 'Выбрать город вручную'}
        </Text>
        <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>
          Поиск
        </Text>
      </TouchableOpacity>

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
        isRefreshing={isLoadingLocation || isFetchingLocation || isGeocoding}
        isGeocoding={isGeocoding}
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

      {/* Модалка поиска городов */}
      <CitySearch
        visible={isSearchVisible}
        onCitySelect={handleCitySelect}
        onClose={() => setIsSearchVisible(false)}
        currentCity={getCurrentCityDisplay()}
      />
    </View>
  );
};