// components/weather/PixelRain.tsx
import { useEffect } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface PixelRainProps {
  intensity?: 'light' | 'medium' | 'heavy';
}

export default function PixelRain({ intensity = 'medium' }: PixelRainProps) {
  // Количество капель в зависимости от интенсивности
  const dropCount = {
    light: 20,
    medium: 40,
    heavy: 60
  }[intensity];

  // Создаем массив анимированных значений для каждой капли
  const drops = Array.from({ length: dropCount }).map((_, index) => {
    const animValue = new Animated.Value(0);
    
    // Запуск анимации для каждой капли
    useEffect(() => {
      const startDelay = Math.random() * 2000; // Случайная задержка старта
      
      const animate = () => {
        animValue.setValue(0); // Начальная позиция
        
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800 + Math.random() * 800, // Разная скорость
          useNativeDriver: true,
          delay: startDelay,
        }).start(({ finished }) => {
          if (finished) {
            animate(); // Бесконечный цикл
          }
        });
      };
      
      animate();
      
      return () => {
        animValue.stopAnimation();
      };
    }, []);

    // Случайная позиция по горизонтали
    const left = Math.random() * width;
    
    // Анимация падения с небольшим смещением
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, height + 50] // Падение сверху вниз
    });
    
    const translateX = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 10, 0] // Легкое смещение вбок
    });

    return (
      <Animated.View
        key={`rain-${index}`}
        style={{
          position: 'absolute',
          left,
          width: 2, // Тонкая пиксельная линия
          height: 10,
          backgroundColor: '#4A90E2', // Синий цвет дождя
          borderRadius: 1,
          transform: [{ translateY }, { translateX }],
          opacity: animValue.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0] // Появление и исчезновение
          }),
        }}
      />
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
        pointerEvents: 'none', // Чтобы не блокировал клики
      }}
    >
      {drops}
    </View>
  );
}