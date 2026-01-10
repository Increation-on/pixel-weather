// src/api/services/city-search.service.ts
import { GeocodingResult } from './geocoding.service';

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
                limit: '15',
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: any[] = await response.json();

            console.log(`📊 Сырых результатов: ${data.length}`);

            // Преобразуем и фильтруем
            const cities = data
                .filter((item: any) =>
                    item.type === 'city' ||
                    item.type === 'town' ||
                    item.type === 'village' ||
                    item.type === 'administrative'
                )
                .map((item: any): CitySearchResult | null => {
                    const cityName = this.extractCityName(item);
                    
                    // Если не удалось извлечь название города - пропускаем
                    if (!cityName || cityName.trim() === '') {
                        return null;
                    }

                    return {
                        city: cityName,
                        country: item.address?.country,
                        displayName: item.display_name,
                        lat: parseFloat(item.lat),
                        lon: parseFloat(item.lon),
                        type: item.type as 'city' | 'town' | 'village' | 'administrative',
                        importance: item.importance || 0,
                    };
                })
                .filter((city): city is CitySearchResult => 
                    city !== null && city.city !== undefined
                )
                .filter((city, index, self) => {
                    // Убираем дубликаты по названию города
                    const firstIndex = self.findIndex(c => 
                        c.city?.toLowerCase() === city.city?.toLowerCase()
                    );
                    return index === firstIndex;
                })
                .sort((a, b) => {
                    // 1. Сначала сортируем по важности (importance)
                    if (b.importance !== a.importance) {
                        return b.importance - a.importance;
                    }

                    // 2. Приоритет типов: city > town > village > administrative
                    const typePriority: Record<string, number> = {
                        'city': 4,
                        'town': 3, 
                        'village': 2,
                        'administrative': 1
                    };
                    
                    const aPriority = typePriority[a.type] || 0;
                    const bPriority = typePriority[b.type] || 0;
                    
                    if (bPriority !== aPriority) {
                        return bPriority - aPriority;
                    }

                    // 3. Города, начинающиеся с запроса, выше
                    const queryLower = query.toLowerCase();
                    const aStartsWith = a.city?.toLowerCase().startsWith(queryLower) ?? false;
                    const bStartsWith = b.city?.toLowerCase().startsWith(queryLower) ?? false;
                    
                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;

                    // 4. По алфавиту
                    return (a.city || '').localeCompare(b.city || '');
                });

            console.log(`✅ Отфильтровано городов: ${cities.length}`);
            console.log('🏙️ Результаты:', cities.map(c => ({
                city: c.city,
                country: c.country,
                importance: c.importance,
                type: c.type
            })));

            return cities;

        } catch (error) {
            console.error('❌ Ошибка поиска городов:', error);
            throw new Error('Не удалось выполнить поиск. Проверьте подключение к интернету.');
        }
    }

    private static extractCityName(item: any): string | undefined {
        const displayName: string = item.display_name || '';
        
        // 1. Сначала пробуем стандартные поля адреса
        const standardFields: (string | undefined)[] = [
            item.address?.city,
            item.address?.town,
            item.address?.village,
            item.address?.municipality,
            item.address?.county,
            item.address?.state,
            item.address?.region
        ];
        
        for (const field of standardFields) {
            if (field && field.trim() !== '') {
                return field;
            }
        }
        
        // 2. Если в address нет, парсим display_name
        const parts = displayName.split(', ');
        
        if (parts.length > 0) {
            // Пробуем первую часть
            const firstPart = parts[0].trim();
            
            // Проверяем, что это похоже на название города
            if (this.isLikelyCityName(firstPart) && firstPart.length > 1) {
                return firstPart;
            }
            
            // Пробуем вторую часть (часто бывает город)
            if (parts.length > 1) {
                const secondPart = parts[1].trim();
                if (this.isLikelyCityName(secondPart) && secondPart.length > 1) {
                    return secondPart;
                }
            }
            
            // Если не нашли в первых двух частях, ищем в display_name
            for (const part of parts) {
                const trimmed = part.trim();
                if (this.isLikelyCityName(trimmed) && trimmed.length > 1) {
                    return trimmed;
                }
            }
        }
        
        return undefined;
    }

    private static isLikelyCityName(name: string): boolean {
        if (!name || name.length < 2) return false;
        
        const lowerName = name.toLowerCase();
        
        // Слова, которые НЕ должны быть в названии города
        const excludedTerms: string[] = [
            'район', 'округ', 'область', 'регион', 'край', 'поселение',
            'федеральный', 'автономный', 'республика', 'уезд', 'волость',
            'муниципальный', 'городской', 'сельское', 'посёлок',
            'district', 'region', 'oblast', 'krai', 'republic', 'county',
            'автодорога', 'шоссе', 'трасса', 'дорога', 'улица', 'проспект',
            'набережная', 'площадь', 'переулок', 'бульвар'
        ];
        
        // Проверяем на исключающие термины
        for (const term of excludedTerms) {
            if (lowerName.includes(term)) {
                return false;
            }
        }
        
        // Проверяем что название не слишком длинное
        if (name.length > 30) return false;
        
        // Проверяем что это не просто набор чисел
        if (/^\d+$/.test(name)) return false;
        
        return true;
    }

    static formatCityName(displayName: string): string {
        if (!displayName) return '';
        const parts = displayName.split(', ');
        return parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : displayName;
    }
}