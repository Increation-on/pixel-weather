import { View} from "react-native";
import { Link } from "expo-router";

// Импорты компонентов
import { CitySearch } from '../../components/search/CitySeacrh';
import { OfflineBanner } from '../../components/shared/OfflineBanner';
import { HomeScreenContent } from './HomeScreenContent';
import { HomeScreenCachedContent } from './HomeScreenCachedContent'; // Добавляем
import { HomeScreenLoading } from './HomeScreenLoading'; // Добавляем
import { HomeScreenError } from './HomeScreenError'; // Добавляем
import { HomeScreenEmpty } from './HomeScreenEmpty'; // Добавляем

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
    refetchWeather, // Добавляем
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

  // 🎯 Состояния загрузки
  if ((isLoading || isGeocoding || isLoadingStorage) && !userCity) {
    return (
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
    );
  }

  // 🎯 Оффлайн + есть кэш
  if (isOffline && displayType === 'cached') {
    return (
      <HomeScreenCachedContent {...cachedContentProps} />
    );
  }

  // 🎯 Загрузка погоды
  if (isLoadingWeather) {
    return (
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
    );
  }

  // 🎯 Ошибка погоды
  if (weatherError) {
    return (
      <HomeScreenError
        error={weatherError}
        isOffline={isOffline}
        displayType={displayType}
        cachedContentProps={cachedContentProps}
        onRetry={refetchWeather}
      />
    );
  }

  // 🎯 Нет данных
  if (!displayData) {
    return (
      <HomeScreenEmpty
        isOffline={isOffline}
        displayType={displayType}
        cachedContentProps={cachedContentProps}
        onRetry={refetchWeather}
      />
    );
  }

  // 🎯 Основной рендеринг (онлайн + есть данные)
  return (
    <View className="flex-1 bg-background">
      <OfflineBanner />

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
      {/* <Link href="/test-pixel-animations" className="font-pixel text-primary">
        🧪 Тест анимаций
      </Link>
      <Link href="/test-colors" className="font-pixel text-primary">
        🧪 Тест colors
      </Link> */}

    </View>
  );
};
