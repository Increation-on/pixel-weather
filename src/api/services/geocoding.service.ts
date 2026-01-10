// src/api/services/geocoding.service.ts
export interface GeocodingResult {
    city?: string; // city теперь optional
    country?: string;
    displayName?: string;
}

export class GeocodingService {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
    
    // 🔧 Получаем город по координатам
    static async getCityFromCoords(lat: number, lon: number): Promise<GeocodingResult> {
        try {
            // Nominatim требует задержки и User-Agent
            await this.delay(1000); // Задержка из-за ограничений Nominatim
            
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
            
            return {
                city: data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      data.address?.municipality ||
                      undefined, // Явно указываем undefined если нет
                country: data.address?.country,
                displayName: data.display_name,
            };
            
        } catch (error) {
            console.error('❌ Geocoding error:', error);
            return {}; // Возвращаем пустой объект
        }
    }
    
    // 🔧 Задержка для соблюдения лимитов Nominatim
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
        ];
        
        for (const city of cities) {
            const distance = Math.sqrt(
                Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2)
            );
            
            if (distance < city.radius) {
                return city.name;
            }
        }
        
        return undefined; // Явно возвращаем undefined вместо строки
    }
}