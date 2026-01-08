// src/components/weather/CityItem.tsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { CitySearchResult } from '../../api/services/city-search.service';

interface CityItemProps {
  item: CitySearchResult;
  onSelect: (city: CitySearchResult) => void;
  themeClass?: string;
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
      className={`border-b border-gray-800 p-4 bg-card`}  // Изменил border-gray-700 на border-gray-800
      onPress={() => onSelect(item)}
    >
      {/* ⭐ ИЗМЕНИЛ text-white на text-text-primary ⭐ */}
      <Text className={`text-text-primary font-pixel text-base mb-1`}>
        {item.city || 'Неизвестный город'}
      </Text>
      
      {/* ⭐ ИЗМЕНИЛ text-gray-400 на text-text-secondary ⭐ */}
      <Text className={`text-text-secondary font-pixel text-sm mb-1`}>
        {item.country && `${item.country} • `}
        {getTypeText(item.type)}
      </Text>
      
      {/* ⭐ ИЗМЕНИЛ text-gray-500 на text-text-secondary/80 ⭐ */}
      <Text className={`text-text-secondary/80 font-pixel text-xs`}>
        {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );
};