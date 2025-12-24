// components/weather/PixelLightFlicker.tsx
import { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PixelClouds() {
  const opacity = useRef(new Animated.Value(0.05)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        // Появление
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 3000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
        // Исчезновение
        Animated.timing(opacity, {
          toValue: 0.05,
          duration: 2000 + Math.random() * 3000,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setTimeout(animate, 1000 + Math.random() * 2000);
      });
    };

    animate();
    return () => opacity.stopAnimation();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        opacity: opacity,
        pointerEvents: 'none',
      }}
    />
  );
}