// src/components/weather/ForecastDayCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '@/src/contexts/SettingContext';
import { formatTemperatureForDisplay } from '@/src/utils/temperature';
import WeatherPixelIcon, {WeatherType} from '@/src/components/weather/WeatherPixelIcon';
import PrecipitationAnimation from '@/src/components/weather/animations/PrecipitationAnimation';

interface ForecastDay {
    time: string;
    dayOfWeek: string;
    weatherDescription: string;
    temperatureMax: number;
    temperatureMin: number;
}

interface ForecastDayCardProps {
    day: ForecastDay;
    iconType: WeatherType;
}

export const ForecastDayCard: React.FC<ForecastDayCardProps> = ({
    day,
    iconType,
}) => {
    const { settings } = useSettings();
    
    const getIntensity = () => {
        const desc = day.weatherDescription.toLowerCase();
        if (desc.includes('сильный') || desc.includes('ливень')) return 'heavy';
        if (desc.includes('слабый')) return 'light';
        return 'medium';
    };

    // Форматируем температуры - ОБА с showUnit: true!
    const displayMaxTemp = formatTemperatureForDisplay(day.temperatureMax, settings.temperatureUnit, {
        showUnit: true, // Получим "25°C" или "77°F"
        decimals: 0
    });
    
    const displayMinTemp = formatTemperatureForDisplay(day.temperatureMin, settings.temperatureUnit, {
        showUnit: true, // И здесь тоже true! Получим "18°C" или "64°F"
        decimals: 0
    });

    return (
        <View className="bg-card border-2 border-gray-800 p-4 mb-3 overflow-hidden relative">
            <View
                className="absolute top-0 left-0 right-0 h-28"
                style={{ opacity: 0.4 }}
                pointerEvents="none"
            >
                <PrecipitationAnimation
                    weatherType={iconType}
                    intensity={getIntensity()}
                />
            </View>

            <View className="relative z-10">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-text-primary font-pixel text-base mb-1">
                            {day.dayOfWeek.toUpperCase()}
                        </Text>
                        <Text className="text-text-secondary font-pixel text-xs mt-5">
                            {day.time}
                        </Text>
                    </View>

                    <View className="mr-2">
                        <WeatherPixelIcon type={iconType} size={48} />
                    </View>

                    <View className="w-38">
                        {/* УБИРАЕМ ЛИШНИЙ ° в конце! */}
                        <View className="flex-row justify-end">
                            <Text className="text-primary font-pixel text-2xl">
                                {displayMaxTemp} {/* ← БЕЗ °! */}
                            </Text>
                        </View>
                        
                        {/* УБИРАЕМ ЛИШНИЙ ° в конце! */}
                        <View className="flex-row justify-end mt-5">
                            <Text className="text-text-secondary font-pixel text-xs">
                                МИН: {displayMinTemp} {/* ← БЕЗ °! */}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mt-3 pt-3 border-t-2 border-gray-800">
                    <Text className="text-text-primary font-pixel text-xs text-center">
                        {day.weatherDescription.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
    );
};