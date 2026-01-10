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
      
      console.log('📍 Got coordinates:', {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

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

  // 3. Преобразование координат в город
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

  // 4. Основной метод
  static async getCurrentLocation(): Promise<LocationData> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Location permission denied',
      } as GeolocationError;
    }

    const coords = await this.getCurrentPosition();
    
    // 🔥 Пробуем получить город через Nominatim
    let geocodingResult;
    try {
      console.log('🗺️ Запрашиваем город по координатам...');
      geocodingResult = await GeocodingService.getCityFromCoords(
        coords.latitude, 
        coords.longitude
      );
      console.log('🗺️ Результат геокодинга:', geocodingResult);
    } catch (error) {
      console.log('⚠️ Не удалось определить город, используем приближение');
      const approximateCity = GeocodingService.getCityByApproximation(
        coords.latitude, 
        coords.longitude
      );
      geocodingResult = { city: approximateCity };
    }

     await StorageService.saveCoordinates(coords.latitude, coords.longitude);

    const locationData: LocationData = {
    ...coords,
    city: geocodingResult.city,
    country: geocodingResult.country,
    geocodingResult,
    timestamp: Date.now(),
  };

    return locationData
  }
}