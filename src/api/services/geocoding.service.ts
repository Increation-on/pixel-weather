// src/api/services/geocoding.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeocodingResult {
    city?: string;
    country?: string;
    displayName?: string;
}

export class GeocodingService {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
    
    // ⏱️ Глобальный контроль запросов
    private static lastRequestTime = 0;
    private static readonly MIN_REQUEST_INTERVAL = 1100; // 1.1 секунды (запас)
    
    // 📦 Кэш на 7 дней
    private static readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней
    
    // 🔧 Получаем город по координатам с кэшированием и глобальной задержкой
    static async getCityFromCoords(lat: number, lon: number): Promise<GeocodingResult> {
        const roundedLat = Math.round(lat * 1000) / 1000;
        const roundedLon = Math.round(lon * 1000) / 1000;
        const cacheKey = `geocode_${roundedLat}_${roundedLon}`;
        
        try {
            // 1️⃣ ПРОВЕРЯЕМ КЭШ
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                
                if (age < this.CACHE_TTL) {
                    console.log(`🗺️ Геокодинг из кэша (${data.result.city || 'город не определен'})`);
                    return data.result;
                }
                console.log('📦 Кэш устарел, запрашиваем заново');
            }
            
            // 2️⃣ ГЛОБАЛЬНАЯ ЗАДЕРЖКА (защита от 509)
            const now = Date.now();
            const timeSinceLast = now - this.lastRequestTime;
            
            if (timeSinceLast < this.MIN_REQUEST_INTERVAL) {
                const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLast;
                console.log(`⏳ Ожидание ${waitTime}мс перед запросом к Nominatim...`);
                await this.delay(waitTime);
            }
            
            // 3️⃣ ВЫПОЛНЯЕМ ЗАПРОС
            this.lastRequestTime = Date.now();
            console.log(`🌍 Запрос к Nominatim: ${roundedLat}, ${roundedLon}`);
            
            const url = `${this.NOMINATIM_URL}?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'PixelWeatherApp/1.0', // Обязательно для Nominatim
                },
            });
            
            if (!response.ok) {
                throw new Error(`Geocoding failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            const result: GeocodingResult = {
                city: data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      data.address?.municipality ||
                      undefined,
                country: data.address?.country,
                displayName: data.display_name,
            };
            
            // 4️⃣ СОХРАНЯЕМ В КЭШ
            await AsyncStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                result
            }));
            console.log(`💾 Геокодинг сохранен в кэш: ${result.city || 'город не определен'}`);
            
            return result;
            
        } catch (error) {
            console.error('❌ Geocoding error:', error);
            
            // 5️⃣ ФОЛБЭК: приблизительный город
            const approximateCity = this.getCityByApproximation(lat, lon);
            if (approximateCity) {
                console.log(`🗺️ Используем приблизительный город: ${approximateCity}`);
                return { city: approximateCity };
            }
            
            return {};
        }
    }
    
    // 🔧 Задержка
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 🔧 Простая проверка по координатам (если Nominatim не работает)
    static getCityByApproximation(lat: number, lon: number): string | undefined {
        // Примерные координаты крупных городов
        const cities = [
            { name: 'Москва', lat: 55.7558, lon: 37.6173, radius: 1.0 },
            { name: 'Минск', lat: 53.8935, lon: 27.5579, radius: 0.5 },
            { name: 'Киев', lat: 50.4501, lon: 30.5234, radius: 0.5 },
            { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351, radius: 1.0 },
            { name: 'Лондон', lat: 51.5074, lon: -0.1278, radius: 1.0 },
            { name: 'Нью-Йорк', lat: 40.7128, lon: -74.0060, radius: 1.0 },
            { name: 'Токио', lat: 35.6762, lon: 139.6503, radius: 1.0 },
            { name: 'Париж', lat: 48.8566, lon: 2.3522, radius: 0.5 },
            { name: 'Берлин', lat: 52.5200, lon: 13.4050, radius: 0.5 },
            { name: 'Рим', lat: 41.9028, lon: 12.4964, radius: 0.5 },
            { name: 'Мадрид', lat: 40.4168, lon: -3.7038, radius: 0.5 },
            { name: 'Варшава', lat: 52.2297, lon: 21.0122, radius: 0.5 },
            { name: 'Прага', lat: 50.0755, lon: 14.4378, radius: 0.5 },
            { name: 'Вена', lat: 48.2082, lon: 16.3738, radius: 0.5 },
            { name: 'Будапешт', lat: 47.4979, lon: 19.0402, radius: 0.5 },
        ];
        
        for (const city of cities) {
            const distance = Math.sqrt(
                Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
            );
            
            if (distance < city.radius) {
                return city.name;
            }
        }
        
        return undefined;
    }
}