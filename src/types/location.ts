// 🎯 Базовый тип координат
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null; // разрешаем null
}

// 🎯 Полные данные геолокации
export interface LocationData extends Coordinates {
  city?: string | null; // разрешаем null
  country?: string | null; // разрешаем null
  geocodingResult?: GeocodingResult;
  timestamp: number;
}

// 🎯 Ошибки геолокации - используем discriminated union
export type GeolocationError =
  | { code: 'PERMISSION_DENIED'; message: string }
  | { code: 'POSITION_UNAVAILABLE'; message: string }
  | { code: 'TIMEOUT'; message: string }
  | { code: 'GEOCODING_FAILED'; message: string }
  | { code: 'UNKNOWN'; message: string };

// 🎯 Состояние геолокации - тоже discriminated union
export type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: LocationData }
  | { status: 'error'; error: GeolocationError };

// 🎯 Тип для Reverse Geocoding ответа
export interface ReverseGeocodingResult {
  city?: string | null; // разрешаем null
  country?: string | null; // разрешаем null
}

export interface GeocodingResult {
  city?: string;
  country?: string;
  displayName?: string;
}
