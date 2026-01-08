import React from 'react';
import { TextInput, View, Text, Platform } from 'react-native';

interface PixelTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
  placeholderClassName?: string;
  // ⭐ ДОБАВЛЯЕМ НОВЫЕ ПРОПСЫ
  textColor?: string;
  placeholderColor?: string;
}

export const PixelTextInput: React.FC<PixelTextInputProps> = ({
  value,
  onChangeText,
  placeholder = '',
  autoFocus = false,
  autoCapitalize = 'words',
  className = '',
  placeholderClassName = '',
  // ⭐ НОВЫЕ ПРОПСЫ С ЗНАЧЕНИЯМИ ПО УМОЛЧАНИЮ
  textColor = '#e0e0e0', // По умолчанию для тёмной темы
  placeholderColor = '#8a8fa3', // По умолчанию для тёмной темы
}) => {
  return (
    <View className={`relative ${className}`}>
      {/* Настоящий TextInput (без placeholder) */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        style={{
          fontFamily: 'PressStart2P-Regular',
          fontSize: Platform.OS === 'ios' ? 12 : 11,
          // ⭐ ИСПОЛЬЗУЕМ ПЕРЕМЕННУЮ textColor
          color: textColor,
          height: 24,
          padding: 0,
          margin: 0,
          includeFontPadding: false,
          opacity: value ? 1 : 0,
        }}
      />
      
      {/* Кастомный pixel placeholder */}
      {!value && (
        <View 
          pointerEvents="none"
          className="absolute top-0 left-0 right-0"
        >
          <Text
            // ⭐ ДОБАВЛЯЕМ ИНЛАЙН СТИЛЬ ДЛЯ ЦВЕТА
            style={{
              fontFamily: 'PressStart2P-Regular',
              fontSize: Platform.OS === 'ios' ? 12 : 11,
              lineHeight: 24,
              // ⭐ ИСПОЛЬЗУЕМ ПЕРЕМЕННУЮ placeholderColor
              color: placeholderColor,
            }}
          >
            {placeholder}
          </Text>
        </View>
      )}
    </View>
  );
};