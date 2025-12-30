// src/components/shared/SettingsButton.tsx
import { TouchableOpacity, Image, Text } from 'react-native';
import { Link } from 'expo-router';


export const SettingsButton = ({ size = 32 }) => {
    return (
        <Link href='/WeatherSettings' asChild>
            <TouchableOpacity

                className="p-2 active:opacity-80"
            >
                {/* Вариант 1: Если есть иконка шестеренки */}
                <Image
                    source={require('@/assets/icons/settings.png')}
                    style={{ width: size, height: size }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </Link>

    );
};