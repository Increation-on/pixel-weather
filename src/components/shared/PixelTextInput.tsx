import React, { useState, useEffect, useRef } from 'react';
import { TextInput, View, Text, Platform, Animated } from 'react-native';

interface PixelTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
  placeholderClassName?: string;
  textColor?: string;
  placeholderColor?: string;
  onFocus?: () => void; // Добавим для внешней обработки
  onBlur?: () => void; // Добавим для внешней обработки
}

export const PixelTextInput: React.FC<PixelTextInputProps> = ({
  value,
  onChangeText,
  placeholder = '',
  autoFocus = false,
  autoCapitalize = 'words',
  className = '',
  textColor = '#e0e0e0',
  placeholderColor = '#8a8fa3',
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(1)).current;
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  useEffect(() => {
    if (isFocused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 530,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 530,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.stopAnimation();
      animatedValue.setValue(0);
    }
  }, [isFocused]);
  
  const calculateCaretPosition = () => {
    const charWidth = 11; // Ваше значение
    return value.length * charWidth;
  };

  return (
    <View className={`relative ${className}`} style={{ height: 24 }}>
      {/* 👉 TextInput: ТОЛЬКО ДЛЯ ВВОДА, полностью прозрачный */}
      <TextInput
        ref={textInputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder="" // Пустой, используем свой
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        onFocus={handleFocus}
        onBlur={handleBlur}
        cursorColor="transparent"
        selectionColor="transparent"
        style={{
          // 👉 ВАЖНО: Полностью прозрачный, но функциональный
          opacity: 0,
          position: 'absolute',
          width: '100%',
          height: 24,
          padding: 0,
          margin: 0,
          zIndex: 10,
          // Все остальные стили можно убрать, они не видны
        }}
      />
      
      {/* 👉 ЕДИНСТВЕННЫЙ видимый текст */}
      <View className="absolute top-0 left-0" style={{ height: 24 }}>
        {value ? (
          <Text
            style={{
              fontFamily: 'PressStart2P-Regular',
              fontSize: Platform.OS === 'ios' ? 12 : 11,
              lineHeight: 24,
              color: textColor,
              // 👉 Важно: включаем отступы как у TextInput
              includeFontPadding: false,
              textAlignVertical: 'top',
            }}
          >
            {value}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: 'PressStart2P-Regular',
              fontSize: Platform.OS === 'ios' ? 12 : 11,
              lineHeight: 24,
              color: placeholderColor,
              includeFontPadding: false,
              textAlignVertical: 'top',
            }}
          >
            {placeholder}
          </Text>
        )}
      </View>
      
      {/* Кастомная каретка */}
      {isFocused && (
        <Animated.View
          style={{
            position: 'absolute',
            left: calculateCaretPosition(),
            top: 2,
            width: 3,
            height: 18,
            backgroundColor: '#4ecdc4',
            opacity: animatedValue,
            zIndex: 20,
          }}
        />
      )}
    </View>
  );
};