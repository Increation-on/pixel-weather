// Весь файл HomeScreen.tsx с исправлениями
import { View, StatusBar } from 'react-native';
// import { TestNotificationLogic } from '@/src/components/UniversalTestComponent';
// Импорты компонентов
import { CitySearch } from '../../components/search/CitySearch';
import { OfflineBanner } from '../../components/shared/OfflineBanner';
import { HomeScreenContent } from './HomeScreenContent';
import { HomeScreenCachedContent } from './HomeScreenCachedContent';
import { HomeScreenLoading } from './HomeScreenLoading';
import { HomeScreenError } from './HomeScreenError';
import { HomeScreenEmpty } from './HomeScreenEmpty';

// Хуки
import { useNetwork } from '../../providers/NetworkProvider';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useHomeScreenData } from '../../hooks/useHomeScreenData';
import { useHomeScreenActions } from '../../hooks/useHomeScreenActions';
import { useHomeScreenEffects } from '../../hooks/useHomeScreenEffects';

export const HomeScreen = () => {
  // 🎯 Все данные
  const homeData = useHomeScreenData();

  // 🎯 Эффекты
  useHomeScreenEffects(homeData);

  // 🎯 Действия
  const actions = useHomeScreenActions(homeData);

  // 🎯 Остальные хуки
  const { isOffline } = useNetwork();
  useHealthCheck();

  // 🎯 Извлекаем данные для рендеринга
  const {
    // UI состояния
    isSearchVisible,
    setIsSearchVisible,
    refreshing,

    // Данные
    type: displayType,
    data: displayData,
    coordinates,
    userCity,
    userCountry,
    locationSource,

    // Состояния загрузки
    isLoading,
    isLoadingWeather,
    isRefetchingWeather,
    isFetchingLocation,
    isGeocoding,
    isLoadingStorage,

    // Ошибки
    locationError,
    weatherError,

    // Функции
    getCurrentCityDisplay,
    getLocationSubtitle,
    handleRefreshLocation,
    refetchWeather,
  } = homeData;

  // 🎯 Извлекаем действия
  const { handleRefresh, handleCitySelect, checkNetwork } = actions;

  // 🎯 Общие пропсы для кэшированного контента
  const cachedContentProps = {
    userCity,
    userCountry,
    displayData,
    coordinates,
    locationSource,
    isSearchVisible,
    setIsSearchVisible,
    refreshing,
    handleRefresh,
    handleRefreshLocation,
    getLocationSubtitle,
    getCurrentCityDisplay,
  };

  const statusBarHeight = StatusBar.currentHeight || 0;

  // Обёртка для ВСЕХ состояний
  const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-1 bg-background" >
      {children}
    </View>
  );

  // 🎯 Состояния загрузки
  if ((isLoading || isGeocoding || isLoadingStorage) && !userCity) {
    return (
      <ScreenContainer>
        <HomeScreenLoading
          isLoading={isLoading}
          isGeocoding={isGeocoding}
          isLoadingStorage={isLoadingStorage}
          isLoadingWeather={isLoadingWeather}
          userCity={userCity}
          isOffline={isOffline}
          displayType={displayType}
          displayData={displayData}
          cachedContentProps={cachedContentProps}
          onRetry={checkNetwork}
        />
      </ScreenContainer>
    );
  }

  // 🎯 Оффлайн + есть кэш
  if (isOffline && displayType === 'cached') {
    return (
      <ScreenContainer>
        <HomeScreenCachedContent {...cachedContentProps} />
      </ScreenContainer>
    );
  }

  // 🎯 Загрузка погоды
  if (isLoadingWeather) {
    return (
      <ScreenContainer>
        <HomeScreenLoading
          isLoading={false}
          isGeocoding={false}
          isLoadingStorage={false}
          isLoadingWeather={true}
          userCity={userCity}
          isOffline={isOffline}
          displayType={displayType}
          displayData={displayData}
          cachedContentProps={cachedContentProps}
          onRetry={checkNetwork}
        />
      </ScreenContainer>
    );
  }

  // 🎯 Ошибка погоды
  if (weatherError) {
    return (
      <ScreenContainer>
        <HomeScreenError
          error={weatherError}
          isOffline={isOffline}
          displayType={displayType}
          cachedContentProps={cachedContentProps}
          onRetry={refetchWeather}
        />
      </ScreenContainer>
    );
  }

  // 🎯 Нет данных
  if (!displayData) {
    return (
      <ScreenContainer>
        <HomeScreenEmpty
          isOffline={isOffline}
          displayType={displayType}
          cachedContentProps={cachedContentProps}
          onRetry={refetchWeather}
        />
      </ScreenContainer>
    );
  }

  // 🎯 Основной рендеринг (онлайн + есть данные)
  return (
    <ScreenContainer>
      <OfflineBanner />
      {/* <TestNotificationLogic/> */}
      <HomeScreenContent
        // Данные
        userCity={userCity}
        userCountry={userCountry}
        displayData={displayData}
        coordinates={coordinates}
        locationSource={locationSource}

        // Состояния UI
        isSearchVisible={isSearchVisible}
        setIsSearchVisible={setIsSearchVisible}
        refreshing={refreshing}
        isRefetchingWeather={isRefetchingWeather}

        // Загрузка
        isLoading={isLoading}
        isFetchingLocation={isFetchingLocation}
        isGeocoding={isGeocoding}

        // Ошибки
        locationError={locationError}

        // Функции
        handleRefresh={handleRefresh}
        handleRefreshLocation={handleRefreshLocation}
        getLocationSubtitle={getLocationSubtitle}
        getCurrentCityDisplay={getCurrentCityDisplay}
      />

     

      {/* Модалка поиска городов */}
      <CitySearch
        visible={isSearchVisible}
        onCitySelect={handleCitySelect}
        onClose={() => setIsSearchVisible(false)}
        currentCity={getCurrentCityDisplay()}
      />
       
    </ScreenContainer>
  );
};