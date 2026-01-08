// SearchInput.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { PixelTextInput } from '../shared/PixelTextInput';
import { useSettings } from '@/src/contexts/SettingContext'; // ⭐ ДОБАВЬ ИМПОРТ

interface SearchInputProps {
  query: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  themeClass?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onChangeText,
  placeholder = 'ВВЕДИТЕ НАЗВАНИЕ ГОРОДА...',
  themeClass = '',
}) => {
  // ⭐ ПОЛУЧАЕМ НАСТРОЙКИ
  const { settings } = useSettings();
  
  // ⭐ ОПРЕДЕЛЯЕМ ЦВЕТА ПО ТЕМЕ
  const textColor = settings.theme === 'light' ? '#1a202c' : '#e0e0e0';
  const placeholderColor = settings.theme === 'light' ? '#718096' : '#8a8fa3';
  
  return (
    <View className={`flex-row items-center bg-card border-2 border-gray-800 px-4 py-2 mb-4 ${themeClass}`}>
      <PixelTextInput
        value={query}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={true}
        className="flex-1"
        // ⭐ ПЕРЕДАЁМ ЦВЕТА В ПРОПСЫ
        textColor={textColor}
        placeholderColor={placeholderColor}
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