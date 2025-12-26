import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

interface WeatherMetricCardProps {
    icon: ImageSourcePropType; // Меняем string на ImageSourcePropType
    title: string;
    value: string | number;
    unit: string;
    description?: string;
}

export const WeatherMetricCard: React.FC<WeatherMetricCardProps> = ({
    icon,
    title,
    value,
    unit,
    description,
}) => {
    return (
        <View className="w-full flex-row items-center h-36 -mt-6">
            {/* Контейнер для иконки - фиксированной ширины, по центру вертикали */}
            <View className="w-16 items-center justify-center">
                {/* Заменяем Text на Image */}
                <Image 
                    source={icon}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                />
            </View>

            {/* Контент справа - занимает остальное пространство */}
            <View className="flex-1 pl-1 ">
                {/* Вертикальная колонка с распределением пространства */}
                <View className="h-full justify-between py-2 items-center">
                    {/* Заголовок вверху */}
                    <View>
                        <Text className="text-lg text-text-secondary font-pixel">
                            {title}
                        </Text>
                    </View>

                    {/* Большое значение посередине */}
                    <View className="items-center">
                        <Text className="text-3xl font-pixel text-text-primary">
                            {value}
                            {unit && <Text className="text-xl text-gray-300"> {unit}</Text>}
                        </Text>
                    </View>

                    {/* Описание внизу */}
                    {description && (
                        <View>
                            <Text className="text-sm text-text-secondary font-pixel">
                                {description}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};