// src/hooks/useLocationManager.ts
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { GeocodingService } from '../api/services/geocoding.service';
import { StorageService, StoredLocation } from '../api/services/storage.service';
import { CitySearchResult } from '../api/services/city-search.service';
import { useToast } from './useToast';
import { pushTokenService } from '../api/services/pushTokenService';

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

    // 🎯 Отправка координат на сервер
    const sendCoordinatesToServer = useCallback(async (lat: number, lon: number, source: string) => {
        try {
            const token = await pushTokenService.getStoredToken();
            if (!token) {
                console.log(`📍 Нет push-токена, координаты не отправлены (${source})`);
                return;
            }
            
            await pushTokenService.updateLocation(token, lat, lon)
                .catch(err => console.warn(`⚠️ Ошибка отправки координат (${source}):`, err));
            
            console.log(`📍 Координаты отправлены на сервер (${source})`);
        } catch (error) {
            console.warn(`⚠️ Не удалось отправить координаты (${source}):`, error);
        }
    }, []);

    // 🎯 Метод для ручного выбора города
    const setManualCity = useCallback(async (city: CitySearchResult) => {
        try {
            const newCoordinates = {
                lat: city.lat,
                lon: city.lon,
            };

            // Обновляем состояние
            setUserCity(city.city);
            setUserCountry(city.country || null);
            setCoordinates(newCoordinates);

            // Сохраняем в Storage
            const locationData: StoredLocation = {
                city: city.city,
                country: city.country,
                coordinates: newCoordinates,
                timestamp: Date.now(),
                isManual: true,
            };

            await StorageService.saveSelectedLocation(locationData);

            // 🔥 Отправляем координаты на сервер
            await sendCoordinatesToServer(city.lat, city.lon, 'manual');

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
    }, [showToast, sendCoordinatesToServer]);

    // 🎯 Загрузка сохраненного города
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                setIsLoadingStorage(true);
                const savedLocation = await StorageService.getSelectedLocation();

                if (savedLocation?.city && savedLocation?.coordinates) {
                    setUserCity(savedLocation.city);
                    setUserCountry(savedLocation.country || null);
                    setCoordinates(savedLocation.coordinates);
                    
                    // 🔥 Отправляем сохраненные координаты на сервер при загрузке
                    await sendCoordinatesToServer(
                        savedLocation.coordinates.lat, 
                        savedLocation.coordinates.lon, 
                        'storage'
                    );
                    
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
    }, [getLocation, sendCoordinatesToServer]);

    // 🎯 Функция для определения города
    const determineCity = useCallback(async (lat: number, lon: number) => {
        try {
            setIsGeocoding(true);
            const result = await GeocodingService.getCityFromCoords(lat, lon);

            if (result.city) {
                setUserCity(result.city);
                setUserCountry(result.country || null);

                await StorageService.saveSelectedLocation({
                    city: result.city,
                    country: result.country || '',
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });
                
                // 🔥 Отправляем координаты на сервер
                await sendCoordinatesToServer(lat, lon, 'geocode');
                return;
            }

            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);

            if (approximateCity) {
                setUserCity(approximateCity);
                await StorageService.saveSelectedLocation({
                    city: approximateCity,
                    country: '',
                    coordinates: { lat, lon },
                    timestamp: Date.now(),
                });
                
                // 🔥 Отправляем координаты на сервер
                await sendCoordinatesToServer(lat, lon, 'approximate');
            } else {
                setUserCity(null);
            }

        } catch (error) {
            console.error('❌ Ошибка геокодинга:', error);
            const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
            setUserCity(approximateCity || null);
            
            if (approximateCity) {
                // 🔥 Отправляем координаты на сервер даже без города
                await sendCoordinatesToServer(lat, lon, 'fallback');
            }
        } finally {
            setIsGeocoding(false);
        }
    }, [sendCoordinatesToServer]);

    // 🎯 Обработка новой геолокации
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
                
                // 🔥 Отправляем координаты на сервер
                sendCoordinatesToServer(location.latitude, location.longitude, 'device');
            } else {
                determineCity(location.latitude, location.longitude);
            }
        }
    }, [location, determineCity, sendCoordinatesToServer]);

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