import { useState, useCallback } from 'react';
import { CitySearchService, CitySearchResult } from '../api/services/city-search.service';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseCitySearchReturn {
  // Состояния
  query: string;
  results: CitySearchResult[];
  status: SearchStatus;
  error?: string;
  selectedCity: CitySearchResult | null;
  
  // Методы
  setQuery: (query: string) => void;
  searchCities: () => Promise<void>;
  selectCity: (city: CitySearchResult) => void;
  clearSearch: () => void;
  resetSelection: () => void;
  
  // Вспомогательные
  isLoading: boolean;
  hasResults: boolean;
  formattedSelectedCity: string | null;
}

export const useCitySearch = (): UseCitySearchReturn => {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);

  // Обертка для setQuery с debounce логикой (позже добавим)
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Основная функция поиска
  const searchCities = useCallback(async () => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    setError(undefined);

    try {
      const cities = await CitySearchService.searchCities(query.trim());
      setResults(cities);
      setStatus('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка поиска';
      setError(errorMessage);
      setStatus('error');
      setResults([]);
      console.error('❌ Ошибка в useCitySearch:', err);
    }
  }, [query]);

  // Выбор города
  const selectCity = useCallback((city: CitySearchResult) => {
    setSelectedCity(city);
    setQueryState(CitySearchService.formatCityName(city.displayName ));
    setResults([]); // Скрываем результаты после выбора
    setStatus('idle');
  }, []);

  // Очистка поиска
  const clearSearch = useCallback(() => {
    setQueryState('');
    setResults([]);
    setStatus('idle');
    setError(undefined);
  }, []);

  // Сброс выбора (вернуться к геолокации)
  const resetSelection = useCallback(() => {
    setSelectedCity(null);
    setQueryState('');
    setResults([]);
    setStatus('idle');
  }, []);

  // Вспомогательные геттеры
  const isLoading = status === 'loading';
  const hasResults = results.length > 0 && status === 'success';
  const formattedSelectedCity = selectedCity 
    ? CitySearchService.formatCityName(selectedCity.displayName )
    : null;

  return {
    // Состояния
    query,
    results,
    status,
    error,
    selectedCity,
    
    // Методы
    setQuery,
    searchCities,
    selectCity,
    clearSearch,
    resetSelection,
    
    // Вспомогательные
    isLoading,
    hasResults,
    formattedSelectedCity,
  };
};