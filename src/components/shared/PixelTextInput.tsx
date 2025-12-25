// src/components/shared/PixelTextInput.tsx
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
}

export const PixelTextInput: React.FC<PixelTextInputProps> = ({
  value,
  onChangeText,
  placeholder = '',
  autoFocus = false,
  autoCapitalize = 'words',
  className = '',
  placeholderClassName = '',
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
          color: '#e0e0e0',
          height: 24,
          padding: 0,
          margin: 0,
          includeFontPadding: false,
          opacity: value ? 1 : 0, // Прячем когда пустой (чтобы был виден placeholder)
        }}
      />
      
      {/* Кастомный pixel placeholder */}
      {!value && (
        <View 
          pointerEvents="none"
          className="absolute top-0 left-0 right-0"
        >
          <Text
            className={`text-text-secondary ${placeholderClassName}`}
            style={{
              fontFamily: 'PressStart2P-Regular',
              fontSize: Platform.OS === 'ios' ? 12 : 11,
              lineHeight: 24,
            }}
          >
            {placeholder}
          </Text>
        </View>
      )}
    </View>
  );
};