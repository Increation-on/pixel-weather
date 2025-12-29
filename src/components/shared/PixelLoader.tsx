// src/components/ui/PixelLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface PixelLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white' | 'custom';
  customColor?: string;
  className?: string;
}

export const PixelLoader: React.FC<PixelLoaderProps> = ({
  size = 'medium',
  color = 'secondary',
  customColor,
  className = '',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  // Классы для размеров контейнера
  const containerClasses = {
    small: 'w-6 h-6',      // 24px
    medium: 'w-8 h-8',     // 32px
    large: 'w-12 h-12',    // 48px
  };

  // Классы для размера пикселей
  const pixelSizeClasses = {
    small: 'w-1.5 h-1.5',  // 6px
    medium: 'w-2 h-2',     // 8px
    large: 'w-3 h-3',      // 12px
  };

  // Отступы между пикселями
  const gapClasses = {
    small: '-top-1.5 -right-1.5 -bottom-1.5 -left-1.5',  // -6px
    medium: '-top-2 -right-2 -bottom-2 -left-2',         // -8px
    large: '-top-3 -right-3 -bottom-3 -left-3',          // -12px
  };

  // Цветовые классы
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    white: 'bg-white',
    custom: '',
  };

  const pixelColorClass = color === 'custom' ? '' : colorClasses[color];

  // Анимация вращения
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [spinValue]);

  // Интерполяция для вращения
  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Стиль для custom цвета
  const customStyle = color === 'custom' && customColor 
    ? { backgroundColor: customColor }
    : {};

  return (
    <View className={`relative items-center justify-center ${containerClasses[size]} ${className}`}>
      <Animated.View
        className="absolute w-full h-full"
        style={{ transform: [{ rotate }] }}
      >
        {/* Центральный пиксель */}
        <View 
          className={`absolute ${pixelSizeClasses[size]} ${pixelColorClass} left-1/2 top-1/2 -ml-1.5 -mt-1.5`}
          style={customStyle}
        />
        
        {/* Верхний пиксель */}
        <View 
          className={`absolute ${pixelSizeClasses[size]} ${pixelColorClass} left-1/2 top-0 ${gapClasses[size].split(' ')[0]} -ml-1.5`}
          style={customStyle}
        />
        
        {/* Правый пиксель */}
        <View 
          className={`absolute ${pixelSizeClasses[size]} ${pixelColorClass} right-0 top-1/2 ${gapClasses[size].split(' ')[1]} -mt-1.5`}
          style={customStyle}
        />
        
        {/* Нижний пиксель */}
        <View 
          className={`absolute ${pixelSizeClasses[size]} ${pixelColorClass} left-1/2 bottom-0 ${gapClasses[size].split(' ')[2]} -ml-1.5`}
          style={customStyle}
        />
        
        {/* Левый пиксель */}
        <View 
          className={`absolute ${pixelSizeClasses[size]} ${pixelColorClass} left-0 top-1/2 ${gapClasses[size].split(' ')[3]} -mt-1.5`}
          style={customStyle}
        />
      </Animated.View>
    </View>
  );
};