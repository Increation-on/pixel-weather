// src/components/weather/SearchInput.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { PixelTextInput } from '../shared/PixelTextInput';

interface SearchInputProps {
  query: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  themeClass?: string; // ⭐ ДОБАВЛЯЕМ
}

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onChangeText,
  placeholder = 'ВВЕДИТЕ НАЗВАНИЕ ГОРОДА...',
  themeClass = '',
}) => {
  return (
    <View className={`flex-row items-center bg-card border-2 border-gray-800 px-4 py-2 mb-4 ${themeClass}`}>
      <PixelTextInput
        value={query}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={true}
        className="flex-1"
      />
      
      {query.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          className="ml-2 p-1"
        >
          <Text 
            className={`text-text-secondary ${themeClass}`}
            style={{ fontFamily: 'PressStart2P-Regular', fontSize: 16 }}
          >
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};