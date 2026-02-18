// src/components/home/WeatherContent.tsx
import React from 'react';
import {
    View,
    FlatList,
    RefreshControl,
    Text
} from 'react-native';
import { LocationHeader } from '@/src/components/location/LocationHeader';
import { WeatherCard } from '@/src/components/weather/WeatherCard';
import { DataSourceInfo } from '@/src/components/shared/DataSourceInfo';
import { SearchButton } from '@/src/components/search/SearchButton';
import { WeatherMetricsSlider } from '@/src/components/weather/WeatherMetricSlider/WeatherMetricsSlider';


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

    const today = new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    // Контент для FlatList
    const renderContent = () => (
        <View>
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
                <View className='mt-4'>
                    <View className="-mb-5">
                        <Text className="text-white text-xs font-pixel">{today}</Text>
                    </View>
                    <SearchButton
                        handleSearchPress={handleSearchPress}
                        isOffline={isOffline}
                        userCity={userCity}
                    />
                </View>
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

            {/* Карусель метрик */}
            <View pointerEvents="box-none">
                {weatherData && (
                    <WeatherMetricsSlider
                        pressure={weatherData.current.pressure}
                        visibility={weatherData.current.visibility}
                        uvIndex={weatherData.current.uvIndex}
                        humidity={weatherData.current.humidity}
                        windSpeed={weatherData.current.windSpeed}
                    />
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <FlatList
                data={[1]} // Один элемент для рендеринга
                renderItem={() => renderContent()}
                keyExtractor={() => 'weather-content'}
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isRefetching}
                        onRefresh={onRefresh}
                        colors={['#4ecdc4']}
                        tintColor="#4ecdc4"
                    />
                }
                showsVerticalScrollIndicator={false}
                windowSize={5}
                initialNumToRender={1}
                maxToRenderPerBatch={5}
                removeClippedSubviews={false}
            />

            <View className="absolute bottom-2 left-[21px] ">
                <DataSourceInfo
                    source={dataSource || weatherData?.metadata?.source || 'unknown'}
                    compact={true}
                />
            </View>
        </View>
    );
};