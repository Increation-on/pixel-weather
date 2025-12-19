import { useState, useEffect, useCallback } from 'react';
import { useWeather } from "../hooks/useWeather";
import { useGeolocation } from '../hooks/useGeolocation';
import { GeocodingService } from '../api/services/geocoding.service';
import { StorageService, StoredLocation } from './../api/services/storage.service'
import { Text } from "@react-navigation/elements";
import { Link } from "expo-router";
import { View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

export const HomeScreen = () => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // 🎯 Хук геолокации
  const {
    data: location,
    error: locationError,
    isLoading: isLoadingLocation,
    refetch: getLocation
  } = useGeolocation(false);

  // 🎯 Хук погоды
  const { data, isLoading, error, refetch: refetchWeather } = useWeather(
    coordinates?.lat || 55.7558,
    coordinates?.lon || 37.6173
  );

  console.log('🔍 Текущий location из хука:', {
  данные: location,
  isLoading: isLoadingLocation,
  error: locationError
});

  // 🎯 1. При загрузке - загружаем сохраненный город
  useEffect(() => {
  const loadSavedLocation = async () => {
    try {
      console.log('💾 Загрузка сохраненного города...');
      setIsLoadingStorage(true);
      
      // 1. Загружаем из AsyncStorage
      const savedLocation = await StorageService.getSelectedLocation();
      
      // 2. Если есть сохраненный город - используем его
      if (savedLocation?.city && savedLocation?.coordinates) {
        console.log('✅ Найден сохраненный город:', {
          город: savedLocation.city,
          координаты: savedLocation.coordinates,
          время: new Date(savedLocation.timestamp).toLocaleTimeString()
        });
        
        // Устанавливаем сохраненные данные
        setUserCity(savedLocation.city);
        setUserCountry(savedLocation.country || null);
        setCoordinates(savedLocation.coordinates);
        
        console.log('📍 Показываем сохраненный город, геолокация не требуется');
        return; // Выходим - не запускаем геолокацию!
      }
      
      // 3. Если нет сохраненного города - запускаем геолокацию
      console.log('📍 Нет сохраненного города, запускаем геолокацию...');
      await getLocation();
      
    } catch (error) {
      console.error('❌ Ошибка загрузки сохраненного города:', error);
      // Если ошибка - всё равно пробуем геолокацию
      await getLocation();
    } finally {
      setIsLoadingStorage(false);
    }
  };

  loadSavedLocation();
}, []);

  // 🎯 Функция для определения города по координатам
  const determineCity = useCallback(async (lat: number, lon: number) => {
    try {
      setIsGeocoding(true);
      console.log('🗺️ Определяем город для координат:', lat, lon);

      // Пробуем Nominatim
      const result = await GeocodingService.getCityFromCoords(lat, lon);

      if (result.city) {
        console.log('✅ Город найден:', result.city, result.country);
        console.log('💾 ЗАПИСАНО в AsyncStorage:', {
  город: result.city,
  время: new Date().toLocaleTimeString()
});

        // Обновляем состояние
        setUserCity(result.city);
        setUserCountry(result.country || null);

        // Сохраняем в хранилище
        await StorageService.saveSelectedLocation({
          city: result.city,
          country: result.country,
          coordinates: { lat, lon },
          timestamp: Date.now(),
        });

        return;
      }

      // Если Nominatim не сработал, используем приближение
      const approximateCity = GeocodingService.getCityByApproximation(lat, lon);
      console.log('📍 Приблизительный город:', approximateCity);

      setUserCity(approximateCity);

      // Сохраняем приблизительный город
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

  // 🎯 2. Когда получаем геолокацию - определяем и сохраняем город
  useEffect(() => {
    if (location && location.latitude !== 55.7558) {
      console.log('📍 Получили геолокацию:', location);

      const newCoordinates = {
        lat: location.latitude,
        lon: location.longitude
      };

      setCoordinates(newCoordinates);

      // Если в location уже есть город (редкий случай)
      if (location.city && location.country) {
        setUserCity(location.city);
        setUserCountry(location.country);

        // Сохраняем
        StorageService.saveSelectedLocation({
          city: location.city,
          country: location.country,
          coordinates: newCoordinates,
          timestamp: Date.now(),
        });
      } else {
        // Определяем город по координатам
        determineCity(location.latitude, location.longitude);
      }
    }
  }, [location, determineCity]);

  // 🎯 3. При изменении координат обновляем погоду
  useEffect(() => {
    if (coordinates) {
      console.log('🔄 Координаты изменились, обновляем погоду...');
      refetchWeather();
    }
  }, [coordinates?.lat, coordinates?.lon]);

  // 🎯 4. Обработчики кнопок
  const handleRefreshLocation = async () => {
    console.log('🔄 Обновляем геолокацию...');
    await getLocation();
  };

  const handleClearSavedLocation = async () => {
    Alert.alert(
      'Очистить сохраненный город',
      'Вы уверены, что хотите очистить сохраненный город? Приложение снова определит ваше местоположение.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Очищаем хранилище
              await StorageService.clearLocation();

              // 2. Сбрасываем все состояния
              setUserCity(null);
              setUserCountry(null);
              setCoordinates(null);

              // 3. Сбрасываем кэш геолокации в React Query
              // Нужно получить доступ к queryClient
              // Или просто перезапросить геолокацию
              await getLocation();

              console.log('🗑️ Локация очищена, запрашиваем новую...');

            } catch (error) {
              console.error('❌ Ошибка очистки локации:', error);
            }
          }
        },
      ]
    );
  };

  // 🎯 5. Определяем что показывать
  const getDisplayLocation = () => {
    if (userCity && userCountry) return `${userCity}, ${userCountry}`;
    if (userCity) return userCity;
    if (locationError) return 'Локация не определена';
    if (isLoadingLocation || isGeocoding || isLoadingStorage) return 'Определяем местоположение...';
    return 'Локация не определена';
  };

  const getLocationSubtitle = () => {
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
  };

  // 🎯 6. UI состояния
  if ((isLoadingLocation || isGeocoding || isLoadingStorage) && !location && !userCity) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#475569' }}>
          {isLoadingStorage ? 'Загружаем сохраненный город...' : 'Определяем ваше местоположение...'}
        </Text>
      </View>
    );
  }

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ marginTop: 20, fontSize: 16, color: '#475569' }}>
        Загружаем погоду...
      </Text>
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#dc2626', fontSize: 18, fontWeight: 'bold' }}>Ошибка</Text>
      <Text style={{ color: '#dc2626', fontSize: 14, marginTop: 10, textAlign: 'center' }}>
        {error.message}
      </Text>
    </View>
  );

  if (!data) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 16, color: '#475569' }}>Нет данных о погоде</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      {/* 🎯 ШАПКА С ГОРОДОМ */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>
            {getDisplayLocation()}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {getLocationSubtitle()}
            {userCity && ' • 💾 Сохранено'}
          </Text>
        </View>

        {/* 🎯 КНОПКИ ДЕЙСТВИЙ */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TouchableOpacity
            onPress={handleRefreshLocation}
            disabled={isLoadingLocation || isGeocoding}
            style={{
              flex: 1,
              backgroundColor: (isLoadingLocation || isGeocoding) ? '#94a3b8' : '#3b82f6',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {(isLoadingLocation || isGeocoding) ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text style={{ color: 'white', fontSize: 14 }}>
                  {isGeocoding ? 'Определяем город...' : 'Обновляем...'}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18 }}>📍</Text>
                <Text style={{ color: 'white', fontSize: 14 }}>Обновить местоположение</Text>
              </>
            )}
          </TouchableOpacity>

          {userCity && (
            <TouchableOpacity
              onPress={handleClearSavedLocation}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#fee2e2',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#dc2626', fontSize: 14 }}>🗑️ Очистить</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🎯 ОШИБКИ */}
        {locationError && !isLoadingLocation && (
          <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#dc2626', fontSize: 12 }}>
              ⚠️ {locationError.message}. {userCity ? `Показываем ${userCity}` : 'Показываем Москву'}.
            </Text>
          </View>
        )}
      </View>

      {/* 🎯 КАРТОЧКА ПОГОДЫ */}
      <View style={{ backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>
          {Math.round(data.current.temperature)}°C
        </Text>
        <Text style={{ fontSize: 18, color: '#475569', textAlign: 'center', marginTop: 5 }}>
          {data.current.weatherDescription}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>Ощущается</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
              {Math.round(data.current.feelsLike)}°C
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>Ветер</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
              {data.current.windSpeed} м/с
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>Влажность</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
              {data.current.humidity}%
            </Text>
          </View>
        </View>
      </View>

      {/* 🎯 ПРОГНОЗ */}
      <Link
        href="/forecast"
        style={{
          backgroundColor: '#3b82f6',
          padding: 16,
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
          📅 Смотреть прогноз на 5 дней
        </Text>
      </Link>

      {/* 🎯 ИСТОЧНИК */}
      <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 20, textAlign: 'center' }}>
        Данные: {data.metadata?.source === 'open-meteo' ? 'Open-Meteo' : 'WeatherAPI'}
      </Text>

      {/* 🎯 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ */}
      {__DEV__ && coordinates && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
          <Text style={{ fontSize: 10, color: '#64748b' }}>Отладка:</Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>
            Координаты: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
          </Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>
            Город: {userCity || 'не определен'}
          </Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>
            Страна: {userCountry || 'не определена'}
          </Text>
          <Text style={{ fontSize: 10, color: '#64748b' }}>
            Источник геолокации: {location?.timestamp ? 'устройство' : 'хранилище'}
          </Text>
        </View>
      )}
    </View>
  );
};