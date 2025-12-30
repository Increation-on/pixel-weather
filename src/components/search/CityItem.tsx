// src/components/weather/CityItem.tsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { CitySearchResult } from '../../api/services/city-search.service';

interface CityItemProps {
  item: CitySearchResult;
  onSelect: (city: CitySearchResult) => void;
  themeClass?: string; // ⭐ ДОБАВЛЯЕМ
}

export const CityItem: React.FC<CityItemProps> = ({ item, onSelect, themeClass = '' }) => {
  const getTypeText = (type: string) => {
    switch (type) {
      case 'city': return 'Город';
      case 'town': return 'Посёлок';
      case 'village': return 'Деревня';
      default: return 'Административный';
    }
  };

  return (
    <TouchableOpacity
      className={`border-b border-gray-700 p-4 ${themeClass}`}
      onPress={() => onSelect(item)}
    >
      <Text className={`text-white font-pixel text-base mb-1 ${themeClass}`}>
        {item.city || 'Неизвестный город'}
      </Text>
      <Text className={`text-gray-400 font-pixel text-sm mb-1 ${themeClass}`}>
        {item.country && `${item.country} • `}
        {getTypeText(item.type)}
      </Text>
      <Text className={`text-gray-500 font-pixel text-xs ${themeClass}`}>
        {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );
};