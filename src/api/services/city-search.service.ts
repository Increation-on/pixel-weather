// src/api/services/city-search.service.ts
import { GeocodingResult } from './geocoding.service'; // Импортируем общий тип

export interface CitySearchResult extends GeocodingResult {
    lat: number;
    lon: number;
    type: 'city' | 'town' | 'village' | 'administrative';
    importance: number;
    displayName: string;
}

export class CitySearchService {
    private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    static async searchCities(query: string): Promise<CitySearchResult[]> {
        try {
            if (!query || query.length < 2) return [];

            console.log(`🔍 Поиск города: "${query}"`);

            const url = new URL(this.NOMINATIM_URL);
            const params = {
                q: query,
                format: 'json',
                addressdetails: '1',
                limit: '10',
                'accept-language': 'ru',
            };

            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const response = await fetch(url.toString(), {
                headers: {
                    'User-Agent': 'Pixel Weather App/1.0',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            const cities = data.filter((item: any) =>
                item.type === 'city' ||
                item.type === 'town' ||
                item.type === 'village' ||
                item.type === 'administrative'
            );

            console.log(`✅ Найдено городов: ${cities.length}`);

            // Преобразуем в общий формат GeocodingResult
            return cities.map((item: any): CitySearchResult => ({
                city: item.address?.city ||
                    item.address?.town ||
                    item.address?.village ||
                    item.address?.municipality,
                country: item.address?.country,
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type,
                importance: item.importance,
            }));

        } catch (error) {
            console.error('❌ Ошибка поиска городов:', error);
            throw new Error('Не удалось выполнить поиск. Проверьте подключение к интернету.');
        }
    }

    // Методы форматирования можно оставить
    static formatCityName(displayName: string): string {
        if (!displayName) return '';
        const parts = displayName.split(', ');
        return parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : displayName;
    }
}