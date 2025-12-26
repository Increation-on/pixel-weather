import React, { useRef, useState } from 'react';
import { 
  View, 
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { WeatherMetricCard } from '../WeatherMetricCard';
import { SquareIndicators } from './SquareIndicators';
import { createWeatherParams } from '@/src/utils/weatherMetrics';

interface WeatherMetricsSliderProps {
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  humidity?: number;
  windSpeed?: number;
}

export const WeatherMetricsSlider: React.FC<WeatherMetricsSliderProps> = ({
  pressure,
  visibility,
  uvIndex,
  humidity,
  windSpeed,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const containerWidth = Math.min(screenWidth * 0.9, 400);
  
  // Создаем метрики один раз
  const metrics = createWeatherParams({
    pressure,
    visibility,
    uvIndex,
    humidity,
    windSpeed,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    
    if (index >= 0 && index < metrics.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View
      className="mt-4 bg-card border-2 border-gray-600"
      style={{
        width: containerWidth,
        alignSelf: 'center',
        height: 180,
        position: 'relative',
      }}
    >
      {/* Карусель метрик */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: containerWidth * metrics.length }}
        nestedScrollEnabled
        decelerationRate="fast"
      >
        {metrics.map((metric) => (
          <View
            key={metric.id}
            style={{
              width: containerWidth,
              paddingHorizontal: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <WeatherMetricCard {...metric} />
          </View>
        ))}
      </ScrollView>

      {/* Индикаторы */}
      <View className="absolute bottom-3 left-0 right-0" style={{ zIndex: 10 }}>
        <SquareIndicators count={metrics.length} activeIndex={activeIndex} />
      </View>
    </View>
  );
};