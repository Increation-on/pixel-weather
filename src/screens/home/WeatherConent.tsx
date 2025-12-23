// src/components/home/WeatherContent.tsx
import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    RefreshControl,
    StyleSheet
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
}

export const WeatherContent: React.FC<WeatherContentProps> = ({
    userCity,
    userCountry,
    weatherData,
    coordinates,
    locationSource,
    isSearchVisible,
    setIsSearchVisible,
    refreshing,
    isRefetching,
    onRefresh,
    onSearchPress,
    getCurrentCityDisplay,
    subtitle,
    isOffline = false,
    showSearchButton = true,
    dataSource,
}) => {
    const handleSearchPress = onSearchPress || (() => setIsSearchVisible(true));

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isRefetching}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            >
                {/* Кнопка поиска */}
                {showSearchButton && (
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearchPress}
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
                )}

                {/* Заголовок местоположения */}
                <LocationHeader
                    city={userCity || undefined}
                    country={userCountry || undefined}
                    subtitle={subtitle}
                    isSaved={!!userCity}
                />

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
                <DataSourceInfo
                    source={dataSource || weatherData?.metadata?.source || 'unknown'}
                    coordinates={coordinates}
                    city={userCity}
                    country={userCountry}
                    locationSource={locationSource}
                />
            </ScrollView>
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
});