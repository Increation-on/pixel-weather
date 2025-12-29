// src/components/navigation/WeatherSlider.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { DataSourceInfo } from '../shared/DataSourceInfo';

const { width } = Dimensions.get('window');

interface WeatherSliderProps {
  children: React.ReactNode[];
}

export const WeatherSlider: React.FC<WeatherSliderProps> = ({
  children,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {children.map((child, index) => (
          <View key={index} style={{ width }} className="flex-1">
            {child}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center items-center py-4 border-gray-800 z-30 pointer-events-none border-2">
        {children.map((_, index) => (
          <View
            key={index}
            className={`mx-2 w-3 h-3 ${activeIndex === index ? 'bg-primary' : 'bg-text-secondary'}`}
            style={{
              transform: [{ rotate: '45deg' }]
            }}
          />
        ))}
      </View>
    </View>
  );
};