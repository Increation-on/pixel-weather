// src/api/services/location.service.ts
import * as Location from 'expo-location';
import { 
  Coordinates, 
  LocationData, 
  ReverseGeocodingResult, 
  GeolocationError 
} from '../../types/location';
import { GeocodingService } from './geocoding.service';
import { StorageService } from './storage.service';
import { pushTokenService } from './pushTokenService';

export class LocationService {
  // 1. Запрос разрешений
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  // 2. Получение координат
  static async getCurrentPosition(): Promise<Coordinates> {
    try {
      const location = await Location.getCurrentPositionAsync();
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Get position error:', error);
      const geoError: GeolocationError = {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Location error',
      };
      throw geoError;
    }
  }

  // 3. Преобразование координат в город через Expo Location
  static async reverseGeocode(coords: Coordinates): Promise<ReverseGeocodingResult> {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (geocode.length > 0) {
        const firstResult = geocode[0];
        return {
          city: firstResult.city || firstResult.subregion || firstResult.region,
          country: firstResult.country,
        };
      }
      return {};
    } catch (error) {
      console.error('Reverse geocode error:', error);
      const geoError: GeolocationError = {
        code: 'GEOCODING_FAILED',
        message: 'Failed to get city name',
      };
      throw geoError;
    }
  }

  // 4. Отправка координат на сервер
  private static async sendCoordinatesToServer(lat: number, lon: number) {
    try {
      const token = await pushTokenService.getStoredToken();
      if (!token) {
        console.log('📍 Нет push-токена, координаты не отправлены');
        return;
      }
      
      // fire-and-forget, не блокируем
      pushTokenService.updateLocation(token, lat, lon)
        .catch(err => console.warn('⚠️ Ошибка отправки координат:', err));
      
      console.log('📍 Координаты отправлены на сервер');
    } catch (error) {
      console.warn('⚠️ Не удалось отправить координаты:', error);
    }
  }

  // 5. Получение города (с фолбэком)
  private static async getCityFromCoordinates(lat: number, lon: number) {
    try {
      // Сначала пробуем Nominatim
      const result = await GeocodingService.getCityFromCoords(lat, lon);
      if (result.city) {
        return { city: result.city, country: result.country };
      }
    } catch (error) {
      console.log('📍 Nominatim недоступен, используем приблизительный город');
    }
    
    // Фолбэк: приблизительный город по координатам
    const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
    return { city: approximateCity, country: undefined };
  }

  // 6. Основной метод
  static async getCurrentLocation(): Promise<LocationData> {
    // Проверяем разрешения
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Location permission denied',
      } as GeolocationError;
    }

    // Получаем координаты
    const coords = await this.getCurrentPosition();
    
    // Получаем город
    const geocodingResult = await this.getCityFromCoordinates(
      coords.latitude, 
      coords.longitude
    );
    
    // Сохраняем в Storage
    await StorageService.saveCoordinates(coords.latitude, coords.longitude);
    
    // 🔥 ОТПРАВЛЯЕМ КООРДИНАТЫ НА СЕРВЕР
    await this.sendCoordinatesToServer(coords.latitude, coords.longitude);

    // Формируем ответ
    const locationData: LocationData = {
      ...coords,
      city: geocodingResult.city || null,
      country: geocodingResult.country || null,
      geocodingResult: {
        city: geocodingResult.city,
        country: geocodingResult.country,
      },
      timestamp: Date.now(),
    };

    return locationData;
  }
}