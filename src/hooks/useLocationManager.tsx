// src/hooks/useLocationManager.ts
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { GeocodingService } from '../api/services/geocoding.service';
import { StorageService } from '../api/services/storage.service';

interface UseLocationManagerReturn {
    coordinates: { lat: number; lon: number } | null;
    userCity: string | null;
    userCountry: string | null;
    isLoading: boolean;
    isGeocoding: boolean;
    isLoadingStorage: boolean;
    locationError: any;
    locationSource: 'device' | 'storage' | 'default';
    handleRefreshLocation: () => Promise<void>;
    handleClearSavedLocation: () => Promise<void>;
    getLocationSubtitle: () => string;
}

export const useLocationManager = (): UseLocationManagerReturn => {
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [userCity, setUserCity] = useState<string | null>(null);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isLoadingStorage, setIsLoadingStorage] = useState(true);

    const {
        data: location,
        error: locationError,
        isLoading: isLoadingLocation,
        refetch: getLocation
    } = useGeolocation(false);

    // 🎯 1. Загрузка сохраненного города
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                console.log('💾 Загрузка сохраненного города...');
                setIsLoadingStorage(true);

                const savedLocation = await StorageService.getSelectedLocation();

                if (savedLocation?.city && savedLocation?.coordinates) {
                    console.log('✅ Найден сохраненный город:', savedLocation.city);

                    setUserCity(savedLocation.city);
                    setUserCountry(savedLocation.country || null);
                    setCoordinates(savedLocation.coordinates);

                    return;
                }

                console.log('📍 Нет сохраненного города, запускаем геолокацию...');
                await getLocation();

            } catch (error) {
                console.error('❌ Ошибка загрузки сохраненного города:', error);
                await getLocation();
            } finally {
                setIsLoadingStorage(false);
            }
        };

        loadSavedLocation();
    }, []);

    // 🎯 Функция для определения города
    const determineCity = useCallback(async (lat: number, lon: number) => {
        try {
            setIsGeocoding(true);
            console.log('🗺️ Определяем город для координат:', lat, lon);

            const result = await GeocodingService.getCityFromCoords(lat, lon);

            if (result.city) {
                console.log('✅ Город найден:', result.city);

                setUserCity(result.city);
                setUserCountry(result.country || null);

                await StorageService.saveSelectedLocation({
                    city: result.city,
                    country: result.country,
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });

                return;
            }

            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
            console.log('📍 Приблизительный город:', approximateCity);

            setUserCity(approximateCity);

            if (approximateCity !== 'Неизвестный город') {
                await StorageService.saveSelectedLocation({
                    city: approximateCity,
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });
            }

        } catch (error) {
            console.error('❌ Ошибка геокодинга:', error);
            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
            setUserCity(approximateCity);
        } finally {
            setIsGeocoding(false);
        }
    }, []);

    // 🎯 2. Обработка новой геолокации
    useEffect(() => {
        if (location && location.latitude !== 55.7558) {
            console.log('📍 Получили геолокацию:', location);

            const newCoordinates = {
                lat: location.latitude,
                lon: location.longitude
            };

            setCoordinates(newCoordinates);

            if (location.city && location.country) {
                setUserCity(location.city);
                setUserCountry(location.country);

                StorageService.saveSelectedLocation({
                    city: location.city,
                    country: location.country,
                    coordinates: newCoordinates,
                    timestamp: Date.now(),
                });
            } else {
                determineCity(location.latitude, location.longitude);
            }
        }
    }, [location, determineCity]);

    // 🎯 Обработчики
    const handleRefreshLocation = async () => {
        console.log('🔄 Обновляем геолокацию...');
        await getLocation();
    };

    const handleClearSavedLocation = async () => {
        await StorageService.clearLocation();
        setUserCity(null);
        setUserCountry(null);
        setCoordinates(null);
        await getLocation();
        console.log('🗑️ Локация очищена, запрашиваем новую...');
    };

    // 🎯 Вспомогательная функция для подзаголовка
    const getLocationSubtitle = useCallback((): string => {
        if (isLoadingStorage) return 'Загружаем сохраненный город...';
        if (!coordinates || coordinates.lat === 55.7558) {
            return userCity ? 'Сохраненный город' : 'По умолчанию';
        }

        if (isGeocoding) {
            return 'Определяем город...';
        }

        if (userCity && userCity !== 'Неизвестный город') {
            return `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`;
        }

        return 'Координаты: ' + coordinates.lat.toFixed(2) + ', ' + coordinates.lon.toFixed(2);
    }, [coordinates, userCity, isGeocoding, isLoadingStorage]);

    const locationSource = location?.timestamp
        ? 'device'
        : userCity
            ? 'storage'
            : 'default';

    return {
        coordinates,
        userCity,
        userCountry,
        isLoading: isLoadingLocation || isGeocoding || isLoadingStorage,
        isGeocoding,
        isLoadingStorage,
        locationError,
        locationSource,
        handleRefreshLocation,
        handleClearSavedLocation,
        getLocationSubtitle,
    };
};