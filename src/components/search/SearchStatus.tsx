// src/components/weather/SearchStatus.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface SearchStatusProps {
  isLoading: boolean;
  error: string | null;
  query: string;
  hasResults: boolean;
  themeClass?: string; // ⭐ ДОБАВЛЯЕМ
}

export const SearchStatus: React.FC<SearchStatusProps> = ({
  isLoading,
  error,
  query,
  hasResults,
  themeClass = '',
}) => {
  if (isLoading) {
    return (
      <View className={`py-8 items-center ${themeClass}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className={`text-gray-400 font-pixel mt-4 ${themeClass}`}>
          Ищем города...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`py-8 items-center ${themeClass}`}>
        <Text className="text-red-400 font-pixel">❌ {error}</Text>
      </View>
    );
  }

  if (query.length < 2) {
    return (
      <View className={`py-8 items-center ${themeClass}`}>
        <Text className={`text-gray-400 font-pixel text-xs ${themeClass}`}>
          Введите хотя бы 2 символа для поиска
        </Text>
      </View>
    );
  }

  if (!hasResults && query.length >= 2) {
    return (
      <View className={`py-8 items-center ${themeClass}`}>
        <Text className={`text-gray-400 font-pixel ${themeClass}`}>
          Город не найден. Попробуйте другое название.
        </Text>
      </View>
    );
  }

  return null;
};