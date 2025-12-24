// components/weather/PixelSnow.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface PixelSnowProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export default function PixelSnow({ intensity = 'medium' }: PixelSnowProps) {
  const flakeCount = {
    light: 25,
    medium: 50,
    heavy: 80
  }[intensity];
  
  const flakes = Array.from({ length: flakeCount }).map((_, index) => {
    // Используем useRef для сохранения анимаций
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const startY = -20 - Math.random() * 50;
      const endY = height + 50;
      const driftAmount = Math.random() * 60 - 30; // Случайный дрейф вбок
      
      // Начальные значения
      translateY.setValue(startY);
      translateX.setValue(0);
      opacity.setValue(0);

      // Анимация появления
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Функция падения снежинки
      const fallAnimation = () => {
        // Сбрасываем позицию
        translateY.setValue(startY);
        translateX.setValue(0);

        // Анимация падения с дрейфом
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: endY,
            duration: 4000 + Math.random() * 6000, // Разная скорость
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: driftAmount,
            duration: 4000 + Math.random() * 6000,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            // Бесконечный цикл
            fallAnimation();
          }
        });
      };

      // Запускаем анимацию с задержкой
      const delay = Math.random() * 3000;
      setTimeout(fallAnimation, delay);

      return () => {
        translateY.stopAnimation();
        translateX.stopAnimation();
        opacity.stopAnimation();
      };
    }, []);

    const left = Math.random() * width;
    const size = 2 + Math.random() * 3; // 2-5px (меньше для пиксельности)
    
    // Форма снежинки (пиксельный крестик)
    return (
      <Animated.View
        key={`snow-${index}`}
        style={{
          position: 'absolute',
          left,
          width: size * 3, // Шире для крестика
          height: size * 3, // Выше для крестика
          alignItems: 'center',
          justifyContent: 'center',
          transform: [
            { translateY: translateY },
            { translateX: translateX }
          ],
          opacity: opacity,
        }}
      >
        {/* Вертикальная линия снежинки */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size * 3,
            backgroundColor: '#FFFFFF',
            borderRadius: size / 2,
          }}
        />
        {/* Горизонтальная линия снежинки */}
        <View
          style={{
            position: 'absolute',
            width: size * 3,
            height: size,
            backgroundColor: '#FFFFFF',
            borderRadius: size / 2,
          }}
        />
      </Animated.View>
    );
  });

  return (
    <View 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}
    >
      {flakes}
    </View>
  );
}