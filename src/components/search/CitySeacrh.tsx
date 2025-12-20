import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { CitySearchResult } from '../../api/services/city-search.service';

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
        // Импортируем сервис динамически чтобы избежать циклических зависимостей
        const { CitySearchService } = await import('../../api/services/city-search.service');
        const cities = await CitySearchService.searchCities(query);
        setResults(cities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка поиска');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

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

  const renderCityItem = ({ item }: { item: CitySearchResult }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item)}
    >
      <Text style={styles.cityName}>
        {item.city || 'Неизвестный город'}
      </Text>
      <Text style={styles.cityDetails}>
        {item.country && `${item.country} • `}
        {item.type === 'city' ? 'Город' : 
         item.type === 'town' ? 'Посёлок' : 
         item.type === 'village' ? 'Деревня' : 'Административный'}
      </Text>
      <Text style={styles.cityCoordinates}>
        {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Поиск города</Text>
          {currentCity && (
            <Text style={styles.currentCity}>
              Текущий: {currentCity}
            </Text>
          )}
        </View>

        {/* Поле поиска */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Введите название города..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            autoCapitalize="words"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Состояния */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.messageText}>Ищем города...</Text>
          </View>
        )}

        {error && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {!isLoading && !error && query.length < 2 && (
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>
              Введите хотя бы 2 символа для поиска
            </Text>
          </View>
        )}

        {!isLoading && !error && results.length === 0 && query.length >= 2 && (
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>
              Город не найден. Попробуйте другое название.
            </Text>
          </View>
        )}

        {/* Результаты */}
        {results.length > 0 && (
          <FlatList
            data={results}
            renderItem={renderCityItem}
            keyExtractor={(item, index) => 
              `${item.lat}-${item.lon}-${index}`
            }
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Кнопка отмены */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );

  // Если visible не передано, рендерим как встроенный компонент
  if (visible === undefined) {
    return renderContent();
  }

  // Иначе рендерим как модалку
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  currentCity: {
    fontSize: 14,
    color: '#64748b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  resultsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cityDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  cityCoordinates: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
});