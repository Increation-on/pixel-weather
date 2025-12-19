import { useQuery } from '@tanstack/react-query';
import { LocationService } from '../api/services/location.service';
import { LocationData, GeolocationError } from '../types/location';

export const useGeolocation = (enabled = false) => {
  return useQuery<LocationData, GeolocationError>({
    queryKey: ['geolocation'],
    queryFn: () => LocationService.getCurrentLocation(),
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: false, // не повторяем при ошибке
    enabled
  });
};