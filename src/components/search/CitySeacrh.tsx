// src/components/weather/CitySearch.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { CitySearchResult } from '../../api/services/city-search.service';
import { CityItem } from './CityItem';
import { SearchInput } from './SearchInput';
import { SearchStatus } from './SearchStatus';

const { height } = Dimensions.get('window');

interface CitySearchProps {
  onCitySelect: (city: CitySearchResult) => void;
  onClose?: () => void;
  visible?: boolean;
  currentCity?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onCitySelect,
  onClose,
  visible = false,
  currentCity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [visible]);

  // Поиск с debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const { CitySearchService } = await import('../../api/services/city-search.service');
        const cities = await CitySearchService.searchCities(query);
        setResults(cities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка поиска');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query]);

  const handleCitySelect = (city: CitySearchResult) => {
    onCitySelect(city);
    setQuery('');
    setResults([]);
    if (onClose) onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    if (onClose) onClose();
  };

  const renderContent = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-background">
        {/* Шапка с кнопкой закрытия */}
        <View className="flex-row justify-between items-center p-4 border-b-2 border-gray-800">
          <Text className="text-text-primary font-pixel text-lg">
            ПОИСК ГОРОДА
          </Text>
          <TouchableOpacity 
            onPress={handleClose}
            className="border-2 border-gray-800 p-2"
          >
            <Text className="text-text-secondary font-pixel">✕</Text>
          </TouchableOpacity>
        </View>

        {currentCity && (
          <View className="p-4 bg-card/50">
            <Text className="text-text-secondary font-pixel text-xs">
              ТЕКУЩИЙ: <Text className="text-primary font-pixel">{currentCity}</Text>
            </Text>
          </View>
        )}

        {/* Основной контент */}
        <View className="flex-1 p-4">
          <SearchInput
            query={query}
            onChangeText={setQuery}
          />

          <SearchStatus
            isLoading={isLoading}
            error={error}
            query={query}
            hasResults={results.length > 0}
          />

          {results.length > 0 && (
            <FlatList
              data={results}
              renderItem={({ item }) => (
                <CityItem
                  item={item}
                  onSelect={handleCitySelect}
                />
              )}
              keyExtractor={(item, index) => 
                `${item.lat}-${item.lon}-${index}`
              }
              className="flex-1"
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* <TouchableOpacity
            className="border-2 border-gray-800 bg-card p-4 items-center mt-4 active:opacity-80"
            onPress={handleClose}
          >
            <Text className="text-text-primary font-pixel">ОТМЕНА</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  if (visible === undefined) {
    return renderContent();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      {/* Полупрозрачный фон */}
      <View className="flex-1 bg-black/70 justify-end">
        {/* Модалка снизу - 85% высоты */}
        <View 
          className="bg-background rounded-t-2xl border-t-2 border-gray-800"
          style={{ height: height * 0.85 }}
        >
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};