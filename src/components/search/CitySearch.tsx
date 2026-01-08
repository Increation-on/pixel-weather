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
  Dimensions,
} from 'react-native';
import { CitySearchResult } from '../../api/services/city-search.service';
import { CityItem } from './CityItem';
import { SearchInput } from './SearchInput';
import { SearchStatus } from './SearchStatus';
import { useSettings } from '@/src/contexts/SettingContext'; // ⭐ ДОБАВЛЯЕМ ИМПОРТ

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
  const { settings } = useSettings(); // ⭐ ПОЛУЧАЕМ НАСТРОЙКИ
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // ⭐ КЛАСС ТЕМЫ - ДИНАМИЧЕСКИЙ
  const themeClass = settings.theme === 'light' ? 'light-root' : 'dark-root';

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
      {/* ⭐ ДОБАВЛЯЕМ themeClass К ОСНОВНОМУ КОНТЕЙНЕРУ */}
      <View className={`flex-1 bg-background`}>
        {/* Шапка с кнопкой закрытия */}
        <View className={`flex-row justify-between items-center p-4 border-b-2 border-gray-800`}>
          <Text className={`text-text-primary font-pixel text-lg`}>
            ПОИСК ГОРОДА
          </Text>
          <TouchableOpacity 
            onPress={handleClose}
            className={`border-2 border-gray-800 p-2 ${themeClass}`}
          >
            <Text className={`text-text-secondary font-pixel`}>✕</Text>
          </TouchableOpacity>
        </View>

        {currentCity && (
          <View className={`p-4 bg-card/50 ${themeClass}`}>
            <Text className={`text-text-secondary font-pixel text-xs`}>
              ТЕКУЩИЙ: <Text className="text-primary font-pixel">{currentCity}</Text>
            </Text>
          </View>
        )}

        {/* Основной контент */}
        <View className={`flex-1 p-4 ${themeClass}`}>
          <SearchInput
            query={query}
            onChangeText={setQuery}
            themeClass={themeClass} // ⭐ ПЕРЕДАЁМ В ДОЧЕРНИЕ КОМПОНЕНТЫ
          />

          <SearchStatus
            isLoading={isLoading}
            error={error}
            query={query}
            hasResults={results.length > 0}
            themeClass={themeClass} // ⭐ ПЕРЕДАЁМ
          />

          {results.length > 0 && (
            <FlatList
              data={results}
              renderItem={({ item }) => (
                <CityItem
                  item={item}
                  onSelect={handleCitySelect}
                  themeClass={themeClass} // ⭐ ПЕРЕДАЁМ
                />
              )}
              keyExtractor={(item, index) => 
                `${item.lat}-${item.lon}-${index}`
              }
              className={`flex-1 ${themeClass}`}
              keyboardShouldPersistTaps="handled"
            />
          )}
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
      presentationStyle="overFullScreen"
    >
      {/* ⭐ ДОБАВЛЯЕМ themeClass НА ВСЕ КОНТЕЙНЕРЫ МОДАЛКИ */}
      <View className={`flex-1 bg-black/70 justify-end ${themeClass}`}>
        <View 
          className={`bg-background rounded-t-2xl border-t-2 border-gray-800 ${themeClass}`}
          style={{ height: height * 0.85 }}
        >
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};