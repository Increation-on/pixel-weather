// components/weather/PrecipitationAnimation.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import PixelRain from './PixelRain';
import PixelSnow from './PixelSnow';
import PixelLightning from './PixelLightNing';
import PixelSunSparkles from './PixelSunSparkles';
import PixelClouds from './PixelClouds';

// Убираем 'night' из погодных состояний
export type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'thunderstorm'
  | 'foggy';
// 'night' убран - это время суток, не погода

interface PrecipitationAnimationProps {
  weatherType: WeatherType;
  intensity?: 'light' | 'medium' | 'heavy';
}

export default function PrecipitationAnimation({
  weatherType,
  intensity = 'medium'
}: PrecipitationAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [weatherType]);

  if (!isVisible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Дождь для rainy и thunderstorm */}
      {(weatherType === 'rainy' || weatherType === 'thunderstorm') && (
        <PixelRain intensity={intensity} />
      )}

      {/* Снег для snowy */}
      {weatherType === 'snowy' && (
        <PixelSnow intensity={intensity} />
      )}

      {/* Молния только для грозы */}
      {weatherType === 'thunderstorm' && (
        <PixelLightning intensity={intensity} />
      )}

      {/* Молния только для грозы */}
      {weatherType === 'sunny' && (
        <PixelSunSparkles />
      )}

      {weatherType === 'cloudy' && (
        <PixelClouds />
      )}

      {/* Туман */}
      {weatherType === 'foggy' && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none',
          }}
        />
      )}
    </View>
  );
}