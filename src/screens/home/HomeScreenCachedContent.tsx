import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OfflineBanner } from '@/src/components/shared/OfflineBanner';
import { WeatherContent } from './WeatherContent';

interface HomeScreenCachedContentProps {
    // Данные
    userCity?: string | null;
    userCountry?: string | null;
    displayData: any;
    coordinates?: { lat: number; lon: number } | null;
    locationSource?: string;

    // UI состояния
    isSearchVisible: boolean;
    setIsSearchVisible: (visible: boolean) => void;
    refreshing: boolean;

    // Функции
    handleRefresh: () => void;
    handleRefreshLocation: () => void;
    getLocationSubtitle: () => string;
    getCurrentCityDisplay: () => string;
}

export const HomeScreenCachedContent: React.FC<HomeScreenCachedContentProps> = (props) => {
    return (
        <View style={styles.container}>
            <OfflineBanner />
            <WeatherContent
                {...props}
                weatherData={props.displayData}
                onRefresh={props.handleRefresh}
                isRefetching={false}
                subtitle="Кэшированные данные"
                isOffline={true}
                dataSource="cached" // Явно передаем 'cached'
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});