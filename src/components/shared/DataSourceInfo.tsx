// src/components/shared/DataSourceInfo.tsx
import { View, Text } from 'react-native';

interface DataSourceInfoProps {
  source: 'open-meteo' | 'weather-api';
  coordinates?: { lat: number; lon: number } | null;
  city?: string | null;
  country?: string | null;
  locationSource?: 'device' | 'storage' | 'default';
}

export const DataSourceInfo: React.FC<DataSourceInfoProps> = ({
  source,
  coordinates,
  city,
  country,
  locationSource,
}) => {
  if (!__DEV__) return null; // Только для разработки

  return (
    <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
      <Text style={{ fontSize: 10, color: '#64748b' }}>Отладка:</Text>

      {coordinates && (
        <Text style={{ fontSize: 10, color: '#64748b' }}>
          Координаты: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
        </Text>
      )}

      {city && (
        <Text style={{ fontSize: 10, color: '#64748b' }}>
          Город: {city}
        </Text>
      )}

      {country && (
        <Text style={{ fontSize: 10, color: '#64748b' }}>
          Страна: {country}
        </Text>
      )}

      {locationSource && (
        <Text style={{ fontSize: 10, color: '#64748b' }}>
          Источник геолокации: {
            locationSource === 'device' ? 'устройство'
              : locationSource === 'storage' ? 'хранилище'
                : 'по умолчанию'
          }
        </Text>
      )}

      <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
        Данные: {source === 'open-meteo' ? 'Open-Meteo' : 'WeatherAPI'}
      </Text>
    </View>
  );
};