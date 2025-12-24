// src/components/home/WeatherContent.tsx
import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    RefreshControl
} from 'react-native';
import { LocationHeader } from '@/src/components/location/LocationHeader';
import { WeatherCard } from '@/src/components/weather/WeatherCard';
import { ForecastLink } from '@/src/components/navigation/ForeCastLink';
import { DataSourceInfo } from '@/src/components/shared/DataSourceInfo';

interface WeatherContentProps {
    // Основные данные
    userCity?: string | null;
    userCountry?: string | null;
    weatherData: any;
    coordinates?: { lat: number; lon: number } | null;
    locationSource?: string;

    // UI состояния
    isSearchVisible: boolean;
    setIsSearchVisible: (visible: boolean) => void;
    refreshing: boolean;
    isRefetching: boolean;

    // Функции
    onRefresh: () => void;
    onSearchPress?: () => void;
    getCurrentCityDisplay: () => string;

    // Опционально
    subtitle?: string;
    isOffline?: boolean;
    showSearchButton?: boolean;
    dataSource?: string;

    handleRefreshLocation?: () => void;
    isLoading?: boolean;
    isFetchingLocation?: boolean;
    isGeocoding?: boolean;
}

export const WeatherContent: React.FC<WeatherContentProps> = ({
    userCity,
    userCountry,
    weatherData,
    setIsSearchVisible,
    refreshing,
    isRefetching,
    onRefresh,
    onSearchPress,
    subtitle,
    isOffline = false,
    showSearchButton = true,
    dataSource,
    handleRefreshLocation,
    isLoading = false,
    isFetchingLocation = false,
    isGeocoding = false,
}) => {
    const handleSearchPress = onSearchPress || (() => setIsSearchVisible(true));

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isRefetching}
                        onRefresh={onRefresh}
                        colors={['#4ecdc4']} // ← primary цвет из палитры
                        tintColor="#4ecdc4"   // ← primary цвет из палитры
                    />
                }
            >
                {/* Кнопка поиска */}


                {/* Заголовок местоположения */}
                <LocationHeader
                    city={userCity || undefined}
                    country={userCountry || undefined}
                    subtitle={subtitle}
                    isSaved={!!userCity}
                    onRefreshLocation={handleRefreshLocation}
                    isRefreshingLocation={isLoading || isFetchingLocation || isGeocoding}
                    isGeocoding={isGeocoding}
                />

                {showSearchButton && (
                    <TouchableOpacity
                        className="flex-row items-center bg-card p-3 rounded-xl mb-4"
                        onPress={handleSearchPress}
                        disabled={isOffline}
                    >
                        <Text className="text-lg mr-3">🔍</Text>
                        <Text className="text-text-secondary text-base flex-1">
                            {userCity ? `Искать другой город` : 'Выбрать город вручную'}
                        </Text>
                        <Text className="text-primary text-sm font-medium">
                            Поиск
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Карточка погоды */}
                {weatherData && (
                    <WeatherCard
                        temperature={weatherData.current.temperature}
                        weatherDescription={weatherData.current.weatherDescription}
                        feelsLike={weatherData.current.feelsLike}
                        windSpeed={weatherData.current.windSpeed}
                        humidity={weatherData.current.humidity}
                    />
                )}

                {/* Ссылка на прогноз */}
                <ForecastLink />

                {/* Отладочная информация */}
            </ScrollView>
            <View className="absolute bottom-5 left-2">
                    <DataSourceInfo
                        source={dataSource || weatherData?.metadata?.source || 'unknown'}
                        compact={true} // ← компактный режим!
                    />
                </View>
        </View>
    );
};