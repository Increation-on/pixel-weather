// app/WeatherSettings.tsx
import {
    View,
    Text,
    Switch,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useSettings } from '@/src/contexts/SettingContext';
// 🚫 УДАЛЯЕМ: import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
import * as Notifications from 'expo-notifications'; // ✅ Добавляем для разрешений

export default function WeatherSettings() {
    const {
        settings,
        toggleTemperatureUnit,
        toggleTheme,
        toggleNotifications
    } = useSettings();

    const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

    useEffect(() => {
        loadPermissionStatus();
    }, []);

    const loadPermissionStatus = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setPermissionStatus(status);
            console.log('📱 Статус разрешений:', status);
        } catch (error) {
            console.error('❌ Ошибка загрузки статуса разрешений:', error);
        }
    };

    const handleToggleNotifications = async (value: boolean) => {
        try {
            if (value) {
                // Запрашиваем разрешения напрямую через Notifications
                const { status } = await Notifications.requestPermissionsAsync();
                
                if (status !== 'granted') {
                    setPermissionStatus(status);
                    console.log('🔕 Разрешение не получено');
                    return; // Не включаем уведомления
                }
                setPermissionStatus('granted');
            }
            
            // Меняем настройки через контекст
            await toggleNotifications(value);
            console.log(`🔔 Уведомления ${value ? 'включены' : 'выключены'}`);
            
        } catch (error) {
            console.error('❌ Ошибка переключения уведомлений:', error);
        }
    };

    const handleRequestPermission = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status);

        if (status === 'granted') {
            await toggleNotifications(true);
            console.log('✅ Разрешение получено, уведомления включены');
        }
    };

    const getPermissionText = () => {
        if (Constants.appOwnership === 'expo') {
            return '📱 EXPO GO (PUSH НЕДОСТУПЕН)';
        }

        switch (permissionStatus) {
            case 'granted': return '✅ РАЗРЕШЕНО';
            case 'denied': return '❌ ОТКЛОНЕНО';
            default: return '❓ НЕ ЗАПРАШИВАЛОСЬ';
        }
    };

    const shouldShowRequestButton = () => {
        if (Constants.appOwnership === 'expo') {
            return false;
        }
        return permissionStatus === 'denied' && !settings.notifications;
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar
                barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={settings.theme === 'dark' ? '#1a1f2e' : '#f8fafc'}
                translucent={false}
            />

            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6 mt-8">
                    <View className="flex-row items-center mb-2">
                        <Image
                            source={require('@/assets/icons/settings.png')}
                            style={{ width: 48, height: 48, marginRight: 12 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-text-primary text-3xl">НАСТРОЙКИ</Text>
                    </View>
                </View>

                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/notification.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-text-primary text-xl">УВЕДОМЛЕНИЯ</Text>
                    </View>

                    <View className="bg-card rounded-lg p-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-text-primary text-base mb-1">
                                    УВЕДОМЛЕНИЯ О ПОГОДЕ
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ОПОВЕЩЕНИЯ ОБ ИЗМЕНЕНИИ ТЕМПЕРАТУРЫ И ОСАДКОВ
                                </Text>
                            </View>
                            <Switch
                                value={settings.notifications}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={settings.notifications ? '#f7fff7' : '#f4f3f4'}
                                disabled={permissionStatus === 'denied' && !settings.notifications}
                            />
                        </View>

                        <View className="mt-3 p-2 bg-background/50 rounded">
                            <Text className="font-pixel text-text-secondary text-xs mb-1">
                                СТАТУС РАЗРЕШЕНИЙ: {getPermissionText()}
                            </Text>
                            <Text className="font-pixel text-text-secondary text-xs">
                                УВЕДОМЛЕНИЯ: {settings.notifications ? '✅ ВКЛЮЧЕНЫ' : '❌ ВЫКЛЮЧЕНЫ'}
                            </Text>

                            {shouldShowRequestButton() && (
                                <TouchableOpacity
                                    className="mt-2 p-2 bg-primary/20 rounded border border-primary"
                                    onPress={handleRequestPermission}
                                >
                                    <Text className="font-pixel text-primary text-xs text-center">
                                        ЗАПРОСИТЬ РАЗРЕШЕНИЕ СНОВА
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/pallete.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-text-primary text-xl">ВНЕШНИЙ ВИД</Text>
                    </View>

                    <View className="bg-card rounded-lg p-4 mb-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-text-primary text-base mb-1">
                                    ТЕМНАЯ ТЕМА
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ПЕРЕКЛЮЧЕНИЕ МЕЖДУ СВЕТЛОЙ И ТЕМНОЙ ТЕМОЙ
                                </Text>
                            </View>
                            <Switch
                                value={settings.theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={settings.theme === 'dark' ? '#f7fff7' : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    <View className="bg-card rounded-lg p-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-text-primary text-base mb-1">
                                    ГРАДУСЫ ЦЕЛЬСИЯ
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ПОКАЗЫВАТЬ ТЕМПЕРАТУРУ В °C ВМЕСТО °F
                                </Text>
                            </View>
                            <Switch
                                value={settings.temperatureUnit === 'celsius'}
                                onValueChange={toggleTemperatureUnit}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={settings.temperatureUnit === 'celsius' ? '#f7fff7' : '#f4f3f4'}
                            />
                        </View>

                        <View className="mt-3 flex-row space-x-2">
                            <View className={`flex-1 p-2 rounded ${settings.temperatureUnit === 'celsius' ? 'bg-primary' : 'bg-background/50'}`}>
                                <Text className={`font-pixel text-center ${settings.temperatureUnit === 'celsius' ? 'text-white' : 'text-text-secondary'} text-xs`}>
                                    °C
                                </Text>
                            </View>
                            <View className={`flex-1 p-2 rounded ${settings.temperatureUnit === 'fahrenheit' ? 'bg-primary' : 'bg-background/50'}`}>
                                <Text className={`font-pixel text-center ${settings.temperatureUnit === 'fahrenheit' ? 'text-white' : 'text-text-secondary'} text-xs`}>
                                    °F
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/info.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-text-primary text-xl">ИНФОРМАЦИЯ</Text>
                    </View>

                    <View className="bg-card/70 rounded-lg p-4 border border-card">
                        <Text className="font-pixel text-text-secondary text-sm mb-2">
                            ℹ️ УВЕДОМЛЕНИЯ ТРЕБУЮТ РАЗРЕШЕНИЯ
                        </Text>
                        <Text className="font-pixel text-text-secondary text-sm">
                            🔔 СЕРВЕР ПРОВЕРЯЕТ ПОГОДУ КАЖДЫЕ 30 МИНУТ
                        </Text>

                        {Constants.appOwnership === 'expo' && (
                            <Text className="font-pixel text-yellow-400 text-sm mt-2">
                                ⚠️ EXPO GO: PUSH-УВЕДОМЛЕНИЯ НЕДОСТУПНЫ
                            </Text>
                        )}

                        {Constants.appOwnership !== 'expo' && permissionStatus === 'denied' && (
                            <Text className="font-pixel text-red-400 text-sm mt-2">
                                ⚠️ РАЗРЕШЕНИЕ ОТКЛОНЕНО. ЗАЙДИТЕ В НАСТРОЙКИ УСТРОЙСТВА.
                            </Text>
                        )}

                        {Constants.appOwnership !== 'expo' && permissionStatus === 'granted' && (
                            <Text className="font-pixel text-green-400 text-sm mt-2">
                                ✅ PUSH-УВЕДОМЛЕНИЯ ДОСТУПНЫ
                            </Text>
                        )}
                    </View>
                </View>

                <View className="mt-4 mb-8">
                    <Link href="/" asChild>
                        <TouchableOpacity className="bg-card border-2 border-primary rounded-lg p-4 active:opacity-80">
                            <Text className="font-pixel text-primary text-center text-base">
                                ← НАЗАД К ПОГОДЕ
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <View className="mt-12 pt-6 border-t border-card/50">
                    <Text className="font-pixel text-text-secondary text-xs text-center">
                        PIXEL WEATHER v1.0
                    </Text>
                    <Text className="font-pixel text-text-secondary text-xs text-center mt-1">
                        RETRO WEATHER APP
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}