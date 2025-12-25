// src/components/weather/SearchStatus.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface SearchStatusProps {
  isLoading: boolean;
  error: string | null;
  query: string;
  hasResults: boolean;
}

export const SearchStatus: React.FC<SearchStatusProps> = ({
  isLoading,
  error,
  query,
  hasResults,
}) => {
  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-400 font-pixel mt-4">Ищем города...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 items-center">
        <Text className="text-red-400 font-pixel">❌ {error}</Text>
      </View>
    );
  }

  if (query.length < 2) {
    return (
      <View className="py-8 items-center">
        <Text className="text-gray-400 font-pixel text-xs">
          Введите хотя бы 2 символа для поиска
        </Text>
      </View>
    );
  }

  if (!hasResults && query.length >= 2) {
    return (
      <View className="py-8 items-center">
        <Text className="text-gray-400 font-pixel">
          Город не найден. Попробуйте другое название.
        </Text>
      </View>
    );
  }

  return null;
};