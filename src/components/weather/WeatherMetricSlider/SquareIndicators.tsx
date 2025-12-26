import React from 'react';
import { View } from 'react-native';

interface SquareIndicatorsProps {
  count: number;
  activeIndex: number;
}

export const SquareIndicators: React.FC<SquareIndicatorsProps> = ({
  count,
  activeIndex,
}) => {
  return (
    <View className="flex-row justify-center items-center">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            width: index === activeIndex ? 10 : 8,
            height: index === activeIndex ? 10 : 8,
            backgroundColor: index === activeIndex ? '#4ecdc4' : '#8a8fa3',
            opacity: index === activeIndex ? 1 : 0.5,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: index === activeIndex ? '#3ab7ae' : '#6a6f83',
          }}
        />
      ))}
    </View>
  );
};