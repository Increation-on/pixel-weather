// components/weather/PixelSunSparkles.tsx
import { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PixelSunSparkles() {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(height * 0.1 + Math.random() * height * 0.3),
      opacity: new Animated.Value(0),
      size: 2 + Math.random() * 3,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        // Сброс
        particle.opacity.setValue(0);
        
        // Новая случайная позиция
        particle.x.setValue(Math.random() * width);
        particle.y.setValue(height * 0.1 + Math.random() * height * 0.3);
        
        // Анимация появления-исчезновения
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(particle.opacity, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setTimeout(animateParticle, 1000 + Math.random() * 3000);
          }
        });
      };
      
      setTimeout(animateParticle, index * 300);
    });
    
    return () => {
      particles.forEach(p => {
        p.x.stopAnimation();
        p.y.stopAnimation();
        p.opacity.stopAnimation();
      });
    };
  }, []);

  return (
    <>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: '#FFD700',
            borderRadius: particle.size / 2,
            opacity: particle.opacity,
          }}
        />
      ))}
    </>
  );
}