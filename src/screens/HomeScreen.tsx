import { useState, useEffect, useCallback } from 'react';
import { useWeather } from "../hooks/useWeather";
import { useLocationManager } from '../hooks/useLocationManager';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text,
  RefreshControl,
  StyleSheet
} from "react-native";

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
import { OfflineBanner } from '../components/shared/OfflineBanner';
import { useToast } from '../hooks/useToast';
import { useNetwork } from '../providers/NetworkProvider';
import { useAppState } from '../hooks/useAppState';
import { weatherCache } from '../utils/cache';
import { useHealthCheck } from '../hooks/useHealthCheck';

export const HomeScreen = () => {
  // 🎯 Состояние для модалки поиска
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cachedWeather, setCachedWeather] = useState<any>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  
  // 🎯 Хуки
  const { showToast } = useToast();
  const { isOffline, checkNetwork } = useNetwork();
  const { isAppActive } = useAppState();

  // Инициализируем HealthCheck
  useHealthCheck();

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

  // 🎯 Загружаем кэш при монтировании
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cache = await weatherCache.get();
        if (cache) {
          console.log('💾 Загружен кэш:', cache.data.current.temperature + '°C');
          setCachedWeather(cache.data);
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке кэша:', error);
      }
    };
    loadCache();
  }, []);

  // 🎯 Проверяем сеть при возвращении в приложение
  useEffect(() => {
    if (isAppActive) {
      console.log('📱 Приложение активно, проверяем сеть...');
      
      // Проверяем сеть, но не обновляем данные автоматически
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
  }, [coordinates?.lat, coordinates?.lon, refetchWeather, isOffline, lastRefreshTime]);

  // 🎯 Обработчик выбора города
  const handleCitySelect = useCallback(async (city: CitySearchResult) => {
    try {
      console.log('🎯 Выбран город:', city.city);
      
      await setManualCity(city);
      console.log('✅ setManualCity завершен');
      
      // Показываем успешное уведомление
      showToast({
        message: `Город "${city.city}" выбран`,
        type: 'success',
        duration: 3000
      });
      
      setIsSearchVisible(false);
      
    } catch (error) {
      console.error('❌ Ошибка при выборе города:', error);
      // Toast уже показывается внутри setManualCity
    }
  }, [setManualCity, showToast]);

  // 🎯 Функция для pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    console.log('🔄 Pull-to-refresh...');
    
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
  }, [refreshing, checkNetwork, showToast, handleRefreshLocation, refetchWeather]);

  // 🎯 Получаем отформатированное название текущего города
  const getCurrentCityDisplay = useCallback((): string => {
    if (userCity && userCountry) return `${userCity}, ${userCountry}`;
    if (userCity) return userCity;
    return 'Город не выбран';
  }, [userCity, userCountry]);

  // 🎯 Рендерим кэшированные данные при оффлайн
  const renderCachedData = useCallback(() => {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        <View style={styles.cachedWarning}>
          <Text style={styles.cachedWarningText}>
            ⚠️ Показаны кэшированные данные
          </Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        >
          {/* Кнопка открытия поиска городов */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearchVisible(true)}
            disabled={isOffline}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>
              {userCity ? `Искать другой город` : 'Выбрать город вручную'}
            </Text>
            <Text style={styles.searchActionText}>
              Поиск
            </Text>
          </TouchableOpacity>

          {/* Заголовок местоположения */}
          <LocationHeader
            city={userCity}
            country={userCountry}
            subtitle="Кэшированные данные"
            isSaved={!!userCity}
          />

          {/* Карточка погоды */}
          {cachedWeather && (
            <WeatherCard
              temperature={cachedWeather.current.temperature}
              weatherDescription={cachedWeather.current.weatherDescription}
              feelsLike={cachedWeather.current.feelsLike}
              windSpeed={cachedWeather.current.windSpeed}
              humidity={cachedWeather.current.humidity}
            />
          )}

          {/* Отладочная информация */}
          <DataSourceInfo
            source={cachedWeather?.metadata?.source || 'cached'}
            coordinates={coordinates}
            city={userCity}
            country={userCountry}
            locationSource={locationSource}
          />
        </ScrollView>

        {/* Модалка поиска городов */}
        <CitySearch
          visible={isSearchVisible}
          onCitySelect={handleCitySelect}
          onClose={() => setIsSearchVisible(false)}
          currentCity={getCurrentCityDisplay()}
        />
      </View>
    );
  }, [
    cachedWeather, coordinates, userCity, userCountry, locationSource,
    isOffline, refreshing, handleRefresh, handleCitySelect, getCurrentCityDisplay
  ]);

  // 🎯 Состояния загрузки
  if ((isLoadingLocation || isGeocoding || isLoadingStorage) && !userCity) {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        {isOffline && cachedWeather ? (
          renderCachedData()
        ) : isOffline ? (
          <EmptyState 
            type="offline"
            message="Нет подключения к интернету"
            onRetry={async () => {
              await checkNetwork();
            }}
          />
        ) : (
          <LoadingState
            message={
              isLoadingStorage 
                ? 'Загружаем сохраненный город...' 
                : 'Определяем ваше местоположение...'
            }
          />
        )}
      </View>
    );
  }

  // 🎯 Оффлайн + есть кэш (проверяем раньше isLoadingWeather)
  if (isOffline && cachedWeather) {
    return renderCachedData();
  }

  if (isLoadingWeather) {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        <LoadingState message="Загружаем погоду..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        {isOffline && cachedWeather ? (
          renderCachedData()
        ) : (
          <ErrorState 
            message={error.message} 
            onRetry={() => refetchWeather()}
          />
        )}
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        {isOffline && cachedWeather ? (
          renderCachedData()
        ) : (
          <EmptyState 
            type="no-data"
            message="Нет данных о погоде" 
            onRetry={() => refetchWeather()}
          />
        )}
      </View>
    );
  }

  // 🎯 Основной рендеринг (онлайн + есть данные)
  return (
    <View style={styles.container}>
      <OfflineBanner />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetchingWeather}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Кнопка открытия поиска городов */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setIsSearchVisible(true)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>
            {userCity ? `Искать другой город` : 'Выбрать город вручную'}
          </Text>
          <Text style={styles.searchActionText}>
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
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchText: {
    color: '#64748b',
    fontSize: 16,
    flex: 1,
  },
  searchActionText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  cachedWarning: {
    padding: 10,
    backgroundColor: '#fef3c7',
  },
  cachedWarningText: {
    textAlign: 'center',
    color: '#92400e',
    fontSize: 14,
  },
});
