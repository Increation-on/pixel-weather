// src/hooks/useLocationManager.ts
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { GeocodingService } from '../api/services/geocoding.service';
import { StorageService, StoredLocation } from '../api/services/storage.service';
import { CitySearchResult } from '../api/services/city-search.service';
import { useToast } from './useToast';

interface UseLocationManagerReturn {
    coordinates: { lat: number; lon: number } | null;
    userCity: string | null;
    userCountry: string | null;
    isLoading: boolean;
    isGeocoding: boolean;
    isLoadingStorage: boolean;
    isFetching: boolean;
    locationError: any;
    locationSource: 'device' | 'storage' | 'default';
    setManualCity: (city: CitySearchResult) => Promise<void>;
    handleRefreshLocation: () => Promise<void>;
    getLocationSubtitle: () => string;
}

export const useLocationManager = (): UseLocationManagerReturn => {
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [userCity, setUserCity] = useState<string | null>(null);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isLoadingStorage, setIsLoadingStorage] = useState(true);
    const { showToast } = useToast();

    const {
        data: location,
        error: locationError,
        isLoading: isLoadingLocation,
        refetch: getLocation,
        isFetching: isFetchingLocation,
    } = useGeolocation(false);

    // 🎯 Метод для ручного выбора города
    const setManualCity = useCallback(async (city: CitySearchResult) => {
        try {
            const newCoordinates = {
                lat: city.lat,
                lon: city.lon,
            };

            // ✅ Обновляем состояние ИЗ city напрямую
            setUserCity(city.city);
            setUserCountry(city.country || null);
            setCoordinates(newCoordinates);

            // ✅ Создаем locationData для сохранения
            const locationData: StoredLocation = {
                city: city.city,
                country: city.country, // Может быть undefined, но StoredLocation.country тоже string | undefined
                coordinates: newCoordinates,
                timestamp: Date.now(),
                isManual: true,
            };

            await StorageService.saveSelectedLocation(locationData);

            showToast({
                message: `Город "${city.city}" сохранен`,
                type: 'success',
                duration: 3000
            });

        } catch (error) {
            console.error('❌ Ошибка сохранения выбранного города:', error);
            showToast({
                message: 'Не удалось сохранить выбранный город. Попробуйте еще раз.',
                type: 'error'
            });
            throw error;
        }
    }, [showToast]);

    // 🎯 1. Загрузка сохраненного города
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                setIsLoadingStorage(true);
                const savedLocation = await StorageService.getSelectedLocation();

                if (savedLocation?.city && savedLocation?.coordinates) {
                    setUserCity(savedLocation.city);
                    setUserCountry(savedLocation.country || null);
                    setCoordinates(savedLocation.coordinates);
                    return;
                }

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
            const result = await GeocodingService.getCityFromCoords(lat, lon);

            if (result.city) {
                setUserCity(result.city);
                setUserCountry(result.country || null);

                await StorageService.saveSelectedLocation({
                    city: result.city, // ✅ result.city может быть undefined, но мы в if-блоке
                    country: result.country || '',
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });
                return;
            }

            // ✅ ФИКС: Обрабатываем undefined
            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);

            if (approximateCity) {
                // Если город найден
                setUserCity(approximateCity);

                await StorageService.saveSelectedLocation({
                    city: approximateCity, // ✅ Всегда строка (не undefined)
                    country: '',
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });
            } else {
                // Если город не найден - ставим null
                setUserCity(null);
                // Не сохраняем в storage, так как нет города
            }

        } catch (error) {
            console.error('❌ Ошибка геокодинга:', error);
            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
            // ✅ Обрабатываем undefined
            setUserCity(approximateCity || null);
        } finally {
            setIsGeocoding(false);
        }
    }, []);

    // 🎯 2. Обработка новой геолокации
    useEffect(() => {
        if (location && location.latitude !== 55.7558) {
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
                    country: location.country || '',
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
        await getLocation();
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

        if (userCity) {
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
        isFetching: isFetchingLocation,
        setManualCity,
        handleRefreshLocation,
        getLocationSubtitle,
    };
};