// components/weather/PixelLightning.tsx - ИСПРАВЛЕННАЯ РАБОЧАЯ ВЕРСИЯ
import { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface PixelLightningProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export default function PixelLightning({ intensity = 'medium' }: PixelLightningProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flashSequence = () => {
      // СБРАСЫВАЕМ все анимации к начальным значениям
      opacity.setValue(0);

      // Случайная позиция для этой вспышки
      const randomX = Math.random() * width * 0.8;
      const randomY = Math.random() * height * 0.3;

      translateX.setValue(randomX);
      translateY.setValue(randomY);

      // ПОСЛЕДОВАТЕЛЬНОСТЬ ВСПЫШЕК
      Animated.sequence([
        // 1. Первая яркая вспышка
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 120,
          useNativeDriver: true,
        }),

        // 2. Вторая вспышка (если интенсивность medium/heavy)
        ...(intensity !== 'light' ? [
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: 100,
            useNativeDriver: true,
          }),
        ] : []),

        // 3. Третья вспышка (только для heavy)
        ...(intensity === 'heavy' ? [
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ] : [
          // Завершение для light/medium
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          // Задержка до следующей молнии
          const delays = {
            light: 3000 + Math.random() * 4000,
            medium: 2000 + Math.random() * 3000,
            heavy: 1000 + Math.random() * 2000,
          };

          setTimeout(flashSequence, delays[intensity]);
        }
      });
    };

    // Первая вспышка с задержкой
    const initialDelay = 1000 + Math.random() * 2000;
    const timeoutId = setTimeout(flashSequence, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      opacity.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();
    };
  }, [intensity]);

  // ПРОСТАЯ ПИКСЕЛЬНАЯ МОЛНИЯ (надежная)
  const lightningBolt = (
    <View style={{ alignItems: 'flex-start' }}>
      {/* Вертикальный зигзаг */}
      <View style={{
        width: 4,
        height: 150,
        backgroundColor: '#FFFF00',
        marginLeft: 0,
      }} />
      <View style={{
        width: 12,
        height: 4,
        backgroundColor: '#FFFF00',
        marginLeft: 8,
      }} />
      <View style={{
        width: 4,
        height: 20,
        backgroundColor: '#FFFF00',
        marginLeft: 4,
      }} />
      <View style={{
        width: 10,
        height: 4,
        backgroundColor: '#FFFF00',
        marginLeft: 0,
      }} />
      <View style={{
        width: 4,
        height: 30,
        backgroundColor: '#FFFF00',
        marginLeft: 6,
      }} />
    </View>
  );

  return (
    <Animated.View
      style={{
        position: 'absolute',
        // УБИРАЕМ left: 0 и top: 0
        transform: [
          { translateX: translateX },
          { translateY: translateY },
        ],
        opacity: opacity,
      }}
    >
      {lightningBolt}

      {/* Легкое свечение */}
      <Animated.View
        style={{
          position: 'absolute',
          // УБИРАЕМ top: -5, left: -5
          right: -5, // оставляем
          bottom: -5, // оставляем
          backgroundColor: '#FFFF00',
          borderRadius: 8,
          opacity: opacity.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.15, 0],
          }),
        }}
      />
    </Animated.View>
  );
}